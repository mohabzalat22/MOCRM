import type { InertiaLinkProps } from '@inertiajs/react';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function toUrl(url: NonNullable<InertiaLinkProps['href']>): string {
    return typeof url === 'string' ? url : url.url;
}

export const TAG_COLORS = [
    '#3B82F6',
    '#EF4444',
    '#10B981',
    '#F59E0B',
    '#8B5CF6',
    '#EC4899',
    '#06B6D4',
    '#6B7280',
    '#F97316',
    '#14B8A6',
    '#A855F7',
    '#64748B',
] as const;

export function getModelClass(type: string): string {
    const modelMap: Record<string, string> = {
        client: 'App\\Models\\Client',
        project: 'App\\Models\\Project',
        task: 'App\\Models\\Task',
    };
    return modelMap[type.toLowerCase()] || modelMap['client'];
}
