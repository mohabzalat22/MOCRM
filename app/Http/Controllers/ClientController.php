<?php

namespace App\Http\Controllers;

use App\Http\Requests\CreateClientRequest;
use App\Http\Requests\UpdateClientRequest;
use App\Models\Client;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ClientController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $clients = Client::forUser()->with([
            'customFields',
            'tags'
        ])->get();

        return Inertia::render('clients/index', [
            'clients' => $clients,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(CreateClientRequest $request)
    {
        $validated = $request->validated();

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('clients', 'public');
            $validated['image'] = $path;
        }

        $client = Client::create(
            collect($validated)->except('custom_fields')->toArray()
        );

        if (isset($validated['custom_fields']) && is_array($validated['custom_fields'])) {
            foreach ($validated['custom_fields'] as $field) {
                $client->customFields()->create([
                    'key' => $field['key'],
                    'value' => $field['value'],
                ]);
            }
        }

        return to_route('clients.index');
    }

    /**
     * Display the specified resource.
     */
    public function show(Client $client)
    {
        $client = Client::forUser()
            ->where('id', $client->id)
            ->with(['customFields', 'tags'])
            ->firstOrFail();

        // Get all tags for tag input/filter
        $allTags = \App\Models\Tag::orderBy('name')->get();

        return Inertia::render('clients/show', [
            'client' => $client,
            'allTags' => $allTags,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateClientRequest $request, Client $client)
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

        Client::forUser()->where('id', $client->id)->update(collect($validated)->except('custom_fields')->toArray());

        return to_route('clients.show', $client->id);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Client $client)
    {
        $client = Client::forUser()->where('id', $client->id)->firstOrFail();

        if ($client->image) {
            Storage::disk('public')->delete($client->image);
        }

        $client->delete();

        return to_route('clients.index');
    }
}
