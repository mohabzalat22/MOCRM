<?php

namespace App\Actions\Reminders;

use Illuminate\Http\RedirectResponse;

class MarkNotificationAsRead
{
    public function execute(string $id): RedirectResponse
    {

        $notification = auth()->user()->notifications()->findOrFail($id);
        $notification->markAsRead();

        return back();
    }
}
