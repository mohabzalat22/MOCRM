<?php

namespace App\Http\Controllers;

use App\Actions\Projects\CreateProjectUpdate;
use App\Actions\Tags\AttachTagToModel;
use App\Enums\ProjectStatus;
use App\Enums\TaskStatus;
use App\Http\Requests\CreateProjectRequest;
use App\Http\Requests\UpdateProjectRequest;
use App\Models\Client;
use App\Models\Project;
use App\Models\Tag;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProjectController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $projects = Project::with(['client', 'tags'])
            ->withCount(['tasks', 'tasks as completed_tasks_count' => function ($query) {
                $query->where('status', TaskStatus::DONE);
            }])
            ->whereHas('client', function ($query) {
                $query->where('user_id', auth()->id());
            })
            ->orderBy('created_at', 'desc')
            ->get();

        $clients = Client::forUser()->orderBy('name')->get(['id', 'name']);

        return Inertia::render('projects/index', [
            'projects' => $projects,
            'clients' => $clients,
            'allTags' => Tag::orderBy('name')->get(),
            'statuses' => ProjectStatus::values(),
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(Project $project): Response
    {
        $project->load([
            'client',
            'tags',
            'tasks' => function ($query) {
                $query->ordered();
            },
            'activities' => function ($query) {
                $query->with(['user', 'attachments'])->latest();
            },
        ]);

        if ($project->client->user_id !== auth()->id()) {
            abort(403);
        }

        // Get sibling projects for quick switcher
        $siblingProjects = Project::where('client_id', $project->client_id)
            ->where('id', '!=', $project->id)
            ->whereIn('status', [
                ProjectStatus::NOT_STARTED->value,
                ProjectStatus::IN_PROGRESS->value,
                ProjectStatus::ON_HOLD->value,
            ])
            ->select('id', 'name', 'status')
            ->get();

        return Inertia::render('projects/show', [
            'project' => $project,
            'siblingProjects' => $siblingProjects,
            'allTags' => Tag::orderBy('name')->get(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(CreateProjectRequest $request, AttachTagToModel $attachTag): RedirectResponse
    {
        $validated = $request->validated();
        $projectData = collect($validated)->except('tags')->toArray();

        $project = Project::create($projectData);

        if (isset($validated['tags'])) {
            foreach ($validated['tags'] as $tagData) {
                $attachTag->execute(
                    $project,
                    $tagData['name'],
                    $tagData['color'] ?? null
                );
            }
        }

        return back()->with('success', 'Project created successfully.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateProjectRequest $request, Project $project, AttachTagToModel $attachTag): RedirectResponse
    {
        // Ensure the project belongs to the authenticated user's client
        $project->load('client');
        if ($project->client->user_id !== auth()->id()) {
            abort(403);
        }

        $validated = $request->validated();
        $projectData = collect($validated)->except('tags')->toArray();

        $project->update($projectData);

        if (isset($validated['tags'])) {
            $tagIds = [];
            foreach ($validated['tags'] as $tagData) {
                $tag = $attachTag->execute(
                    $project,
                    $tagData['name'],
                    $tagData['color'] ?? null
                );
                $tagIds[] = $tag->id;
            }
            // Sync to remove any tags that were in our current list but not in the request
            $project->tags()->sync($tagIds);
        }

        return back()->with('success', 'Project updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Project $project): RedirectResponse
    {
        // Ensure the project belongs to the authenticated user's client
        $project->load('client');
        if ($project->client->user_id !== auth()->id()) {
            abort(403);
        }

        $project->delete();

        return back()->with('success', 'Project deleted successfully.');
    }

    /**
     * Store a project update (activity with attachments).
     */
    public function storeUpdate(Request $request, Project $project, CreateProjectUpdate $createProjectUpdate): RedirectResponse
    {
        $project->load('client');
        if ($project->client->user_id !== auth()->id()) {
            abort(403);
        }

        $request->validate([
            'content' => 'required|string',
            'files.*' => 'nullable|file|max:10240', // 10MB limit
        ]);

        $createProjectUpdate->execute($project, $request->all());

        return back()->with('success', 'Project update added successfully.');
    }
}
