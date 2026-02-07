<?php

namespace App\Http\Controllers;

use App\Http\Requests\BulkCompleteTasksRequest;
use App\Http\Requests\CreateTaskRequest;
use App\Http\Requests\ReorderTasksRequest;
use App\Http\Requests\UpdateTaskRequest;
use App\Models\Project;
use App\Models\Task;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;

class TaskController extends Controller
{
    /**
     * Store a newly created resource in storage.
     */
    public function store(CreateTaskRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        // Ensure the project belongs to the authenticated user
        $project = Project::with('client')->findOrFail($validated['project_id']);
        if ($project->client->user_id !== auth()->id()) {
            abort(403);
        }

        // Set the order to the next available slot
        $validated['order'] = Task::where('project_id', $validated['project_id'])->max('order') + 1;

        Task::create($validated);

        return back()->with('success', 'Task created successfully.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateTaskRequest $request, Task $task): RedirectResponse
    {
        $task->load('project.client');
        if ($task->project->client->user_id !== auth()->id()) {
            abort(403);
        }

        $validated = $request->validated();

        if (isset($validated['completed']) && $validated['completed'] != $task->completed) {
            $validated['completed_at'] = $validated['completed'] ? now() : null;
        }

        $task->update($validated);

        return back()->with('success', 'Task updated successfully.');
    }

    /**
     * Toggle the completion status of a task.
     */
    public function toggleComplete(Task $task): RedirectResponse
    {
        $task->load('project.client');
        if ($task->project->client->user_id !== auth()->id()) {
            abort(403);
        }

        $task->update([
            'completed' => ! $task->completed,
            'completed_at' => ! $task->completed ? now() : null,
        ]);

        return back()->with('success', 'Task status updated.');
    }

    /**
     * Reorder tasks.
     */
    public function reorder(ReorderTasksRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        DB::transaction(function () use ($validated) {
            foreach ($validated['tasks'] as $taskData) {
                Task::where('id', $taskData['id'])->update(['order' => $taskData['order']]);
            }
        });

        return back()->with('success', 'Tasks reordered successfully.');
    }

    /**
     * Bulk complete tasks.
     */
    public function bulkComplete(BulkCompleteTasksRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        Task::whereIn('id', $validated['task_ids'])->update([
            'completed' => true,
            'completed_at' => now(),
        ]);

        return back()->with('success', 'Tasks completed successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Task $task): RedirectResponse
    {
        $task->load('project.client');
        if ($task->project->client->user_id !== auth()->id()) {
            abort(403);
        }

        $task->delete();

        return back()->with('success', 'Task deleted successfully.');
    }
}
