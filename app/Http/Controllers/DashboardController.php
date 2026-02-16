<?php

namespace App\Http\Controllers;

use App\Enums\ProjectStatus;
use App\Models\Activity;
use App\Models\Client;
use App\Models\Project;
use App\Models\Reminder;
use App\Models\Task;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request): Response
    {
        $user = auth()->user();
        $preferences = $user->dashboardPreference;

        // Determine Date Range
        $rangeKey = $request->input('date_range', $preferences?->date_range ?? '30d');

        // Calculate Start Date
        $endDate = Carbon::now();
        $startDate = match ($rangeKey) {
            '7d' => Carbon::now()->subDays(7),
            '30d' => Carbon::now()->subDays(30),
            '90d' => Carbon::now()->subDays(90),
            'this_month' => Carbon::now()->startOfMonth(),
            'last_month' => Carbon::now()->subMonth()->startOfMonth(),
            'this_year' => Carbon::now()->startOfYear(),
            default => Carbon::now()->subDays(30),
        };

        if ($rangeKey === 'last_month') {
            $endDate = Carbon::now()->subMonth()->endOfMonth();
        }

        // Snapshot Metrics (Current State - generally not affected by date range unless specified)
        // For "Active Clients", "Monthly Revenue", etc., these are usually current state.
        // If the user wants "New Clients in Range", that goes in the summary.

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

        // Summary Metrics (Filtered by Date Range)
        $interactionsCount = Activity::where('user_id', auth()->id())
            ->whereBetween('created_at', [$startDate, $endDate])
            ->count();

        $projectsCompletedCount = Project::where('status', ProjectStatus::COMPLETED->value)
            ->whereHas('client', function ($query) {
                $query->where('user_id', auth()->id());
            })
            ->whereBetween('updated_at', [$startDate, $endDate])
            ->count();

        $newClientsCount = Client::forUser()
            ->whereBetween('created_at', [$startDate, $endDate])
            ->count();

        // Revenue Earned in range (sum of monthly_value of NEW clients in this range?
        // Or actual revenue? System acts like "Potential/Recurring Revenue".
        // Using same logic as previous 'weeklyRevenueEarned' => sum monthly_value of created clients.
        $revenueEarned = Client::forUser()
            ->whereBetween('created_at', [$startDate, $endDate])
            ->sum('monthly_value');

        return Inertia::render('dashboard', [
            'metrics' => [
                'activeClients' => $activeClientsCount,
                'monthlyRevenue' => $totalMonthlyRevenue,
                'activeProjects' => $activeProjectsCount,
                'overdueTasks' => $overdueTasksCount,
            ],
            'summary' => [ // Renamed from weeklySummary to summary
                'interactionsCount' => $interactionsCount,
                'projectsCompletedCount' => $projectsCompletedCount,
                'newClientsCount' => $newClientsCount,
                'revenueEarned' => $revenueEarned,
                'dateRangeLabel' => $this->getDateRangeLabel($rangeKey),
            ],
            'preferences' => $preferences,
            'currentDateRange' => $rangeKey,
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
            'clients' => Client::forUser()->select('id', 'name')->get(),
        ]);
    }

    private function getDateRangeLabel(string $key): string
    {
        return match ($key) {
            '7d' => 'Last 7 Days',
            '30d' => 'Last 30 Days',
            '90d' => 'Last 90 Days',
            'this_month' => 'This Month',
            'last_month' => 'Last Month',
            'this_year' => 'This Year',
            default => 'Last 30 Days',
        };
    }
}
