<?php

namespace App\Http\Controllers;

use App\Actions\Tags\AttachTagToModel;
use App\Actions\Tags\DetachTagFromModel;
use App\Http\Requests\CreateTagRequest;
use App\Models\Tag;
use App\Services\TaggableResolver;
use Illuminate\Http\RedirectResponse;

class TagController extends Controller
{
    /**
     * Summary of __construct
     */
    public function __construct(
        private readonly TaggableResolver $taggableResolver,
        private readonly AttachTagToModel $attachTagAction,
        private readonly DetachTagFromModel $detachTagAction
    ) {}

    /**
     * Summary of store
     */
    public function store(CreateTagRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $taggable = $this->taggableResolver->resolve(
            $validated['taggable_type'],
            $validated['taggable_id']
        );

        $this->attachTagAction->execute(
            $taggable,
            $validated['name'],
            $validated['color'] ?? null
        );

        return back()->with('success', 'Tag added successfully');
    }

    /**
     * Summary of destroy
     */
    public function destroy(string $taggableType, int $taggableId, Tag $tag): RedirectResponse
    {
        $taggable = $this->taggableResolver->resolve($taggableType, $taggableId);

        $this->detachTagAction->execute($taggable, $tag);

        return back()->with('success', 'Tag removed successfully');
    }
}
