import { cn } from '@/lib/utils';
import AppLogoIcon from './app-logo-icon';

export default function AppLogo({ className }: { className?: string }) {
    return (
        <>
            <div className={cn("flex aspect-square size-10 items-center justify-center rounded-md text-sidebar-primary-foreground transition-all duration-200 group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:mx-auto", className)}>
                <AppLogoIcon />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm group-data-[collapsible=icon]:hidden">
                <span className="mb-0.5 truncate leading-tight font-semibold">
                    MOCRM
                </span>
            </div>
        </>
    );
}
