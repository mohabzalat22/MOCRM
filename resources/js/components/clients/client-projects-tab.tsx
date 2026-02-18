import { Link } from '@inertiajs/react';
import { format } from 'date-fns';
import { ArrowRight, CheckCircle2, Clock, Plus } from 'lucide-react';
import { useState } from 'react';
import { ProjectForm } from '@/components/projects/project-form';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Project } from '@/types';

interface ClientProjectsTabProps {
    projects: Project[];
    client: { id: number | string; name: string };
}

const statusMap = {
    not_started: { label: 'Not Started', variant: 'secondary' as const },
    in_progress: { label: 'In Progress', variant: 'default' as const },
    on_hold: { label: 'On Hold', variant: 'outline' as const },
    completed: { label: 'Completed', variant: 'success' as const },
    cancelled: { label: 'Cancelled', variant: 'destructive' as const },
};

export default function ClientProjectsTab({
    projects,
    client,
}: ClientProjectsTabProps) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const activeProjects = projects.filter((p) =>
        ['not_started', 'in_progress', 'on_hold'].includes(p.status),
    );
    const archivedProjects = projects.filter((p) =>
        ['completed', 'cancelled'].includes(p.status),
    );

    const ProjectCard = ({ project }: { project: Project }) => {
        const status =
            statusMap[project.status as keyof typeof statusMap] ||
            statusMap.not_started;
        const tasksCount = project.tasks_count || 0;
        const completedTasks = project.completed_tasks_count || 0;
        const progress =
            tasksCount > 0
                ? Math.round((completedTasks / tasksCount) * 100)
                : 0;

        return (
            <Card className="transition-shadow hover:shadow-md">
                <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                        <div>
                            <CardTitle className="text-lg font-semibold">
                                <Link
                                    href={`/projects/${project.id}`}
                                    className="hover:underline"
                                >
                                    {project.name}
                                </Link>
                            </CardTitle>
                            <CardDescription className="mt-1 flex items-center gap-2">
                                <Badge
                                    variant={status.variant}
                                    className="text-xs"
                                >
                                    {status.label}
                                </Badge>
                                {project.end_date && (
                                    <span className="flex items-center text-xs text-muted-foreground">
                                        <Clock className="mr-1 h-3 w-3" />
                                        Due{' '}
                                        {format(
                                            new Date(project.end_date),
                                            'MMM d, yyyy',
                                        )}
                                    </span>
                                )}
                            </CardDescription>
                        </div>
                        <Button variant="ghost" size="icon" asChild>
                            <Link href={`/projects/${project.id}`}>
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex items-end justify-between text-sm">
                        <div className="flex items-center text-muted-foreground">
                            <CheckCircle2 className="mr-1.5 h-4 w-4" />
                            <span>
                                {completedTasks}/{tasksCount} Tasks
                            </span>
                        </div>
                        <div className="font-medium text-muted-foreground">
                            {progress}%
                        </div>
                    </div>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                        <div
                            className="h-full bg-primary transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </CardContent>
            </Card>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-medium">Projects</h3>
                    <p className="text-sm text-muted-foreground">
                        Manage projects for {client.name}
                    </p>
                </div>
                <Button
                    onClick={() => setIsCreateOpen(true)}
                    size="sm"
                    type="button"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    New Project
                </Button>
            </div>

            <Tabs defaultValue="active" className="w-full">
                <TabsList>
                    <TabsTrigger value="active">
                        Active ({activeProjects.length})
                    </TabsTrigger>
                    <TabsTrigger value="archived">
                        Archived ({archivedProjects.length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="active" className="mt-4 space-y-4">
                    {activeProjects.length === 0 ? (
                        <div className="rounded-lg border border-dashed py-12 text-center text-muted-foreground">
                            <p>No active projects found.</p>
                            <Button
                                variant="link"
                                onClick={() => setIsCreateOpen(true)}
                            >
                                Create one?
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            {activeProjects.map((project) => (
                                <ProjectCard
                                    key={project.id}
                                    project={project}
                                />
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="archived" className="mt-4 space-y-4">
                    {archivedProjects.length === 0 ? (
                        <div className="rounded-lg border border-dashed py-12 text-center text-muted-foreground">
                            <p>No archived projects.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            {archivedProjects.map((project) => (
                                <ProjectCard
                                    key={project.id}
                                    project={project}
                                />
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Add New Project</DialogTitle>
                        <DialogDescription>
                            Create a new project for {client.name}.
                        </DialogDescription>
                    </DialogHeader>
                    <ProjectForm
                        clients={[{ ...client, id: Number(client.id) }]}
                        defaultClientId={Number(client.id)}
                        onSuccess={() => setIsCreateOpen(false)}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}
