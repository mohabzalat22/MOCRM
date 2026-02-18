import { Link } from '@inertiajs/react';
import { AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Task } from '@/types';

interface DueTodayTasksListProps {
    tasks: Task[];
}

export function DueTodayTasksList({ tasks }: DueTodayTasksListProps) {
    return (
        <Card className="flex h-full flex-col overflow-hidden border-sidebar-border/70 bg-white shadow-sm dark:border-sidebar-border dark:bg-transparent">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                    <AlertCircle className="h-4 w-4 text-orange-500" />
                    Due Today
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto p-0">
                {tasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <AlertCircle className="mb-2 h-8 w-8 text-muted-foreground/50" />
                        <p className="px-4 text-sm text-muted-foreground">
                            No tasks due today.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-border">
                        {tasks.map((task) => (
                            <div
                                key={task.id}
                                className="p-4 transition-colors hover:bg-muted/50"
                            >
                                <div className="min-w-0 space-y-1">
                                    <p className="truncate text-sm leading-none font-medium">
                                        {task.description}
                                    </p>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Link
                                            href={`/projects/${task.project_id}`}
                                            className="truncate hover:underline"
                                        >
                                            {task.project?.name}
                                        </Link>
                                        <span className="h-1 w-1 rounded-full bg-border" />
                                        <span className="truncate">
                                            {task.project?.client?.name}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
