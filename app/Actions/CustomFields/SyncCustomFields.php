<?php

namespace App\Actions\CustomFields;

use App\Models\Client;

class SyncCustomFields
{
    /**
     * Sync custom fields for the given client.
     */
    public function execute(Client $client, array $newFieldsData): void
    {
        $newFields = collect($newFieldsData)->keyBy('key');
        $existingFields = $client->customFields()->pluck('id', 'key');

        // Update or create fields
        foreach ($newFields as $key => $field) {
            $client->customFields()->updateOrCreate(
                ['key' => $key],
                ['value' => $field['value'] ?? '']
            );
        }

        // Delete removed fields
        $keysToDelete = $existingFields->keys()->diff($newFields->keys());

        if ($keysToDelete->isNotEmpty()) {
            $client->customFields()->whereIn('key', $keysToDelete)->delete();
        }
    }
}
