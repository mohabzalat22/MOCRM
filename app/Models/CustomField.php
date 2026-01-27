<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CustomField extends Model
{
    protected $fillable = [
        'key',
        'value',
    ];

    public function model()
    {
        return $this->morphTo();
    }
}
