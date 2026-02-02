<?php

namespace App\Services;

use Illuminate\Database\Eloquent\Model;

class TaggableResolver
{
    public function resolve(string $type, int $id): Model
    {
        $modelClass = $this->resolveModelClass($type);

        return $modelClass::findOrFail($id);
    }

    private function resolveModelClass(string $type): string
    {
        $modelClass = str_contains($type, '\\')
            ? $type
            : 'App\\Models\\'.ucfirst($type);

        abort_unless(
            class_exists($modelClass) && is_subclass_of($modelClass, Model::class),
            404,
            'Invalid model type'
        );

        return $modelClass;
    }
}
