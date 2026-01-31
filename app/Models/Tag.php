<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Tag extends Model
{
    protected $fillable = ['name', 'color', 'usage_count'];

    public function clients()
    {
        $this->morphedByMany(Client::class, 'taggable');
    }

    public static function getPopular($limit = 10)
    {
        return self::orderBy('usage_count', 'desc')->limit($limit)->get();
    }

    public static function getByType($type, $limit = 10)
    {
        return self::whereHas('taggables', function ($query) use ($type) {
            $query->where('taggable_type', $type);
        })
            ->orderBy('usage_count', 'desc')
            ->limit($limit)
            ->get();
    }

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
