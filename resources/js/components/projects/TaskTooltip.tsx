import { format, differenceInMinutes } from 'date-fns';
import { Calendar, AlertTriangle, ArrowRight, Timer } from 'lucide-react';
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
    type?: 'task' | 'milestone' | 'summary';
    delayDuration?: number;
}

function formatSmartDate(dateStr: string) {
    const d = new Date(dateStr);
    const hasTime = d.getHours() !== 0 || d.getMinutes() !== 0;
    return hasTime
        ? format(d, 'MMM d, yyyy · h:mm a')
        : format(d, 'MMM d, yyyy');
}

function formatDuration(startStr: string, endStr: string) {
    const start = new Date(startStr);
    const end = new Date(endStr);
    const totalMinutes = Math.max(0, differenceInMinutes(end, start));

    const days = Math.floor(totalMinutes / (60 * 24));
    const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
    const minutes = totalMinutes % 60;

    const parts: string[] = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);

    return parts.length > 0 ? parts.join(' ') : 'Same time';
}

function formatOverdue(dueDateStr: string) {
    const now = new Date();
    const due = new Date(dueDateStr);
    const totalMinutes = Math.max(0, differenceInMinutes(now, due));

    const days = Math.floor(totalMinutes / (60 * 24));
    const hours = Math.floor((totalMinutes % (60 * 24)) / 60);

    if (days > 0) return `${days}d ${hours}h overdue`;
    if (hours > 0) return `${hours}h overdue`;
    return 'Just overdue';
}

export function TaskTooltip({
    task,
    children,
    side = 'top',
    type = 'task',
    delayDuration = 200,
}: TaskTooltipProps) {
    const isLate =
        task.due_date &&
        new Date(task.due_date) < new Date() &&
        task.status !== 'done';

    const colors = STATUS_COLORS[task.status] ?? STATUS_COLORS.todo;
    const priority = PRIORITY_COLORS[task.priority] ?? PRIORITY_COLORS.medium;

    return (
        <Tooltip delayDuration={delayDuration}>
            <TooltipTrigger asChild>{children}</TooltipTrigger>
            <TooltipContent
                side={side}
                className="max-w-[300px] rounded-xl border border-border/80 bg-popover p-0 shadow-2xl"
            >
                <div className="p-3 pb-2.5">
                    {/* Title */}
                    <p className="text-[13px] leading-snug font-bold text-foreground">
                        {task.title}
                    </p>

                    {/* Badges */}
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        {type === 'milestone' ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                                Milestone
                            </span>
                        ) : type === 'summary' ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                                Summary
                            </span>
                        ) : (
                            <>
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
                            </>
                        )}
                        {isLate && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-600 dark:bg-red-950/30 dark:text-red-400">
                                <AlertTriangle className="h-2.5 w-2.5" />
                                {formatOverdue(task.due_date!)}
                            </span>
                        )}
                    </div>
                </div>

                {/* Date & Duration section */}
                {(task.start_date || task.due_date) && (
                    <div className="border-t border-border/50 bg-muted/20 px-3 py-2.5">
                        <div className="space-y-1.5">
                            {task.start_date && (
                                <div className="flex items-center gap-2 text-[11px]">
                                    <Calendar className="h-3 w-3 shrink-0 text-muted-foreground/60" />
                                    <span className="font-medium text-muted-foreground">
                                        Start
                                    </span>
                                    <span className="ml-auto font-semibold text-foreground/80">
                                        {formatSmartDate(task.start_date)}
                                    </span>
                                </div>
                            )}
                            {task.due_date && (
                                <div className="flex items-center gap-2 text-[11px]">
                                    <ArrowRight className="h-3 w-3 shrink-0 text-muted-foreground/60" />
                                    <span className="font-medium text-muted-foreground">
                                        Due
                                    </span>
                                    <span
                                        className={cn(
                                            'ml-auto font-semibold',
                                            isLate
                                                ? 'text-red-500'
                                                : 'text-foreground/80',
                                        )}
                                    >
                                        {formatSmartDate(task.due_date)}
                                    </span>
                                </div>
                            )}
                            {task.start_date && task.due_date && (
                                <div className="flex items-center gap-2 pt-0.5 text-[11px]">
                                    <Timer className="h-3 w-3 shrink-0 text-muted-foreground/60" />
                                    <span className="font-medium text-muted-foreground">
                                        Duration
                                    </span>
                                    <span className="ml-auto font-bold text-primary/80">
                                        {formatDuration(
                                            task.start_date,
                                            task.due_date,
                                        )}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Description */}
                {task.description && (
                    <div className="border-t border-border/50 px-3 py-2.5">
                        <p className="line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">
                            {task.description}
                        </p>
                    </div>
                )}
            </TooltipContent>
        </Tooltip>
    );
}
