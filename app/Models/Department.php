<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Department extends Model
{
    protected $table = 'departments';

    private const FIRST = 'руководство';

    public static function getFirst(): string
    {
        return self::FIRST;
    }

    protected $fillable = [
        'name',
    ];

    public function phones(): HasMany
    {
        return $this->hasMany(Phone::class);
    }
}
