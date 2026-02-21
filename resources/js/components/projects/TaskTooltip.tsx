import { format, differenceInDays } from 'date-fns';
import { Calendar, Clock, AlertTriangle } from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { Task } from '@/types/project';
import { STATUS_COLORS, PRIORITY_COLORS } from './timeline/constants';

interface TaskTooltipProps {
    task: Task;
    children: React.ReactNode;
    side?: 'top' | 'right' | 'bottom' | 'left';
}

export function TaskTooltip({
    task,
    children,
    side = 'top',
}: TaskTooltipProps) {
    const isLate =
        task.due_date &&
        new Date(task.due_date) < new Date() &&
        task.status !== 'done';

    const colors = STATUS_COLORS[task.status] ?? STATUS_COLORS.todo;
    const priority = PRIORITY_COLORS[task.priority] ?? PRIORITY_COLORS.medium;

    return (
        <Tooltip delayDuration={200}>
            <TooltipTrigger asChild>{children}</TooltipTrigger>
            <TooltipContent
                side={side}
                className="max-w-[280px] rounded-lg border border-border bg-popover p-0 shadow-xl"
            >
                <div className="space-y-2.5 p-3">
                    {/* Title */}
                    <p className="text-[13px] leading-tight font-bold text-foreground">
                        {task.title}
                    </p>

                    {/* Status + Priority badges */}
                    <div className="flex flex-wrap items-center gap-1.5">
                        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                            <span
                                className={cn(
                                    'h-1.5 w-1.5 rounded-full',
                                    colors.dot,
                                )}
                            />
                            {colors.label}
                        </span>
                        <span
                            className={cn(
                                'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold',
                                priority.bg,
                                priority.text,
                            )}
                        >
                            {priority.label}
                        </span>
                        {isLate && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-600 dark:bg-red-950/30 dark:text-red-400">
                                <AlertTriangle className="h-2.5 w-2.5" />
                                Overdue
                            </span>
                        )}
                    </div>

                    {/* Date range */}
                    {(task.start_date || task.due_date) && (
                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                            <Calendar className="h-3 w-3 shrink-0" />
                            <span>
                                {task.start_date
                                    ? format(new Date(task.start_date), 'MMM d')
                                    : 'No start'}
                                {' → '}
                                {task.due_date
                                    ? format(
                                          new Date(task.due_date),
                                          'MMM d, yyyy',
                                      )
                                    : 'No due date'}
                            </span>
                        </div>
                    )}

                    {/* Duration */}
                    {task.start_date && task.due_date && (
                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                            <Clock className="h-3 w-3 shrink-0" />
                            <span>
                                {(() => {
                                    const start = new Date(task.start_date!);
                                    const end = new Date(task.due_date!);
                                    const d = Math.max(
                                        1,
                                        differenceInDays(end, start) + 1,
                                    );
                                    return `${d} day${d !== 1 ? 's' : ''}`;
                                })()}
                            </span>
                        </div>
                    )}

                    {/* Description excerpt */}
                    {task.description && (
                        <p className="mt-1 line-clamp-2 border-t pt-2 text-[11px] leading-relaxed text-muted-foreground">
                            {task.description}
                        </p>
                    )}
                </div>
            </TooltipContent>
        </Tooltip>
    );
}
