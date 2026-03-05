<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProjectTemplate extends Model
{
    protected $fillable = [
        'name',
        'description',
    ];

    /**
     * Get the tasks for the project template.
     */
    public function tasks(): HasMany
    {
        return $this->hasMany(ProjectTemplateTask::class);
    }
}
