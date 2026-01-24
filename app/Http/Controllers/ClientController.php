<?php

namespace App\Http\Controllers;

use App\Http\Requests\CreateClientRequest;
use App\Models\Client;
use Illuminate\Http\Request;
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
    public function store(CreateClientRequest $request)
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
    public function update(Request $request, Client $client)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Client $client)
    {
        //
    }
}
