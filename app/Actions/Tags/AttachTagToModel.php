<?php

namespace App\Actions\Tags;

use App\Models\Tag;
use Illuminate\Database\Eloquent\Model;

class AttachTagToModel
{
    public function execute(Model $taggable, string $tagName, ?string $color = null): Tag
    {
        $tag = Tag::firstOrCreate(
            ['name' => $tagName],
            ['color' => $color ?? Tag::randomColor()]
        );

        if (! $taggable->tags()->where('tag_id', $tag->id)->exists()) {
            $taggable->tags()->attach($tag->id);
            $tag->increment('usage_count');
        }

        return $tag;
    }
}
