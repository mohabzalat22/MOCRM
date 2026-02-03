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
     * Summary of remindable
     *
     * @return \Illuminate\Database\Eloquent\Relations\MorphTo<Model, Reminder>
     */
    public function remindable(): MorphTo
    {
        return $this->morphTo();
    }
}
