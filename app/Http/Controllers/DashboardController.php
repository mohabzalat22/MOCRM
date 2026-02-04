<?php

namespace App\Http\Controllers;

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
                ->orderBy('reminder_at', 'asc')
                ->get(),
        ]);
    }
}
