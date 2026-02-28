import { Link, usePage } from '@inertiajs/react';
import {
    ListChecks,
    LayoutGrid,
    User,
    Bell,
    Activity,
} from 'lucide-react';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
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

export function AppSidebar() {
    const { auth } = usePage<SharedData>().props;

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
            title: 'Projects',
            href: '/projects',
            icon: ListChecks,
        },
        {
            title: 'Activities',
            href: '/activities',
            icon: Activity,
        },
        {
            title: 'Reminders',
            href: '/reminders',
            icon: Bell,
            badge:
                auth.today_reminders_count && auth.today_reminders_count > 0
                    ? auth.today_reminders_count
                    : undefined,
        },
    ];

    const footerNavItems: NavItem[] = [];


    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild className="group-data-[collapsible=icon]:justify-center">
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
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
