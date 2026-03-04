import { AlignHorizontalSpaceAround } from 'lucide-react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { useLayoutStore } from '@/stores/useLayoutStore';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';
import { GlobalSearch } from './global-search';
import { NotificationsDropdown } from './notifications-dropdown';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    const { isContained, toggleContained } = useLayoutStore();

    return (
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-sidebar-border/50 px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>
            <div className="flex items-center gap-2">
                <GlobalSearch />
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9"
                            onClick={toggleContained}
                        >
                            <AlignHorizontalSpaceAround className="h-5 w-5" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>
                            {isContained
                                ? 'Full-width Layout'
                                : 'Contained Layout'}
                        </p>
                    </TooltipContent>
                </Tooltip>
                <NotificationsDropdown />
            </div>
        </header>
    );
}
