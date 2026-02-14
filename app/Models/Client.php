<?php

namespace App\Models;

use App\Enums\ClientStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\Relations\MorphToMany;

class Client extends Model
{
    /**
     * Summary of fillable
     *
     * @var array
     */
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
        'monthly_value',
    ];

    /**
     * Summary of user
     *
     * @return BelongsTo<User, Client>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Summary of customFields
     *
     * @return MorphMany<CustomField, Client>
     */
    public function customFields(): MorphMany
    {
        return $this->morphMany(CustomField::class, 'model');
    }

    /**
     * Summary of tags
     *
     * @return MorphToMany<Tag, Client>
     */
    public function tags(): MorphToMany
    {
        return $this->morphToMany(Tag::class, 'taggable')->withTimestamps();
    }

    /**
     * Summary of activities
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany<Activity, Client>
     */
    public function activities(): HasMany
    {
        return $this->hasMany(Activity::class)->latest();
    }

    /**
     * Get all of the client's reminders.
     *
     * @return MorphMany<Reminder, Client>
     */
    public function reminders(): MorphMany
    {
        return $this->morphMany(Reminder::class, 'remindable');
    }

    /**
     * Get all of the client's projects.
     *
     * @return HasMany<Project, Client>
     */
    public function projects(): HasMany
    {
        return $this->hasMany(Project::class);
    }

    /**
     * Summary of scopeForUser
     *
     * @param  mixed  $query
     */
    public function scopeForUser($query): mixed
    {
        $user_id = auth()->id();

        return $query->where('user_id', $user_id);
    }

    /**
     * Scope a query to only include active clients.
     *
     * @param  mixed  $query
     */
    public function scopeActive($query): mixed
    {
        return $query->where('status', ClientStatus::ACTIVE->value);
    }

    /**
     * Summary of booted
     */
    protected static function booted(): void
    {
        // auto set user_id
        static::creating(function ($client) {

            $client->user_id = auth()->id();
        });
    }

    /**
     * Summary of casts
     *
     * @return array{created_at: string}
     */
    protected function casts(): array
    {
        return [
            'created_at' => 'datetime:d M Y, h:i A',
        ];
    }
}
