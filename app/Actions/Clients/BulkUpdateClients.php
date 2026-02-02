<?php

namespace App\Actions\Clients;

use App\Models\Activity;
use App\Models\Client;
use App\Models\Tag;

class BulkUpdateClients
{
    /**
     * Execute the bulk update action.
     *
     * @param  array<int>  $ids
     * @param  array<string, mixed>  $data
     */
    public function execute(array $ids, array $data): void
    {
        $action = $data['action'];
        $clients = Client::forUser()->whereIn('id', $ids)->get();

        foreach ($clients as $client) {
            if ($action === 'change_status') {
                $this->changeStatus($client, $data['status']);
            } elseif ($action === 'add_tag') {
                $this->addTag($client, $data['tag_id']);
            }
        }
    }

    /**
     * Change client status and log activity.
     */
    protected function changeStatus(Client $client, string $status): void
    {
        $oldStatus = $client->status;

        if ($oldStatus !== $status) {
            $client->update(['status' => $status]);

            Activity::create([
                'client_id' => $client->id,
                'user_id' => auth()->id(),
                'type' => 'status_change',
                'summary' => "Status updated from {$oldStatus} to {$status} (Bulk)",
                'data' => [
                    'old_status' => $oldStatus,
                    'new_status' => $status,
                    'source' => 'bulk_action',
                ],
            ]);
        }
    }

    /**
     * Add tag to client.
     */
    protected function addTag(Client $client, int $tagId): void
    {
        $tag = Tag::findOrFail($tagId);
        $client->tags()->syncWithoutDetaching([$tag->id]);
    }
}
