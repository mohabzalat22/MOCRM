<?php

namespace App\Http\Controllers;

use App\Http\Requests\CreateClientRequest;
use App\Http\Requests\UpdateClientRequest;
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
            }])
            ->firstOrFail();

        // Get all tags for tag input/filter
        $allTags = Tag::orderBy('name')->get();

        return Inertia::render('clients/show', [
            'client' => $client,
            'allTags' => $allTags,
            'activities' => $client->activities,
        ]);
    }

    /**
     * Summary of update
     */
    public function update(UpdateClientRequest $request, Client $client): RedirectResponse
    {
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

        Client::forUser()->where('id', $client->id)->update($validated);

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
}
