import { usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { useLayoutStore } from '@/stores/useLayoutStore';
import type { SharedData } from '@/types';

type Props = {
    children: ReactNode;
    variant?: 'header' | 'sidebar';
};

export function AppShell({ children, variant = 'header' }: Props) {
    const isOpen = usePage<SharedData>().props.sidebarOpen;
    const { isContained } = useLayoutStore();

    if (variant === 'header') {
        return (
            <div
                className={cn(
                    'flex min-h-screen w-full flex-col',
                    isContained && 'mx-auto max-w-[1800px] border-x',
                )}
            >
                {children}
            </div>
        );
    }

    return (
        <div
            className={cn(
                'flex min-h-screen w-full',
                isContained &&
                    'justify-center bg-neutral-100 dark:bg-neutral-950',
            )}
        >
            <div
                className={cn(
                    'flex w-full',
                    isContained &&
                        'relative mx-auto max-w-[1800px] border-x bg-background shadow-sm',
                )}
            >
                <SidebarProvider defaultOpen={isOpen}>
                    {children}
                </SidebarProvider>
            </div>
        </div>
    );
}
