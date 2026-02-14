<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\Project;
use App\Models\Reminder;
use App\Models\Task;
use Carbon\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(): Response
    {
        return Inertia::render('dashboard', [
            'todayReminders' => Reminder::where('user_id', auth()->id())
                ->whereDate('reminder_at', Carbon::today())
                ->with('remindable')
                ->latest()
                ->get(),
            'dueTodayTasks' => Task::whereDate('due_date', Carbon::today())
                ->where('completed', false)
                ->whereHas('project.client', function ($query) {
                    $query->where('user_id', auth()->id());
                })
                ->with('project.client')
                ->latest()
                ->get(),
            'atRiskClients' => Client::where('user_id', auth()->id())
                ->where('status', '!=', 'archived')
                ->whereDoesntHave('activities', function ($query) {
                    $query->where('created_at', '>=', Carbon::now()->subDays(14));
                })
                ->with(['activities' => function ($query) {
                    $query->latest()->limit(1);
                }])
                ->get(),
            'activeProjects' => Project::where('status', '!=', 'completed')
                ->where('status', '!=', 'cancelled')
                ->whereHas('client', function ($query) {
                    $query->where('user_id', auth()->id());
                })
                ->with('client')
                ->withCount(['tasks', 'tasks as completed_tasks_count' => function ($q) {
                    $q->where('completed', true);
                }])
                ->latest()
                ->take(5)
                ->get(),
        ]);
    }
}
