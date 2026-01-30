<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Tag;

class TagController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'color' => 'nullable|string|regex:/^#[0-9A-Fa-f]{6}$/',
            'taggable_id' => 'required|integer',
            'taggable_type' => 'required|string|in:App\Models\Client,App\Models\Project,App\Models\Task'
        ]);

        // Create or get existing tag
        $tag = Tag::firstOrCreate(
            ['name' => $validated['name']],
            [
                'color' => $validated['color'] ?? Tag::randomColor(),
                'usage_count' => 0
            ]
        );

        // Get the taggable model instance
        $taggableModel = $validated['taggable_type'];
        $taggable = $taggableModel::findOrFail($validated['taggable_id']);

        // Attach tag if not already attached
        if (!$taggable->tags()->where('tag_id', $tag->id)->exists()) {
            $taggable->tags()->attach($tag->id);
            $tag->increment('usage_count');
        }

        return back()->with('success', 'Tag added successfully');
    }

    public function destroy(string $taggableType, int $taggableId, Tag $tag)
    {
        // Build full model class name
        $taggableModel = "App\\Models\\" . ucfirst($taggableType);

        // Validate model exists
        if (!class_exists($taggableModel)) {
            return back()->withErrors(['error' => 'Invalid model type']);
        }

        // Find the taggable instance
        $taggable = $taggableModel::findOrFail($taggableId);

        // Detach the tag
        $taggable->tags()->detach($tag->id);

        // Decrement usage count
        if ($tag->usage_count > 0) {
            $tag->decrement('usage_count');
        }

        return back()->with('success', 'Tag removed successfully');
    }
}
