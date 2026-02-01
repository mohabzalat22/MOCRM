<?php

namespace App\Http\Controllers;

use App\Models\Activity;
use App\Models\Client;
use Illuminate\Http\Request;

class ActivityController extends Controller
{
    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, Client $client)
    {
        $validated = $request->validate([
            'type' => 'required|string|in:call,email,meeting,note,transaction',
            'summary' => 'nullable|string|max:255',
            'data' => 'nullable|array',
        ]);

        $client->activities()->create([
            'user_id' => auth()->id(),
            'type' => $validated['type'],
            'summary' => $validated['summary'] ?? null,
            'data' => $validated['data'] ?? [],
        ]);

        return back()->with('success', 'Activity added successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Activity $activity)
    {
        return response()->json($activity->load('user'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Activity $activity)
    {
        $validated = $request->validate([
            'type' => 'required|string|in:call,email,meeting,note,transaction',
            'summary' => 'nullable|string|max:255',
            'data' => 'nullable|array',
        ]);

        $activity->update([
            'type' => $validated['type'],
            'summary' => $validated['summary'],
            'data' => $validated['data'] ?? [],
        ]);

        return back()->with('success', 'Activity updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Activity $activity)
    {
        $activity->delete();

        return back()->with('success', 'Activity deleted successfully.');
    }
}
