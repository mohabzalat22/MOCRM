<?php

namespace App\Http\Controllers;

use App\Http\Requests\CreateProjectTemplateTaskRequest;
use App\Http\Requests\ReorderProjectTemplateTasksRequest;
use App\Http\Requests\UpdateProjectTemplateTaskRequest;
use App\Models\ProjectTemplateTask;
use Illuminate\Http\RedirectResponse;

class ProjectTemplateTaskController extends Controller
{
    /**
     * Store a newly created resource in storage.
     */
    public function store(CreateProjectTemplateTaskRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        ProjectTemplateTask::create($validated);

        return back()->with('success', 'Task added to template.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateProjectTemplateTaskRequest $request, ProjectTemplateTask $task): RedirectResponse
    {
        $validated = $request->validated();

        $task->update($validated);

        return back()->with('success', 'Template task updated.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ProjectTemplateTask $task): RedirectResponse
    {
        $task->delete();

        return back()->with('success', 'Template task removed.');
    }

    /**
     * Reorder tasks.
     */
    public function reorder(ReorderProjectTemplateTasksRequest $request): RedirectResponse
    {
        $request->validated();

        foreach ($request->tasks as $taskData) {
            ProjectTemplateTask::where('id', $taskData['id'])->update(['order' => $taskData['order']]);
        }

        return back()->with('success', 'Tasks reordered.');
    }
}
