<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Client extends Model
{
    protected $fillable = [
        'client_id',
        'name',
        'company_name',
        'email',
        'phone',
        'status',
        'website',
        'address',
        'image',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function scopeForUser($query)
    {
        $user_id = auth()->id();

        return $query->where('user_id', $user_id);
    }

    protected static function booted()
    {
        // auto set user_id
        static::creating(function ($client) {
            $client->user_id = auth()->id();
        });
    }
}
