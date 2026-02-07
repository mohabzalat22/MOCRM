import { Head, Link } from '@inertiajs/react';
import { format } from 'date-fns';
import { ArrowLeft, Calendar, FileText, User } from 'lucide-react';
import { TaskList } from '@/components/projects/TaskList';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
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

            <div className="w-full space-y-8 p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                        <Link
                            href="/projects"
                            className="mb-2 flex items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                            <ArrowLeft className="mr-1 h-3 w-3" /> Back to
                            projects
                        </Link>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold tracking-tight">
                                {project.name}
                            </h1>
                            <Badge variant={status.variant}>
                                {status.label}
                            </Badge>
                        </div>
                        <p className="font-medium text-muted-foreground">
                            Project with {project.client?.name}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    <div className="space-y-8 lg:col-span-2">
                        {project.description && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                                        <FileText className="h-4 w-4" />{' '}
                                        Description
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm whitespace-pre-wrap text-muted-foreground">
                                        {project.description}
                                    </p>
                                </CardContent>
                            </Card>
                        )}

                        <TaskList
                            projectId={project.id}
                            initialTasks={project.tasks || []}
                        />
                    </div>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base font-semibold">
                                    Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 font-medium text-muted-foreground">
                                        <Calendar className="h-4 w-4" /> Start
                                        Date
                                    </div>
                                    <span>
                                        {format(
                                            new Date(project.start_date),
                                            'MMM d, yyyy',
                                        )}
                                    </span>
                                </div>
                                {project.end_date && (
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2 font-medium text-muted-foreground">
                                            <Calendar className="h-4 w-4" /> End
                                            Date
                                        </div>
                                        <span>
                                            {format(
                                                new Date(project.end_date),
                                                'MMM d, yyyy',
                                            )}
                                        </span>
                                    </div>
                                )}
                                <Separator />
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 font-medium text-muted-foreground">
                                        <User className="h-4 w-4" /> Client
                                    </div>
                                    <Link
                                        href={`/clients/${project.client_id}`}
                                        className="text-primary hover:underline"
                                    >
                                        {project.client?.name}
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
