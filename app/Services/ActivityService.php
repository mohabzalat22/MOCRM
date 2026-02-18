<?php

namespace App\Services;

use App\Actions\Tags\AttachTagToModel;
use App\Actions\Tags\DetachTagFromModel;
use App\Models\Activity;
use Illuminate\Support\Facades\Storage;

class ActivityService
{
    public function __construct(
        protected AttachTagToModel $attachTagAction,
        protected DetachTagFromModel $detachTagAction
    ) {}

    public function create(array $data, $owner)
    {
        $activityData = [
            'user_id' => auth()->id(),
            'type' => $data['type'],
            'summary' => $data['summary'] ?? null,
            'data' => $data['data'] ?? [],
            'occurred_at' => $data['occurred_at'] ?? now(),
        ];

        $activity = $owner->activities()->create($activityData);

        if (! empty($data['tags'])) {
            foreach ($data['tags'] as $tagData) {
                $this->attachTagAction->execute($activity, $tagData['name'], $tagData['color'] ?? null);
            }
        }

        if (! empty($data['attachments'])) {
            foreach ($data['attachments'] as $file) {
                $path = $file->store('attachments', 'public');
                $activity->attachments()->create([
                    'file_name' => $file->getClientOriginalName(),
                    'file_path' => $path,
                    'mime_type' => $file->getMimeType(),
                    'file_size' => $file->getSize(),
                    'user_id' => auth()->id(),
                ]);
            }
        }

        return $activity;
    }

    public function update(Activity $activity, array $data)
    {
        $activity->update([
            'type' => $data['type'],
            'summary' => $data['summary'] ?? $activity->summary,
            'data' => $data['data'] ?? $activity->data,
            'occurred_at' => $data['occurred_at'] ?? $activity->occurred_at,
        ]);

        // Handle Tags
        if (isset($data['tags'])) {
            $newTagNames = collect($data['tags'])->pluck('name')->toArray();
            $currentTags = $activity->tags;

            // Remove tags not in the new list
            foreach ($currentTags as $tag) {
                if (! in_array($tag->name, $newTagNames)) {
                    $this->detachTagAction->execute($activity, $tag);
                }
            }

            // Add new tags
            foreach ($data['tags'] as $tagData) {
                $this->attachTagAction->execute($activity, $tagData['name'], $tagData['color'] ?? null);
            }
        }

        // Handle Removed Attachments
        if (! empty($data['removed_attachment_ids'])) {
            $attachmentsToDelete = $activity->attachments()->whereIn('id', $data['removed_attachment_ids'])->get();
            foreach ($attachmentsToDelete as $attachment) {
                Storage::disk('public')->delete($attachment->file_path);
                $attachment->delete();
            }
        }

        // Handle New Attachments
        if (! empty($data['attachments'])) {
            foreach ($data['attachments'] as $file) {
                $path = $file->store('attachments', 'public');
                $activity->attachments()->create([
                    'file_name' => $file->getClientOriginalName(),
                    'file_path' => $path,
                    'mime_type' => $file->getMimeType(),
                    'file_size' => $file->getSize(),
                    'user_id' => auth()->id(),
                ]);
            }
        }

        return $activity->load(['tags', 'attachments']);
    }
}
