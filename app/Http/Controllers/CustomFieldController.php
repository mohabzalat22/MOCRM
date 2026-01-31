<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateCustomFieldsRequest;
use App\Models\Client;
use Illuminate\Http\RedirectResponse;

class CustomFieldController extends Controller
{
    /**
     * Sync custom fields for a client.
     * This handles adding, updating, and deleting custom fields.
     */
    public function update(UpdateCustomFieldsRequest $request, Client $client): RedirectResponse
    {
        // Ensure the client belongs to the authenticated user
        $client = Client::forUser()->where('id', $client->id)->firstOrFail();

        $validated = $request->validated();

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
     * Delete all custom fields for a client.
     */
    public function destroy(Client $client): RedirectResponse
    {
        // Ensure the client belongs to the authenticated user
        $client = Client::forUser()->where('id', $client->id)->firstOrFail();

        $client->customFields()->delete();

        return to_route('clients.show', $client->id);
    }
}
