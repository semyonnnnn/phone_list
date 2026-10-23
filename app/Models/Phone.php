<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

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
}
