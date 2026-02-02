<?php

namespace App\Actions\Tags;

use App\Models\Tag;
use Illuminate\Database\Eloquent\Model;

class DetachTagFromModel
{
    public function execute(Model $taggable, Tag $tag): bool
    {
        $detached = $taggable->tags()->detach($tag->id) > 0;

        if ($detached) {
            $tag->decrement('usage_count');
        }

        return $detached;
    }
}
