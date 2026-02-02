<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Activity extends Model
{
    /**
     * Summary of fillable
     *
     * @var array
     */
    protected $fillable = [
        'client_id',
        'user_id',
        'type',
        'summary',
        'data',
    ];

    /**
     * Summary of casts
     *
     * @var array
     */
    protected $casts = [
        'data' => 'array',
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
}
