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
            ->orderBy('reminder_at', 'asc')
            ->get();

        $clients = Client::orderBy('name')->get(['id', 'name']);

        return Inertia::render('reminders/index', [
            'reminders' => $reminders,
            'clients' => $clients,
        ]);
    }

    /**
     * Summary of store
     */
    public function store(CreateReminderRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        Reminder::create($validated);

        return back()->with('success', 'Reminder created successfully.');
    }

    /**
     * Summary of update
     */
    public function update(UpdateReminderRequest $request, Reminder $reminder): RedirectResponse
    {
        $validated = $request->validated();

        $reminder->update($validated);

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
}
