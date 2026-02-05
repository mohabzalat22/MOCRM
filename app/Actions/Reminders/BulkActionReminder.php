<?php

namespace App\Actions\Reminders;

use App\Http\Requests\BulkActionReminderRequest;
use App\Models\Activity;
use App\Models\Reminder;
use Illuminate\Http\RedirectResponse;

class BulkActionReminder
{
    public function execute(BulkActionReminderRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $reminders = Reminder::whereIn('id', $validated['ids'])
            ->where('user_id', auth()->id())
            ->get();

        foreach ($reminders as $reminder) {
            if ($validated['action'] === 'complete') {
                $reminder->update(['completed_at' => now()]);
                // Log activity
                if ($reminder->remindable_type === 'App\\Models\\Client' && $reminder->remindable_id) {
                    Activity::create([
                        'client_id' => $reminder->remindable_id,
                        'user_id' => auth()->id(),
                        'type' => 'reminder_completed',
                        'summary' => 'Completed reminder: '.$reminder->title,
                        'data' => ['reminder_id' => $reminder->id],
                    ]);
                }
            } elseif ($validated['action'] === 'delete') {
                $reminder->delete();
            }
        }

        return back()->with('success', 'Bulk action completed successfully.');
    }
}
