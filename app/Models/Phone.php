<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Phone extends Model
{
    protected $table = 'phones';

    protected $fillable = [
        'person',
        'extension',
        'phone',
        'file_id',
        'cabinet',
        'ip',
        'isBoss',
        'isMiniBoss',
        'department_id',
    ];

    protected function casts(): array
    {
        return [
            'isBoss' => 'boolean',
            'isMiniBoss' => 'boolean',
        ];
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }
}
