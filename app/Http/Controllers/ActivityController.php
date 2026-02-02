<?php

namespace App\Http\Controllers;

use App\Http\Requests\CreateActivityRequest;
use App\Http\Requests\UpdateActivityRequest;
use App\Models\Activity;
use App\Models\Client;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;

class ActivityController extends Controller
{
    /**
     * Summary of store
     */
    public function store(CreateActivityRequest $request, Client $client): RedirectResponse
    {
        $validated = $request->validated();

        $client->activities()->create([
            'user_id' => auth()->id(),
            'type' => $validated['type'],
            'summary' => $validated['summary'] ?? null,
            'data' => $validated['data'] ?? [],
        ]);

        return back()->with('success', 'Activity added successfully.');
    }

    /**
     * Summary of show
     */
    public function show(Activity $activity): JsonResponse
    {
        return response()->json($activity->load('user'));
    }

    /**
     * Summary of update
     */
    public function update(UpdateActivityRequest $request, Activity $activity): RedirectResponse
    {
        $validated = $request->validated();

        $activity->update([
            'type' => $validated['type'],
            'summary' => $validated['summary'],
            'data' => $validated['data'] ?? [],
        ]);

        return back()->with('success', 'Activity updated successfully.');
    }

    /**
     * Summary of destroy
     */
    public function destroy(Activity $activity): RedirectResponse
    {
        $activity->delete();

        return back()->with('success', 'Activity deleted successfully.');
    }
}
