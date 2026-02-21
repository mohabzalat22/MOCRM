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
     * Scope a query to include non-inactive clients.
     *
     * @param  mixed  $query
     */
    public function scopeNotInactive($query): mixed
    {
        return $query->where('status', '!=', ClientStatus::IN_ACTIVE->value);
    }

    /**
     * Scope a query to include healthy clients.
     *
     * @param  mixed  $query
     */
    public function scopeHealthy($query): mixed
    {
        return $query->notInactive()
            ->whereHas('activities', function ($query) {
                $query->where('created_at', '>=', \Carbon\Carbon::now()->subDays(7));
            });
    }

    /**
     * Scope a query to include clients that need attention.
     *
     * @param  mixed  $query
     */
    public function scopeNeedsAttention($query): mixed
    {
        return $query->notInactive()
            ->whereHas('activities', function ($query) {
                $query->where('created_at', '>=', \Carbon\Carbon::now()->subDays(14))
                    ->where('created_at', '<', \Carbon\Carbon::now()->subDays(7));
            })
            ->whereDoesntHave('activities', function ($query) {
                $query->where('created_at', '>=', \Carbon\Carbon::now()->subDays(7));
            });
    }

    /**
     * Scope a query to include at-risk clients.
     *
     * @param  mixed  $query
     */
    public function scopeAtRisk($query): mixed
    {
        return $query->notInactive()
            ->whereDoesntHave('activities', function ($query) {
                $query->where('created_at', '>=', \Carbon\Carbon::now()->subDays(14));
            });
    }

    /**
     * Summary of booted
     */
    protected static function booted(): void
    {
        // auto set user_id
        static::creating(function ($client) {
            if (is_null($client->user_id)) {
                if (! auth()->check()) {
                    throw new \Exception('user_id is required and no authenticated user found.');
                }

                $client->user_id = auth()->id();
            }
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
