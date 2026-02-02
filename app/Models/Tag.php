<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;

class Tag extends Model
{
    /**
     * Summary of fillable
     *
     * @var array
     */
    protected $fillable = ['name', 'color', 'usage_count'];

    /**
     * Summary of clients
     */
    public function clients(): void
    {
        $this->morphedByMany(Client::class, 'taggable');
    }

    /**
     * Summary of getPopular
     *
     * @param  mixed  $limit
     * @return \Illuminate\Database\Eloquent\Collection<int, Tag>|\Illuminate\Support\Collection<int, \stdClass>
     */
    public static function getPopular($limit = 10): Collection
    {
        return self::orderBy('usage_count', 'desc')->limit($limit)->get();
    }

    /**
     * Summary of getByType
     *
     * @param  mixed  $type
     * @param  mixed  $limit
     * @return \Illuminate\Database\Eloquent\Collection<int, Tag>|\Illuminate\Support\Collection<int, \stdClass>
     */
    public static function getByType($type, $limit = 10): Collection
    {
        return self::whereHas('taggables', function ($query) use ($type) {
            $query->where('taggable_type', $type);
        })
            ->orderBy('usage_count', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Summary of randomColor
     */
    public static function randomColor(): string
    {
        $colors = [
            '#3B82F6',
            '#EF4444',
            '#10B981',
            '#F59E0B',
            '#8B5CF6',
            '#EC4899',
            '#06B6D4',
            '#6B7280',
            '#F97316',
            '#14B8A6',
            '#A855F7',
            '#64748B',
        ];

        return $colors[array_rand($colors)];
    }
}
