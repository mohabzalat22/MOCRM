<?php

namespace App\Http\Controllers;

use App\Http\Requests\CreateActivityRequest;
use App\Http\Requests\UpdateActivityRequest;
use App\Models\Activity;
use App\Models\Client;
use App\Services\ActivityService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;

class ActivityController extends Controller
{
    public function __construct(
        protected ActivityService $activityService
    ) {}

    /**
     * Summary of store
     */
    public function store(CreateActivityRequest $request, Client $client): RedirectResponse|JsonResponse
    {
        $validated = $request->validated();

        $activity = $this->activityService->create($validated, $client);
        // activity form uses it in create behavior when showing the activity data
        if ($request->wantsJson()) {
            return response()->json($activity->load(['user', 'tags', 'attachments']));
        }

        return back()->with('success', 'Activity added successfully.');
    }

    /**
     * Summary of show
     */
    public function show(Activity $activity): JsonResponse
    {
        return response()->json($activity->load(['user', 'tags', 'attachments']));
    }

    /**
     * Summary of update
     */
    public function update(UpdateActivityRequest $request, Activity $activity): RedirectResponse|JsonResponse
    {
        $validated = $request->validated();
        // activity form uses it in update - edit behavior when showing the activity data

        $activity = $this->activityService->update($activity, $validated);

        if ($request->wantsJson()) {
            return response()->json($activity->load(['user', 'tags', 'attachments']));
        }

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
