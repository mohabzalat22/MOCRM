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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
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
    const [currentStatus, setCurrentStatus] = useState<string>('all');

    const activeProjects = projects.filter((p) =>
        ['not_started', 'in_progress', 'on_hold'].includes(p.status),
    );

    const filteredProjects = projects.filter((p) => {
        if (currentStatus === 'active') {
            return ['not_started', 'in_progress', 'on_hold'].includes(p.status);
        }
        if (currentStatus === 'all') {
            return true;
        }
        return p.status === currentStatus;
    });

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

            <div className="flex flex-wrap items-center gap-2 py-4">
                <Select
                    value={currentStatus === 'all' ? undefined : currentStatus}
                    onValueChange={(value) => setCurrentStatus(value)}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">
                            All Statuses ({projects.length})
                        </SelectItem>
                        <SelectItem value="active">
                            Active Projects ({activeProjects.length})
                        </SelectItem>
                        <SelectItem value="not_started">Not Started</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="on_hold">On Hold</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="mt-4 space-y-4">
                {filteredProjects.length === 0 ? (
                    <div className="rounded-lg border border-dashed py-12 text-center text-muted-foreground">
                        <p>No projects found for this filter.</p>
                        {currentStatus === 'all' && (
                            <Button
                                variant="link"
                                onClick={() => setIsCreateOpen(true)}
                            >
                                Create one?
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {filteredProjects.map((project) => (
                            <ProjectCard key={project.id} project={project} />
                        ))}
                    </div>
                )}
            </div>

            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent>
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
