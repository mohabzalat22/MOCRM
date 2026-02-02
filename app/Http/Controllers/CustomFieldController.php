<?php

namespace App\Http\Controllers;

use App\Actions\CustomFields\SyncCustomFields;
use App\Http\Requests\UpdateCustomFieldsRequest;
use App\Models\Client;
use Illuminate\Http\RedirectResponse;

class CustomFieldController extends Controller
{
    /**
     * Summary of __construct
     */
    public function __construct(
        private readonly SyncCustomFields $syncCustomFields
    ) {}

    /**
     * Update the custom fields for the given client.
     */
    public function update(UpdateCustomFieldsRequest $request, Client $client): RedirectResponse
    {
        $validated = $request->validated();

        if (! array_key_exists('custom_fields', $validated)) {
            return to_route('clients.show', $client);
        }

        if (empty($validated['custom_fields'])) {
            $client->customFields()->delete();
        } else {
            $this->syncCustomFields->execute($client, $validated['custom_fields']);
        }

        return to_route('clients.show', $client);
    }
}
