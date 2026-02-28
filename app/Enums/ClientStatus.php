<?php

namespace App\Enums;

enum ClientStatus: string
{
    case ACTIVE = 'Active';
    case LEAD = 'Lead';
    case AT_RISK = 'At Risk';
    case IN_ACTIVE = 'In Active';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
