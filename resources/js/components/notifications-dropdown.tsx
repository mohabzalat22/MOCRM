import { Link, usePage, router } from '@inertiajs/react';
import { Bell, Check } from 'lucide-react';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { SharedData } from '@/types';

export function NotificationsDropdown() {
    const { auth } = usePage<SharedData>().props;

    // Set up polling for live notifications every 30 seconds
    useEffect(() => {
        const timer = setInterval(() => {
            router.reload({
                only: ['auth'],
            });
        }, 30000);

        return () => clearInterval(timer);
    }, []);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="group relative h-9 w-9 cursor-pointer"
                >
                    <Bell className="!size-5 opacity-80 group-hover:opacity-100" />
                    {auth.notifications.length > 0 && (
                        <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500"></span>
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className="w-80 p-0"
                align="end"
            >
                <div className="flex items-center justify-between border-b px-4 py-2">
                    <h3 className="text-sm font-semibold">
                        Notifications
                    </h3>
                    {auth.notifications.length > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                            onClick={() =>
                                router.post(
                                    '/notifications/mark-as-read',
                                )
                            }
                        >
                            Mark all as read
                        </Button>
                    )}
                </div>
                <div className="max-h-[400px] overflow-y-auto">
                    {auth.notifications.length === 0 ? (
                        <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                            No new notifications
                        </div>
                    ) : (
                        auth.notifications.map(
                            (notification) => (
                                <div
                                    key={notification.id}
                                    className="group/item relative flex flex-col space-y-1 border-b px-4 py-3 last:border-0 hover:bg-neutral-50 dark:hover:bg-neutral-900"
                                >
                                    <div className="flex items-start justify-between">
                                        <span className="pr-6 text-sm font-medium">
                                            {
                                                notification
                                                    .data
                                                    .title
                                            }
                                        </span>
                                        <span className="text-[10px] whitespace-nowrap text-muted-foreground">
                                            {new Date(
                                                notification.created_at,
                                            ).toLocaleTimeString(
                                                [],
                                                {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                },
                                            )}
                                        </span>
                                    </div>
                                    <p className="line-clamp-2 text-xs text-muted-foreground">
                                        {
                                            notification
                                                .data
                                                .description
                                        }
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <span
                                                className={cn(
                                                    'rounded px-1.5 py-0.5 text-[10px] font-bold uppercase',
                                                    notification
                                                        .data
                                                        .priority ===
                                                        'high'
                                                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                        : notification
                                                                .data
                                                                .priority ===
                                                            'medium'
                                                            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                            : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
                                                )}
                                            >
                                                {
                                                    notification
                                                        .data
                                                        .priority
                                                }
                                            </span>
                                            <span className="text-[10px] text-muted-foreground">
                                                Type:{' '}
                                                {notification
                                                    .data
                                                    .remindable_type
                                                    ? notification.data.remindable_type
                                                          .split(
                                                              '\\',
                                                          )
                                                          .pop()
                                                    : 'General'}
                                            </span>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 opacity-0 transition-opacity group-hover/item:opacity-100"
                                            onClick={() =>
                                                router.post(
                                                    `/notifications/${notification.id}/mark-as-read`,
                                                )
                                            }
                                            title="Mark as read"
                                        >
                                            <Check className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                            ),
                        )
                    )}
                </div>
                {auth.notifications.length > 0 && (
                    <div className="border-t p-2">
                        <Link
                            href="/reminders"
                            className="block w-full text-center text-xs text-muted-foreground hover:text-foreground hover:underline"
                        >
                            View all reminders
                        </Link>
                    </div>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
