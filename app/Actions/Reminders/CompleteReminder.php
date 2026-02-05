<?php

namespace App\Actions\Reminders;

use App\Jobs\SendReminderJob;
use App\Models\Activity;
use App\Models\Reminder;
use Illuminate\Http\RedirectResponse;

class CompleteReminder
{
    public function execute(Reminder $reminder): RedirectResponse
    {
        $reminder->update(['completed_at' => now()]);

        // Handle Recurrence
        if ($reminder->is_recurring) {
            $this->handleRecurrence($reminder);
        }

        // Log activity if related to a client
        if ($reminder->remindable_type === 'App\\Models\\Client' && $reminder->remindable_id) {
            Activity::create([
                'client_id' => $reminder->remindable_id,
                'user_id' => auth()->id(),
                'type' => 'reminder_completed',
                'summary' => 'Completed reminder: '.$reminder->title,
                'data' => ['reminder_id' => $reminder->id],
            ]);
        }

        return back()->with('success', 'Reminder marked as complete.');
    }

    protected function handleRecurrence(Reminder $reminder): void
    {
        $interval = $reminder->recurrence_interval ?? 1;
        $nextDate = $reminder->reminder_at->copy();

        $nextDate = match ($reminder->recurrence_pattern) {
            'daily' => $nextDate->addDays($interval),
            'weekly' => $nextDate->addWeeks($interval),
            'monthly' => $nextDate->addMonths($interval),
            'quarterly' => $nextDate->addMonths(3 * $interval),
            'yearly' => $nextDate->addYears($interval),
            default => $nextDate,
        };

        // If next date is valid (pattern matched) and within end date (if set)
        if (
            $nextDate->notEqualTo($reminder->reminder_at) &&
            (! $reminder->recurrence_end_date || $nextDate->lte($reminder->recurrence_end_date))
        ) {

            $newReminder = $reminder->replicate(['completed_at']);
            $newReminder->reminder_at = $nextDate;
            $newReminder->save();

            if ($newReminder->reminder_at->isFuture()) {
                SendReminderJob::dispatch($newReminder, $newReminder->reminder_at->toDateTimeString())
                    ->delay($newReminder->reminder_at);
            }
        }
    }
}
