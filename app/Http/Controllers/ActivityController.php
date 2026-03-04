<?php

namespace App\Http\Controllers;

use App\Enums\ProjectStatus;
use App\Enums\TaskStatus;
use App\Http\Requests\CreateActivityRequest;
use App\Http\Requests\UpdateActivityRequest;
use App\Models\Activity;
use App\Models\Client;
use App\Services\ActivityService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Inertia\Response;

class ActivityController extends Controller
{
    public function __construct(
        protected ActivityService $activityService
    ) {}

    /**
     * Display a listing of activities.
     */
    public function index(): Response
    {
        $filters = request()->all([
            'search',
            'types',
            'clientIds',
            'startDate',
            'endDate',
            'projectStatuses',
            'projectDueDateStart',
            'projectDueDateEnd',
            'minProjectCompletion',
            'maxProjectCompletion',
            'sort',
            'direction',
        ]);

        $activities = Activity::with([
            'user',
            'client',
            'tags',
            'attachments',
            'project' => function ($query) {
                $query->withCount(['tasks', 'tasks as completed_tasks_count' => function ($q) {
                    $q->where('status', TaskStatus::DONE);
                }]);
            },
        ])
            ->whereHas('client', function ($query) {
                $query->where('user_id', auth()->id());
            })
            ->filter($filters)
            ->orderBy($filters['sort'] ?? 'occurred_at', $filters['direction'] ?? 'desc')
            ->paginate(10)
            ->withQueryString();

        $clients = Client::forUser()->orderBy('name')->get(['id', 'name']);
        $activityTypes = [
            'call',
            'email',
            'meeting',
            'note',
            'transaction',
            'status_change',
        ];

        return inertia('activities/index', [
            'activities' => $activities,
            'filters' => $filters,
            'clients' => $clients,
            'activityTypes' => $activityTypes,
            'projectStatuses' => ProjectStatus::values(),
        ]);
    }

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
     * Display the specified activity.
     */
    public function show(Activity $activity): Response|JsonResponse
    {
        $activity->load([
            'user',
            'client',
            'tags',
            'attachments',
            'project' => function ($query) {
                $query->withCount(['tasks', 'tasks as completed_tasks_count' => function ($q) {
                    $q->where('status', TaskStatus::DONE);
                }]);
            },
        ]);

        if (request()->wantsJson()) {
            return response()->json($activity);
        }

        $clients = Client::forUser()->orderBy('name')->get(['id', 'name']);
        $activityTypes = [
            'call',
            'email',
            'meeting',
            'note',
            'transaction',
            'status_change',
        ];

        return inertia('activities/show', [
            'activity' => $activity,
            'clients' => $clients,
            'activityTypes' => $activityTypes,
            'projectStatuses' => ProjectStatus::values(),
        ]);
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

        return redirect()->route('activities.index')->with('success', 'Activity deleted successfully.');
    }

    public function export()
    {
        $activities = Activity::with(['client', 'project', 'user'])
            ->whereHas('client', function ($query) {
                $query->where('user_id', auth()->id());
            })->get();

        $callback = function () use ($activities) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['Type', 'Summary', 'Client', 'Project', 'User', 'Occurred At', 'Created At']);

            foreach ($activities as $activity) {
                fputcsv($file, [
                    $activity->type,
                    $activity->summary,
                    $activity->client?->name,
                    $activity->project?->name,
                    $activity->user?->name,
                    $activity->occurred_at?->format('Y-m-d H:i:s'),
                    $activity->created_at,
                ]);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="activities.csv"',
        ]);
    }
}
