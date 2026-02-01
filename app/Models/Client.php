<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\Relations\MorphToMany;

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

    public function customFields(): MorphMany
    {
        return $this->morphMany(CustomField::class, 'model');
    }

    public function tags(): MorphToMany
    {
        return $this->morphToMany(Tag::class, 'taggable')->withTimestamps();
    }

    public function activities()
    {
        return $this->hasMany(Activity::class)->latest();
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

    protected function casts()
    {
        return [
            'created_at' => 'datetime:d M Y, h:i A',
        ];
    }
}
