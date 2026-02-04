<?php

namespace App\Http\Controllers;

use App\Http\Requests\CreateReminderRequest;
use App\Http\Requests\UpdateReminderRequest;
use App\Models\Client;
use App\Models\Reminder;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ReminderController extends Controller
{
    /**
     * Summary of index
     */
    public function index(): Response
    {
        $reminders = Reminder::with('remindable')
            ->where('user_id', auth()->id())
            ->orderBy('reminder_at', 'asc')
            ->get();

        $clients = Client::orderBy('name')->get(['id', 'name']);
        $activities = \App\Models\Activity::where('user_id', auth()->id())
            ->orderBy('created_at', 'desc')
            ->get(['id', 'type', 'summary']);

        return Inertia::render('reminders/index', [
            'reminders' => $reminders,
            'clients' => $clients,
            'activities' => $activities,
        ]);
    }

    /**
     * Summary of store
     */
    public function store(CreateReminderRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $validated['user_id'] = auth()->id();

        $reminder = Reminder::create($validated);

        // Schedule the notification job
        if ($reminder->reminder_at->isFuture()) {
            \App\Jobs\SendReminderJob::dispatch($reminder, $reminder->reminder_at->toDateTimeString())
                ->delay($reminder->reminder_at);
        }

        return back()->with('success', 'Reminder created successfully.');
    }

    /**
     * Summary of update
     */
    public function update(UpdateReminderRequest $request, Reminder $reminder): RedirectResponse
    {
        $validated = $request->validated();

        $reminder->update($validated);

        // Schedule a new notification job if the time is in the future
        // The job itself will check if it's the latest scheduled time
        if ($reminder->reminder_at->isFuture()) {
            \App\Jobs\SendReminderJob::dispatch($reminder, $reminder->reminder_at->toDateTimeString())
                ->delay($reminder->reminder_at);
        }

        return back()->with('success', 'Reminder updated successfully.');
    }

    /**
     * Summary of destroy
     */
    public function destroy(Reminder $reminder): RedirectResponse
    {
        $reminder->delete();

        return back()->with('success', 'Reminder deleted successfully.');
    }

    /**
     * Mark all notifications as read
     */
    public function markAsRead(): RedirectResponse
    {
        auth()->user()->unreadNotifications->markAsRead();

        return back();
    }

    /**
     * Mark a specific notification as read
     */
    public function markNotificationAsRead(string $id): RedirectResponse
    {
        $notification = auth()->user()->notifications()->findOrFail($id);
        $notification->markAsRead();

        return back();
    }
}
