<?php

namespace App\Actions\Reminders;

use App\Models\Activity;
use App\Models\Reminder;
use Illuminate\Http\RedirectResponse;

class CompleteReminder
{
    public function execute(Reminder $reminder): RedirectResponse
    {
        $reminder->update(['completed_at' => now()]);

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
}
