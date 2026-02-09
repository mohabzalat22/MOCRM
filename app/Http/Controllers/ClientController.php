<?php

namespace App\Http\Controllers;

use App\Actions\Clients\BulkUpdateClients;
use App\Http\Requests\BulkUpdateRequest;
use App\Http\Requests\CreateClientRequest;
use App\Http\Requests\UpdateClientRequest;
use App\Models\Activity;
use App\Models\Client;
use App\Models\Tag;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ClientController extends Controller
{
    /**
     * Summary of index
     */
    public function index(): Response
    {
        $clients = Client::forUser()->with([
            'customFields',
            'tags',
        ])->get();

        return Inertia::render('clients/index', [
            'clients' => $clients,
            'allTags' => Tag::orderBy('name')->get(),
        ]);
    }

    /**
     * Summary of store
     */
    public function store(CreateClientRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('clients', 'public');
            $validated['image'] = $path;
        }

        Client::create($validated);

        return back()->with('success', 'Client Created successfully.');
    }

    /**
     * Summary of show
     */
    public function show(Client $client): Response
    {
        $client = Client::forUser()
            ->where('id', $client->id)
            ->with(['customFields', 'tags', 'activities' => function ($query) {
                $query->with('user')->latest();
            }, 'projects' => function ($query) {
                $query->withCount(['tasks', 'tasks as completed_tasks_count' => function ($q) {
                    $q->where('completed', true);
                }])->latest();
            }])
            ->firstOrFail();

        // Get all tags for tag input/filter
        $allTags = Tag::orderBy('name')->get();

        return Inertia::render('clients/show', [
            'client' => $client,
            'allTags' => $allTags,
            'activities' => $client->activities,
            'projects' => $client->projects,
        ]);
    }

    /**
     * Summary of update
     */
    public function update(UpdateClientRequest $request, Client $client): RedirectResponse
    {
        $client = Client::forUser()->where('id', $client->id)->firstOrFail();
        $oldStatus = $client->status;
        $validated = $request->validated();

        // user wants to remove client image
        if ($request->has('image') && $request->input('image') === null || $request->input('image') === '') {
            if ($client->image) {
                Storage::disk('public')->delete($client->image);
            }
            $validated['image'] = null;
        }

        // user want to update client image with new one
        if ($request->hasFile('image') && $request->file('image')) {
            if ($client->image) {
                Storage::disk('public')->delete($client->image);
            }
            $path = $request->file('image')->store('clients', 'public');
            $validated['image'] = $path;
        }

        $client->update($validated);

        if (isset($validated['status']) && $oldStatus !== $client->status) {
            Activity::create([
                'client_id' => $client->id,
                'user_id' => auth()->id(),
                'type' => 'status_change',
                'summary' => "Status updated from {$oldStatus} to {$client->status}",
                'data' => [
                    'old_status' => $oldStatus,
                    'new_status' => $client->status,
                ],
            ]);
        }

        return to_route('clients.show', $client->id)->with('success', 'Client Updated successfully.');
    }

    /**
     * Summary of destroy
     */
    public function destroy(Client $client): RedirectResponse
    {
        $client = Client::forUser()->where('id', $client->id)->firstOrFail();

        if ($client->image) {
            Storage::disk('public')->delete($client->image);
        }

        $client->delete();

        return to_route('clients.index')->with('success', 'Client Deleted successfully.');
    }

    public function bulkUpdate(BulkUpdateRequest $request, BulkUpdateClients $bulkUpdateAction): RedirectResponse
    {
        $validated = $request->validated();

        $bulkUpdateAction->execute($validated['ids'], $validated);

        return back()->with('success', 'Bulk action completed successfully.');
    }
}
