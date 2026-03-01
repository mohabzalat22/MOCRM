<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\Relations\MorphToMany;

class Activity extends Model
{
    /**
     * Summary of fillable
     *
     * @var array
     */
    protected $fillable = [
        'client_id',
        'project_id',
        'user_id',
        'type',
        'summary',
        'data',
        'occurred_at',
    ];

    /**
     * Summary of casts
     *
     * @var array
     */
    protected $casts = [
        'data' => 'array',
        'occurred_at' => 'datetime',
    ];

    /**
     * Summary of client
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo<Client, Activity>
     */
    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    /**
     * Summary of user
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo<User, Activity>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Summary of project
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo<Project, Activity>
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function attachments(): MorphMany
    {
        return $this->morphMany(Attachment::class, 'attachable');
    }

    public function tags(): MorphToMany
    {
        return $this->morphToMany(Tag::class, 'taggable')->withTimestamps();
    }

    /**
     * Scope a query to filter activities based on request parameters.
     *
     * @param  mixed  $query
     */
    public function scopeFilter($query, array $filters): mixed
    {
        return $query->when($filters['search'] ?? null, function ($query, $search) {
            $query->where('summary', 'like', '%'.$search.'%');
        })->when($filters['types'] ?? null, function ($query, $types) {
            $query->whereIn('type', (array) $types);
        })->when($filters['clientIds'] ?? null, function ($query, $clientIds) {
            $query->whereIn('client_id', (array) $clientIds);
        })->when($filters['startDate'] ?? null, function ($query, $startDate) {
            $query->where('occurred_at', '>=', $startDate);
        })->when($filters['endDate'] ?? null, function ($query, $endDate) {
            $query->where('occurred_at', '<=', \Carbon\Carbon::parse($endDate)->endOfDay());
        })->when(
            ($filters['projectStatuses'] ?? null) ||
            ($filters['projectDueDateStart'] ?? null) ||
            ($filters['projectDueDateEnd'] ?? null) ||
            isset($filters['minProjectCompletion']) ||
            isset($filters['maxProjectCompletion']),
            function ($query) use ($filters) {
                $query->whereHas('project', function ($query) use ($filters) {
                    $query->when($filters['projectStatuses'] ?? null, function ($query, $statuses) {
                        $query->whereIn('status', (array) $statuses);
                    })->when($filters['projectDueDateStart'] ?? null, function ($query, $start) {
                        $query->where('end_date', '>=', $start);
                    })->when($filters['projectDueDateEnd'] ?? null, function ($query, $end) {
                        $query->where('end_date', '<=', $end);
                    })->when(isset($filters['minProjectCompletion']) || isset($filters['maxProjectCompletion']), function ($query) use ($filters) {
                        $tasksCountSql = '(SELECT count(*) FROM tasks WHERE project_id = projects.id)';
                        $completedTasksCountSql = '(SELECT count(*) FROM tasks WHERE project_id = projects.id AND status = "done")';
                        $percentageSql = "CASE WHEN $tasksCountSql > 0 THEN ($completedTasksCountSql * 100.0 / $tasksCountSql) ELSE 0 END";

                        if (isset($filters['minProjectCompletion'])) {
                            $query->whereRaw("$percentageSql >= ?", [$filters['minProjectCompletion']]);
                        }
                        if (isset($filters['maxProjectCompletion'])) {
                            $query->whereRaw("$percentageSql <= ?", [$filters['maxProjectCompletion']]);
                        }
                    });
                });
            }
        );
    }
}
