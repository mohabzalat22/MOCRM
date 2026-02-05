<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Reminder extends Model
{
    /**
     * @var array
     */
    protected $fillable = [
        'user_id',
        'title',
        'description',
        'priority',
        'reminder_at',
        'remindable_id',
        'remindable_type',
        'completed_at',
        'is_recurring',
        'recurrence_pattern',
        'recurrence_interval',
        'recurrence_end_date',
    ];

    /**
     * @var array
     */
    protected $casts = [
        'reminder_at' => 'datetime',
        'completed_at' => 'datetime',
        'is_recurring' => 'boolean',
        'recurrence_interval' => 'integer',
        'recurrence_end_date' => 'date',
    ];

    /**
     * Get the user that owns the reminder.
     */
    public function user(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Summary of remindable
     */
    public function remindable(): MorphTo
    {
        return $this->morphTo();
    }
}
