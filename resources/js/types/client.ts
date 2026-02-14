import type { Activity } from './activity';
import type { Tag } from './index';

export interface CustomField {
    key: string;
    value: string;
}

export interface Client {
    id: string | number;
    name: string;
    company_name?: string;
    email: string;
    phone?: string;
    website?: string;
    address?: string;
    image?: string;
    status: string;
    monthly_value: number;
    tags: Tag[];
    custom_fields: CustomField[];
    created_at: string;
    updated_at: string;

    // Relationships
    activities?: Activity[];
}
