import { Link } from '@inertiajs/react';
import { AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Task } from '@/types';

interface DueTodayTasksListProps {
    tasks: Task[];
}

export function DueTodayTasksList({ tasks }: DueTodayTasksListProps) {
    return (
        <Card className="flex h-full flex-col overflow-hidden border-none shadow-none bg-transparent">
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
                                <div className="space-y-1 min-w-0">
                                    <p className="text-sm font-medium leading-none truncate">
                                        {task.description}
                                    </p>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Link
                                            href={`/projects/${task.project_id}`}
                                            className="hover:underline truncate"
                                        >
                                            {task.project?.name}
                                        </Link>
                                        <span className="h-1 w-1 rounded-full bg-border" />
                                        <span className="truncate">{task.project?.client?.name}</span>
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
