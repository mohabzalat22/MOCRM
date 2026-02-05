<?php

namespace App\Actions\Reminders;

use App\Http\Requests\SnoozeReminderRequest;
use App\Jobs\SendReminderJob;
use App\Models\Reminder;
use Illuminate\Http\RedirectResponse;

class SnoozeReminder
{
    public function execute(SnoozeReminderRequest $request, Reminder $reminder): RedirectResponse
    {

        $validated = $request->validated();

        $reminder->update([
            'reminder_at' => $validated['reminder_at'],
        ]);

        if ($reminder->reminder_at->isFuture()) {
            SendReminderJob::dispatch($reminder, $reminder->reminder_at->toDateTimeString())
                ->delay($reminder->reminder_at);
        }

        return back()->with('success', 'Reminder snoozed successfully.');
    }
}
