<?php

namespace App\Enums;

enum ClientStatus: string
{
    case ACTIVE = 'Active';
    case LEAD = 'Lead';
    case AT_RISK = 'At Risk';
    case IN_ACTIVE = 'In Active';
}
