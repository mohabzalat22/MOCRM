import { Link } from '@inertiajs/react';
import { format } from 'date-fns';
import { ArrowRight, CheckCircle2, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Project } from '@/types';

interface ActiveProjectsListProps {
    projects: Project[];
}

const statusMap = {
    not_started: { label: 'Not Started', variant: 'secondary' as const },
    in_progress: { label: 'In Progress', variant: 'default' as const },
    on_hold: { label: 'On Hold', variant: 'outline' as const },
    completed: { label: 'Completed', variant: 'success' as const },
    cancelled: { label: 'Cancelled', variant: 'destructive' as const },
};

export function ActiveProjectsList({ projects }: ActiveProjectsListProps) {
    return (
        <Card className="h-full border-sidebar-border/70 bg-white shadow-sm dark:border-sidebar-border dark:bg-transparent">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                    Active Projects
                </CardTitle>
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="h-6 px-2 text-xs text-muted-foreground hover:text-primary"
                    >
                        <Link href="/projects?status=active">
                            View All <ArrowRight className="ml-1 h-3 w-3" />
                        </Link>
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
                {projects.length === 0 ? (
                    <div className="py-6 text-center text-sm text-muted-foreground">
                        No active projects.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {projects.map((project) => {
                            const status =
                                statusMap[
                                    project.status as keyof typeof statusMap
                                ] || statusMap.not_started;
                            const tasksCount = project.tasks_count || 0;
                            const completedTasks =
                                project.completed_tasks_count || 0;
                            const progress =
                                tasksCount > 0
                                    ? Math.round(
                                          (completedTasks / tasksCount) * 100,
                                      )
                                    : 0;

                            return (
                                <div
                                    key={project.id}
                                    className="group flex flex-col gap-2 rounded-lg border p-3 transition-colors hover:bg-muted/50 sm:flex-row sm:items-center sm:justify-between"
                                >
                                    <div className="min-w-0 space-y-1">
                                        <div className="flex items-center gap-2">
                                            <Link
                                                href={`/projects/${project.id}`}
                                                className="truncate text-sm font-semibold hover:underline"
                                            >
                                                {project.name}
                                            </Link>
                                            <Badge
                                                variant={status.variant}
                                                className="h-5 truncate px-1.5 py-0.5 text-[10px]"
                                            >
                                                {status.label}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                            <span className="truncate">
                                                {project.client?.name}
                                            </span>
                                            {project.end_date && (
                                                <span className="flex shrink-0 items-center">
                                                    <Clock className="mr-1 h-3 w-3" />
                                                    {format(
                                                        new Date(
                                                            project.end_date,
                                                        ),
                                                        'MMM d',
                                                    )}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-2 flex w-full items-center justify-between gap-4 sm:mt-0 sm:w-auto">
                                        <div className="flex w-full flex-col items-end gap-1 sm:w-[100px]">
                                            <div className="flex w-full items-center justify-end text-xs text-muted-foreground">
                                                <span className="flex items-center">
                                                    <CheckCircle2 className="mr-1 h-3 w-3" />
                                                    {completedTasks}/
                                                    {tasksCount}
                                                </span>
                                            </div>
                                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                                                <div
                                                    className="h-full bg-primary transition-all duration-500"
                                                    style={{
                                                        width: `${progress}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
