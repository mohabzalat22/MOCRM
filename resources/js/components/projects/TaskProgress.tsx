import { Progress } from '@/components/ui/progress';

interface TaskProgressProps {
    completed: number;
    total: number;
}

export function TaskProgress({ completed, total }: TaskProgressProps) {
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-muted-foreground">
                    Progress
                </span>
                <span className="font-medium text-muted-foreground">
                    {completed} of {total} tasks completed ({percentage}%)
                </span>
            </div>
            <Progress value={percentage} className="h-2" />
        </div>
    );
}
