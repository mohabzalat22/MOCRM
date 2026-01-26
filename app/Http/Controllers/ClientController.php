<?php

namespace App\Http\Controllers;

use App\Http\Requests\ClientRequest;
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
            'clients' => $clients,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(ClientRequest $request)
    {
        $validated = $request->validated();

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('clients', 'public');
            $validated['image'] = $path;
        }

        Client::create($validated);

        return to_route('clients.index');
    }

    /**
     * Display the specified resource.
     */
    public function show(Client $client)
    {
        $client = Client::forUser()->where('id', $client->id)->first();

        return Inertia::render('clients/show', [
            'client' => $client,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(ClientRequest $request, Client $client)
    {
        $validated = $request->validated();

        if ($request->hasFile('image')) {
            $request_image = $request->file('image');

            if ($request_image) {
                // remove the previous image
                if ($client->image) {
                    Storage::disk('public')->delete($client->image);
                }

                // add the new image
                $path = $request->file('image')->store('clients', 'public');
                $validated['image'] = $path;
            }
        }

        $client->foruser()->update($validated);

        return to_route('clients.show');
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
