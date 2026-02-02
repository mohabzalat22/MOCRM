<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class CustomField extends Model
{
    /**
     * Summary of fillable
     *
     * @var array
     */
    protected $fillable = [
        'key',
        'value',
    ];

    /**
     * Summary of model
     *
     * @return \Illuminate\Database\Eloquent\Relations\MorphTo<Model, CustomField>
     */
    public function model(): MorphTo
    {
        return $this->morphTo();
    }
}
