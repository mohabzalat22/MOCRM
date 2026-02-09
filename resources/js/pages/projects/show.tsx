import { Head, Link, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { ArrowLeft, Calendar, FileText, User, FolderArchive, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import ActivityTimeline from '@/components/clients/activity-timeline';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { ProjectQuickSwitcher } from '@/components/projects/project-quick-switcher';
import { ProjectFiles } from '@/components/projects/ProjectFiles';
import { ProjectTimeline } from '@/components/projects/ProjectTimeline';
import { ProjectUpdates } from '@/components/projects/ProjectUpdates';
import { TaskList } from '@/components/projects/TaskList';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TooltipProvider } from '@/components/ui/tooltip';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, Project } from '@/types';

interface ProjectShowProps {
    project: Project;
    siblingProjects: { id: number; name: string; status: string }[];
}

const statusMap = {
    not_started: { label: 'Not Started', variant: 'secondary' as const },
    in_progress: { label: 'In Progress', variant: 'default' as const },
    on_hold: { label: 'On Hold', variant: 'outline' as const },
    completed: { label: 'Completed', variant: 'success' as const },
    cancelled: { label: 'Cancelled', variant: 'destructive' as const },
};

export default function ProjectShow({ project, siblingProjects = [] }: ProjectShowProps) {
    const [activeTab, setActiveTab] = useState<'tasks' | 'timeline' | 'updates' | 'activity' | 'files'>('tasks');
    const [confirmArchive, setConfirmArchive] = useState(false);
    
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Projects', href: '/projects' },
        { title: project.name, href: `/projects/${project.id}` },
    ];

    const status =
        statusMap[project.status as keyof typeof statusMap] ||
        statusMap.not_started;

    const handleStatusChange = (newStatus: string) => {
        router.put(`/projects/${project.id}`, {
            status: newStatus,
        }, {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${project.name} - Project`} />

            <TooltipProvider>
                <div className="w-full space-y-8 p-6">
                    <div className="flex flex-col gap-6">
                        <div className="space-y-1">
                            <div className="flex items-center justify-between">
                                <Link
                                    href="/projects"
                                    className="mb-2 flex items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
                                >
                                    <ArrowLeft className="mr-1 h-3 w-3" /> Back to projects
                                </Link>
                                <ProjectQuickSwitcher 
                                    currentProjectId={project.id}
                                    siblingProjects={siblingProjects}
                                />
                            </div>
                            
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-center gap-3">
                                    <h1 className="text-3xl font-bold tracking-tight">
                                        {project.name}
                                    </h1>
                                    <Badge variant={status.variant}>
                                        {status.label}
                                    </Badge>
                                </div>

                                <div className="flex items-center gap-2">
                                    {/* Action Buttons */}
                                    {['completed', 'cancelled'].includes(project.status) ? (
                                        <Button 
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleStatusChange('in_progress')}
                                            className="gap-2"
                                        >
                                            <RotateCcw className="h-4 w-4" />
                                            Restore Project
                                        </Button>
                                    ) : (
                                        <Button 
                                            variant="outline" 
                                            size="sm"
                                            onClick={() => setConfirmArchive(true)}
                                            className="gap-2 text-destructive hover:text-destructive"
                                        >
                                            <FolderArchive className="h-4 w-4" />
                                            Archive Project
                                        </Button>
                                    )}

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
                                        <Button
                                            variant={activeTab === 'activity' ? 'default' : 'ghost'}
                                            size="sm"
                                            onClick={() => setActiveTab('activity')}
                                            className="rounded-md"
                                        >
                                            Activity
                                        </Button>
                                        <Button
                                            variant={activeTab === 'files' ? 'default' : 'ghost'}
                                            size="sm"
                                            onClick={() => setActiveTab('files')}
                                            className="rounded-md"
                                        >
                                            Files
                                        </Button>
                                    </div>
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
                                    {project.start_date ? format(new Date(project.start_date), 'MMM d, yyyy') : 'N/A'}
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
                        ) : activeTab === 'timeline' ? (
                            <ProjectTimeline
                                tasks={project.tasks || []}
                                projectStartDate={project.start_date || new Date().toISOString()}
                            />
                        ) : activeTab === 'activity' ? (
                            <div className="space-y-6">
                                <ProjectUpdates project={project} />
                                <ActivityTimeline
                                    activities={project.activities || []}
                                    client={project.client!}
                                    hideFilters={true}
                                    hideExport={true}
                                    allowedTypes={new Set(['note'])}
                                />
                            </div>
                        ) : (
                            <ProjectFiles
                                project={project}
                            />
                        )}
                    </div>
                </div>

                <ConfirmDialog
                    isOpen={confirmArchive}
                    title="Archive Project?"
                    message="Values this project as completed? It will be moved to the active archive."
                    onConfirm={() => {
                        handleStatusChange('completed');
                        setConfirmArchive(false);
                    }}
                    onCancel={() => setConfirmArchive(false)}
                />
            </TooltipProvider>
        </AppLayout>
    );
}
