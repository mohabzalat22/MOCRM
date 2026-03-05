<?php

namespace App\Http\Controllers;

use App\Http\Requests\CreateProjectFromTemplateRequest;
use App\Http\Requests\CreateProjectTemplateRequest;
use App\Http\Requests\UpdateProjectTemplateRequest;
use App\Models\Project;
use App\Models\ProjectTemplate;
use App\Models\Task;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ProjectTemplateController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        return Inertia::render('project-templates/index', [
            'templates' => ProjectTemplate::withCount('tasks')->get(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(CreateProjectTemplateRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        ProjectTemplate::create($validated);

        return back()->with('success', 'Template created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(ProjectTemplate $projectTemplate): Response
    {
        $projectTemplate->load(['tasks' => function ($query) {
            $query->orderBy('order')->orderBy('created_at');
        }]);

        return Inertia::render('project-templates/show', [
            'template' => $projectTemplate,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateProjectTemplateRequest $request, ProjectTemplate $projectTemplate): RedirectResponse
    {
        $validated = $request->validated();

        $projectTemplate->update($validated);

        return back()->with('success', 'Template updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ProjectTemplate $projectTemplate): RedirectResponse
    {
        $projectTemplate->delete();

        return redirect()->route('project-templates.index')->with('success', 'Template deleted successfully.');
    }

    /**
     * Create a project from a template.
     */
    public function createProject(ProjectTemplate $projectTemplate, CreateProjectFromTemplateRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        DB::transaction(function () use ($projectTemplate, $validated) {
            $project = Project::create([
                'client_id' => $validated['client_id'],
                'name' => $validated['name'],
                'start_date' => $validated['start_date'],
                'status' => 'not_started',
            ]);

            // Clone tasks from template
            $templateTasks = $projectTemplate->tasks()->whereNull('parent_id')->get();
            $this->cloneTasks($templateTasks, $project->id);
        });

        return redirect()->route('projects.index')->with('success', 'Project created from template successfully.');
    }

    /**
     * Recursively clone tasks from template to project.
     */
    private function cloneTasks($templateTasks, $projectId, $parentId = null)
    {
        foreach ($templateTasks as $templateTask) {
            $newTask = Task::create([
                'project_id' => $projectId,
                'parent_id' => $parentId,
                'title' => $templateTask->title,
                'description' => $templateTask->description,
                'priority' => $templateTask->priority,
                'is_milestone' => $templateTask->is_milestone,
                'order' => $templateTask->order,
                'status' => 'todo',
            ]);

            $childTasks = $templateTask->children;
            if ($childTasks->count() > 0) {
                $this->cloneTasks($childTasks, $projectId, $newTask->id);
            }
        }
    }
}
