<?php

namespace App\Enums;

// The only place the territory list is written. The order of the cases is the order
// of the options in the switch on the page.
enum Territory: string
{
    // Case names stay Latin, because they're identifiers in code. The value is what
    // the database, the page and the validation all see.
    case Ekb = 'ЕКБ';
    case Krg = 'КРГ';

    // ['ЕКБ', 'КРГ'], the plain list the page needs.
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
