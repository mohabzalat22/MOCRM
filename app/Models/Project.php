<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\Relations\MorphToMany;

class Project extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'client_id',
        'name',
        'description',
        'start_date',
        'end_date',
        'status',
    ];

    /**
     * Get the client that owns the project.
     */
    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date' => 'date',
        ];
    }

    /**
     * Get the tasks for the project.
     */
    public function tasks()
    {
        return $this->hasMany(Task::class);
    }

    /**
     * Get the updates for the project.
     */
    public function updates(): HasMany
    {
        return $this->hasMany(ProjectUpdate::class);
    }

    /**
     * Get the activities for the project.
     */
    public function activities(): HasMany
    {
        return $this->hasMany(Activity::class);
    }

    /**
     * Get all of the project's attachments.
     */
    public function attachments(): MorphMany
    {
        return $this->morphMany(Attachment::class, 'attachable');
    }

    /**
     * Get all of the project's tags.
     *
     * @return MorphToMany<Tag, Project>
     */
    public function tags(): MorphToMany
    {
        return $this->morphToMany(Tag::class, 'taggable')->withTimestamps();
    }

    /**
     * Scope a query to filter projects based on request parameters.
     *
     * @param  mixed  $query
     */
    public function scopeFilter($query, array $filters): mixed
    {
        return $query->when($filters['search'] ?? null, function ($query, $search) {
            $query->where(function ($query) use ($search) {
                $query->where('name', 'like', '%'.$search.'%')
                    ->orWhere('description', 'like', '%'.$search.'%');
            });
        })->when($filters['status'] ?? null, function ($query, $status) {
            $query->whereIn('status', (array) $status);
        })->when($filters['clientId'] ?? null, function ($query, $clientId) {
            $query->whereIn('client_id', (array) $clientId);
        })->when($filters['tags'] ?? null, function ($query, $tags) {
            $query->whereHas('tags', function ($query) use ($tags) {
                $query->whereIn('tags.id', (array) $tags);
            });
        })->when($filters['dueDateStart'] ?? null, function ($query, $start) {
            $query->where('end_date', '>=', $start);
        })->when($filters['dueDateEnd'] ?? null, function ($query, $end) {
            $query->where('end_date', '<=', $end);
        })->when(isset($filters['minCompletion']) || isset($filters['maxCompletion']), function ($query) use ($filters) {
            $query->where(function ($query) use ($filters) {
                $query->whereHas('tasks', '>=', 0); // Ensure tasks relationship exists for this logic

                // This is a bit complex for a single scope, but let's try to use withCount-like logic in a subquery
                // For simplicity and performance, we might want to skip percentage filter if it's too complex or
                // use a more direct approach if the DB supports it.
                // Let's use a subquery for the ratio.

                $tasksCountSql = '(SELECT count(*) FROM tasks WHERE project_id = projects.id)';
                $completedTasksCountSql = '(SELECT count(*) FROM tasks WHERE project_id = projects.id AND status = "done")';
                $percentageSql = "CASE WHEN $tasksCountSql > 0 THEN ($completedTasksCountSql * 100.0 / $tasksCountSql) ELSE 0 END";

                if (isset($filters['minCompletion'])) {
                    $query->whereRaw("$percentageSql >= ?", [$filters['minCompletion']]);
                }
                if (isset($filters['maxCompletion'])) {
                    $query->whereRaw("$percentageSql <= ?", [$filters['maxCompletion']]);
                }
            });
        });
    }
}
