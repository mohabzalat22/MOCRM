<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Tag extends Model
{
    protected $fillable = ['name'];

    public function clients()
    {
        $this->morphedByMany(Client::class, 'taggable');
    }
}
