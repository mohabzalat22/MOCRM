<?php

namespace App\Models;

use App\Enums\TaskPriority;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProjectTemplateTask extends Model
{
    protected $fillable = [
        'project_template_id',
        'title',
        'description',
        'priority',
        'is_milestone',
        'order',
        'parent_id',
    ];

    protected $casts = [
        'is_milestone' => 'boolean',
        'priority' => TaskPriority::class,
    ];

    /**
     * Get the project template that owns the task.
     */
    public function template(): BelongsTo
    {
        return $this->belongsTo(ProjectTemplate::class, 'project_template_id');
    }

    /**
     * Get the parent task.
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(ProjectTemplateTask::class, 'parent_id');
    }

    /**
     * Get the child tasks.
     */
    public function children(): HasMany
    {
        return $this->hasMany(ProjectTemplateTask::class, 'parent_id');
    }
}
