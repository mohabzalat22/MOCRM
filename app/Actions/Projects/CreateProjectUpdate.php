<?php

namespace App\Actions\Projects;

use App\Models\Activity;
use App\Models\Attachment;
use App\Models\Project;
use Illuminate\Support\Facades\DB;

class CreateProjectUpdate
{
    /**
     * Execute the project update action.
     */
    public function execute(Project $project, array $data): Activity
    {
        return DB::transaction(function () use ($project, $data) {
            // Create activity with type 'note'
            $activity = Activity::create([
                'client_id' => $project->client_id,
                'project_id' => $project->id,
                'user_id' => auth()->id(),
                'type' => 'note',
                'summary' => $data['content'],
                'data' => [
                    'is_project_update' => true,
                ],
            ]);

            // Handle attachments
            if (isset($data['files']) && ! empty($data['files'])) {
                foreach ($data['files'] as $file) {
                    $path = $file->store('attachments/' . $project->id, 'public');

                    Attachment::create([
                        'attachable_id' => $activity->id,
                        'attachable_type' => Activity::class,
                        'file_path' => $path,
                        'file_name' => $file->getClientOriginalName(),
                        'file_size' => $file->getSize(),
                        'mime_type' => $file->getMimeType(),
                        'user_id' => auth()->id(),
                    ]);
                }
            }

            return $activity;
        });
    }
}
