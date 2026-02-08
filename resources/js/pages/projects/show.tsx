import { Head, Link } from '@inertiajs/react';
import { format } from 'date-fns';
import { ArrowLeft, Calendar, FileText, User } from 'lucide-react';
import { useState } from 'react';
import { ProjectTimeline } from '@/components/projects/ProjectTimeline';
import { TaskList } from '@/components/projects/TaskList';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TooltipProvider } from '@/components/ui/tooltip';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, Project } from '@/types';

interface ProjectShowProps {
    project: Project;
}

const statusMap = {
    not_started: { label: 'Not Started', variant: 'secondary' as const },
    in_progress: { label: 'In Progress', variant: 'default' as const },
    on_hold: { label: 'On Hold', variant: 'outline' as const },
    completed: { label: 'Completed', variant: 'success' as const },
    cancelled: { label: 'Cancelled', variant: 'destructive' as const },
};

export default function ProjectShow({ project }: ProjectShowProps) {
    const [activeTab, setActiveTab] = useState<'tasks' | 'timeline'>('tasks');
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Projects', href: '/projects' },
        { title: project.name, href: `/projects/${project.id}` },
    ];

    const status =
        statusMap[project.status as keyof typeof statusMap] ||
        statusMap.not_started;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${project.name} - Project`} />

            <TooltipProvider>
                <div className="w-full space-y-8 p-6">
                    <div className="flex flex-col gap-6">
                        <div className="space-y-1">
                            <Link
                                href="/projects"
                                className="mb-2 flex items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
                            >
                                <ArrowLeft className="mr-1 h-3 w-3" /> Back to
                                projects
                            </Link>
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-center gap-3">
                                    <h1 className="text-3xl font-bold tracking-tight">
                                        {project.name}
                                    </h1>
                                    <Badge variant={status.variant}>
                                        {status.label}
                                    </Badge>
                                </div>

                                <div className="flex items-center bg-muted/50 p-1 rounded-lg self-start sm:self-auto">
                                    <Button
                                        variant={activeTab === 'tasks' ? 'default' : 'ghost'}
                                        size="sm"
                                        onClick={() => setActiveTab('tasks')}
                                        className="rounded-md"
                                    >
                                        Tasks
                                    </Button>
                                    <Button
                                        variant={activeTab === 'timeline' ? 'default' : 'ghost'}
                                        size="sm"
                                        onClick={() => setActiveTab('timeline')}
                                        className="rounded-md"
                                    >
                                        Timeline
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-8 gap-y-4 rounded-xl border bg-card/50 p-4 shadow-sm">
                            <div className="flex items-center gap-2 text-sm">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium text-muted-foreground">Client:</span>
                                <Link
                                    href={`/clients/${project.client_id}`}
                                    className="font-semibold text-primary hover:underline"
                                >
                                    {project.client?.name}
                                </Link>
                            </div>
                            
                            <div className="flex items-center gap-2 text-sm">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium text-muted-foreground">Start:</span>
                                <span className="font-semibold text-foreground">
                                    {format(new Date(project.start_date), 'MMM d, yyyy')}
                                </span>
                            </div>

                            {project.end_date && (
                                <div className="flex items-center gap-2 text-sm">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium text-muted-foreground">End:</span>
                                    <span className="font-semibold text-foreground">
                                        {format(new Date(project.end_date), 'MMM d, yyyy')}
                                    </span>
                                </div>
                            )}

                            {project.description && (
                                <div className="flex items-center gap-2 text-sm ml-auto">
                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                    <span className="max-w-md truncate text-muted-foreground italic">
                                        {project.description}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="w-full">
                        {activeTab === 'tasks' ? (
                            <TaskList
                                projectId={project.id}
                                tasks={project.tasks || []}
                            />
                        ) : (
                            <ProjectTimeline
                                tasks={project.tasks || []}
                                projectStartDate={project.start_date}
                            />
                        )}
                    </div>
                </div>
            </TooltipProvider>
        </AppLayout>
    );
}
