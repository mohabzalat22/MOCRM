<?php

namespace App\Http\Controllers;

use App\Enums\ProjectStatus;
use App\Models\Activity;
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
        $activeClientsCount = Client::forUser()->active()->count();
        $totalMonthlyRevenue = Client::forUser()->active()->sum('monthly_value');
        $activeProjectsCount = Project::where('status', '!=', 'completed')
            ->where('status', '!=', 'cancelled')
            ->whereHas('client', function ($query) {
                $query->where('user_id', auth()->id());
            })
            ->count();
        $overdueTasksCount = Task::where('completed', false)
            ->whereDate('due_date', '<', Carbon::today())
            ->whereHas('project.client', function ($query) {
                $query->where('user_id', auth()->id());
            })
            ->count();

        $startOfWeek = Carbon::now()->startOfWeek(Carbon::MONDAY);
        $endOfWeek = Carbon::now();

        $weeklyInteractions = Activity::where('user_id', auth()->id())
            ->whereBetween('created_at', [$startOfWeek, $endOfWeek])
            ->count();

        $weeklyProjectsCompleted = Project::where('status', ProjectStatus::COMPLETED->value)
            ->whereHas('client', function ($query) {
                $query->where('user_id', auth()->id());
            })
            ->whereBetween('updated_at', [$startOfWeek, $endOfWeek])
            ->count();

        $weeklyNewClients = Client::forUser()
            ->whereBetween('created_at', [$startOfWeek, $endOfWeek])
            ->count();

        $weeklyRevenueEarned = Client::forUser()
            ->whereBetween('created_at', [$startOfWeek, $endOfWeek])
            ->sum('monthly_value');

        return Inertia::render('dashboard', [
            'metrics' => [
                'activeClients' => $activeClientsCount,
                'monthlyRevenue' => $totalMonthlyRevenue,
                'activeProjects' => $activeProjectsCount,
                'overdueTasks' => $overdueTasksCount,
            ],
            'weeklySummary' => [
                'interactionsCount' => $weeklyInteractions,
                'projectsCompletedCount' => $weeklyProjectsCompleted,
                'newClientsCount' => $weeklyNewClients,
                'revenueEarned' => $weeklyRevenueEarned,
            ],
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
            'clientHealth' => [
                'healthy' => Client::forUser()->healthy()
                    ->with(['activities' => fn ($q) => $q->latest()->limit(1)])
                    ->get(),
                'needsAttention' => Client::forUser()->needsAttention()
                    ->with(['activities' => fn ($q) => $q->latest()->limit(1)])
                    ->get(),
                'atRisk' => Client::forUser()->atRisk()
                    ->with(['activities' => fn ($q) => $q->latest()->limit(1)])
                    ->get(),
            ],
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
            'recentActivities' => Activity::where('user_id', auth()->id())
                ->with(['client', 'user'])
                ->latest()
                ->take(10)
                ->get(),
        ]);
    }
}
