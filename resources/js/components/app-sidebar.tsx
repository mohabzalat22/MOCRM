import { Link, usePage, router } from '@inertiajs/react';
import { LayoutGrid, User, Bell, Check } from 'lucide-react';
import { useEffect } from 'react';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';
import type { NavItem, SharedData } from '@/types';


import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Clients',
        href: '/clients',
        icon: User,
    },
    {
        title: 'Reminders',
        href: '/reminders',
        icon: Bell,
    },
];

const footerNavItems: NavItem[] = [];

export function AppSidebar() {
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
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem className="flex items-center justify-between">
                        <SidebarMenuButton size="lg" asChild className="flex-1">
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>

                        <div className="flex items-center pr-2">
                             <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="group relative h-8 w-8 cursor-pointer"
                                    >
                                        <Bell className="!size-4 opacity-80 group-hover:opacity-100" />
                                        {auth.notifications.length > 0 && (
                                            <span className="absolute top-1 right-1 flex h-2 w-2">
                                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                                                <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500"></span>
                                            </span>
                                        )}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-80 p-0" align="start" side="right">
                                    <div className="flex items-center justify-between border-b px-4 py-2">
                                        <h3 className="text-sm font-semibold">Notifications</h3>
                                        {auth.notifications.length > 0 && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                                                onClick={() => router.post('/notifications/mark-as-read')}
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
                                            auth.notifications.map((notification) => (
                                                <div
                                                    key={notification.id}
                                                    className="group/item relative flex flex-col space-y-1 border-b px-4 py-3 last:border-0 hover:bg-neutral-50 dark:hover:bg-neutral-900"
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <span className="text-sm font-medium pr-6">{notification.data.title}</span>
                                                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                                            {new Date(notification.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                    <p className="line-clamp-2 text-xs text-muted-foreground">
                                                        {notification.data.description}
                                                    </p>
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center space-x-2">
                                                            <span className={cn(
                                                                "rounded px-1.5 py-0.5 text-[10px] uppercase font-bold",
                                                                notification.data.priority === 'high' ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                                                                notification.data.priority === 'medium' ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" :
                                                                "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                                            )}>
                                                                {notification.data.priority}
                                                            </span>
                                                            <span className="text-[10px] text-muted-foreground">
                                                                Type: {notification.data.remindable_type ? notification.data.remindable_type.split('\\').pop() : 'General'}
                                                            </span>
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-6 w-6 opacity-0 group-hover/item:opacity-100 transition-opacity"
                                                            onClick={() => router.post(`/notifications/${notification.id}/mark-as-read`)}
                                                            title="Mark as read"
                                                        >
                                                            <Check className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))
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
                        </div>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
