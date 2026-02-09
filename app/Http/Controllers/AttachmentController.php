<?php

namespace App\Http\Controllers;

use App\Models\Attachment;
use Illuminate\Support\Facades\Storage;

class AttachmentController extends Controller
{
    public function download(Attachment $attachment)
    {
        // Check if user has access to the attachable
        $attachable = $attachment->attachable;

        // If it's a project update (Activity with project_id), check if user owns the project's client
        if (get_class($attachable) === \App\Models\Activity::class) {
            if ($attachable->project_id) {
                if ($attachable->project->client->user_id !== auth()->id()) {
                    abort(403);
                }
            } else {
                // If it's just a general activity, check if user owns the client
                if ($attachable->client->user_id !== auth()->id()) {
                    abort(403);
                }
            }
        }

        if (! Storage::disk('public')->exists($attachment->file_path)) {
            abort(404);
        }

        return Storage::disk('public')->download($attachment->file_path, $attachment->file_name);
    }
}
