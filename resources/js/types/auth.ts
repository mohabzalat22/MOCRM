export type User = {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    avatar_url?: string | null;
    business_name?: string | null;
    business_logo_url?: string | null;
    timezone?: string;
    date_format?: string;
    currency?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
};

export interface Notification {
    id: string;
    type: string;
    notifiable_type: string;
    notifiable_id: number;
    data: {
        message?: string;
        title?: string;
        description?: string;
        priority?: 'low' | 'medium' | 'high';
        remindable_type?: string;
        url?: string;
        [key: string]: unknown;
    };
    read_at: string | null;
    created_at: string;
    updated_at: string;
}

export type Auth = {
    user: User;
    notifications: Notification[];
};

export type TwoFactorSetupData = {
    svg: string;
    url: string;
};

export type TwoFactorSecretKey = {
    secretKey: string;
};
