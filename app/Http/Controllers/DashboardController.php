<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Reminder;
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
