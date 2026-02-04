<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class SendReminderJob implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public \App\Models\Reminder $reminder,
        public string $scheduledAt
    ) {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        // Reload reminder to check for latest changes
        $this->reminder->refresh();

        // Check if the reminder still exists and the time matches the one this job was scheduled for
        // This ensures that if a reminder is updated, old scheduled jobs won't trigger.
        if ($this->reminder && $this->reminder->reminder_at->toDateTimeString() === $this->scheduledAt) {
            $this->reminder->user->notify(new \App\Notifications\ReminderNotification($this->reminder));
        }
    }
}
