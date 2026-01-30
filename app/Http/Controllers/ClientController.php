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
        $clients = Client::forUser()->get();

        return Inertia::render('clients/index', [
            'clients' => $clients->load('customFields'),
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
            ->with('customFields')
            ->first();

        return Inertia::render('clients/show', [
            'client' => $client,
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
        // Update custom fields
        // If custom_fields is present and is null or an empty array, delete all custom fields
        if (array_key_exists('custom_fields', $validated)) {
            if (empty($validated['custom_fields'])) {
                $client->customFields()->delete();
            } elseif (is_array($validated['custom_fields'])) {
                $existingFields = $client->customFields()->get()->keyBy('key');
                $newFields = collect($validated['custom_fields'])->keyBy('key');

                // Update or create fields
                foreach ($newFields as $key => $field) {
                    if ($existingFields->has($key)) {
                        $existing = $existingFields[$key];
                        if ($existing->value !== $field['value']) {
                            $existing->update(['value' => $field['value']]);
                        }
                    } else {
                        $client->customFields()->create([
                            'key' => $field['key'],
                            'value' => $field['value'],
                        ]);
                    }
                }

                // Delete removed fields
                $toDelete = $existingFields->keys()->diff($newFields->keys());
                if ($toDelete->isNotEmpty()) {
                    $client->customFields()->whereIn('key', $toDelete)->delete();
                }
            }
        }

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
