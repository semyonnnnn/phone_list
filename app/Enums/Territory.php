<?php

namespace App\Enums;

enum Territory: string
{
    case ekb = 'ЕКБ';
    case krg = 'КРГ';

    // ['ekb', 'krg'] — what the DB stores and what requests send
    public static function keys(): array
    {
        return array_column(self::cases(), 'name');
    }

    // ['ЕКБ', 'КРГ']
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    // DB key -> case. Backed-enum from() works on values, not names,
    // so constant() is the lookup by name. Throws if the key is unknown.
    public static function fromKey(string $key): self
    {
        return constant(self::class . '::' . $key);
    }

    // Dropdown data for the frontend: key is submitted, label is shown.
    public static function options(): array
    {
        return array_map(
            fn(self $t) => ['key' => $t->name, 'label' => $t->value],
            self::cases()
        );
    }
}
