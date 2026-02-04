<?php

namespace App\Actions\Reminders;

use Illuminate\Http\RedirectResponse;

class MarksAllNotificationsAsRead
{
    public function execute(): RedirectResponse
    {
        auth()->user()->unreadNotifications->markAsRead();

        return back();
    }
}
