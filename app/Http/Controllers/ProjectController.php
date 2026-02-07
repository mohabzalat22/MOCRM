<?php

namespace App\Http\Controllers;

use App\Http\Requests\CreateProjectRequest;
use App\Http\Requests\UpdateProjectRequest;
use App\Models\Client;
use App\Models\Project;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ProjectController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        $projects = Project::with('client')
            ->whereHas('client', function ($query) {
                $query->where('user_id', auth()->id());
            })
            ->orderBy('created_at', 'desc')
            ->get();

        $clients = Client::forUser()->orderBy('name')->get(['id', 'name']);

        return Inertia::render('projects/index', [
            'projects' => $projects,
            'clients' => $clients,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(CreateProjectRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        Project::create($validated);

        return back()->with('success', 'Project created successfully.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateProjectRequest $request, Project $project): RedirectResponse
    {
        // Ensure the project belongs to the authenticated user's client
        $project->load('client');
        if ($project->client->user_id !== auth()->id()) {
            abort(403);
        }

        $validated = $request->validated();
        $project->update($validated);

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
}
