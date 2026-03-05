import { Link } from '@inertiajs/react';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn } from '@/lib/utils';

interface ProjectHeaderProps {
    title: string;
    description: string;
    children?: React.ReactNode;
}

export function ProjectHeader({
    title,
    description,
    children,
}: ProjectHeaderProps) {
    const { isCurrentUrl } = useCurrentUrl();

    const tabs = [
        { name: 'Projects', href: '/projects' },
        { name: 'Templates', href: '/project-templates' },
    ];

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col items-start justify-between gap-4 px-6 pt-6 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        {title}
                    </h1>
                    <p className="text-muted-foreground">{description}</p>
                </div>
                {children}
            </div>

            <div className="border-b px-6">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    {tabs.map((tab) => (
                        <Link
                            key={tab.name}
                            href={tab.href}
                            className={cn(
                                isCurrentUrl(tab.href)
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-muted-foreground hover:border-gray-300 hover:text-foreground',
                                'border-b-2 px-1 py-4 text-sm font-medium whitespace-nowrap transition-colors',
                            )}
                        >
                            {tab.name}
                        </Link>
                    ))}
                </nav>
            </div>
        </div>
    );
}
