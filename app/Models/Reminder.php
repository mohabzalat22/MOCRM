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
    ];

    /**
     * @var array
     */
    protected $casts = [
        'reminder_at' => 'datetime',
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
