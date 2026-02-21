import {
    differenceInDays,
    format,
    isPast,
    isToday,
    isWeekend,
    startOfToday,
    isWithinInterval,
} from 'date-fns';
import { Calendar, Clock, AlertTriangle } from 'lucide-react';
import { useMemo, type RefObject } from 'react';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { Task } from '@/types/project';
import { PRIORITY_COLORS, ROW_HEIGHT, STATUS_COLORS } from './constants';

interface TimelineGanttBodyProps {
    visibleTasks: { task: Task; depth: number; hasChildren: boolean }[];
    displayRange: { start: Date; end: Date; days: Date[] };
    zoomLevel: number;
    todayOffset: number;
    projectEndDate?: string;
    totalWidth: number;
    scrollBodyRef: RefObject<HTMLDivElement | null>;
    onScroll: () => void;
    onEditTask: (task: Task) => void;
}

export function TimelineGanttBody({
    visibleTasks,
    displayRange,
    zoomLevel,
    todayOffset,
    projectEndDate,
    totalWidth,
    scrollBodyRef,
    onScroll,
    onEditTask,
}: TimelineGanttBodyProps) {
    const today = startOfToday();

    const deadlineOffset = useMemo(() => {
        if (!projectEndDate) return -1;
        const deadline = new Date(projectEndDate);
        if (
            isWithinInterval(deadline, {
                start: displayRange.start,
                end: displayRange.end,
            })
        ) {
            return (
                differenceInDays(deadline, displayRange.start) * zoomLevel +
                zoomLevel
            );
        }
        return -1;
    }, [displayRange, projectEndDate, zoomLevel]);

    const getBarStyle = (task: Task) => {
        const taskStart = task.start_date
            ? new Date(task.start_date)
            : task.due_date
              ? new Date(task.due_date)
              : today;
        const taskEnd = task.due_date ? new Date(task.due_date) : taskStart;
        const left =
            differenceInDays(taskStart, displayRange.start) * zoomLevel;
        const width = Math.max(
            (differenceInDays(taskEnd, taskStart) + 1) * zoomLevel,
            zoomLevel,
        );
        return { left, width };
    };

    return (
        <div
            ref={scrollBodyRef}
            className="relative flex-1 overflow-auto overscroll-x-contain [scrollbar-gutter:stable]"
            style={{
                scrollbarWidth: 'thin',
                scrollbarColor: 'hsl(var(--border)) transparent',
            }}
            onScroll={onScroll}
        >
            {/* Total width container */}
            <div
                className="relative"
                style={{
                    width: totalWidth,
                    minHeight: visibleTasks.length * ROW_HEIGHT,
                }}
            >
                {/* Weekend shading */}
                {displayRange.days.map((day, i) =>
                    isWeekend(day) ? (
                        <div
                            key={i}
                            className="absolute top-0 bottom-0 bg-muted/20"
                            style={{ left: i * zoomLevel, width: zoomLevel }}
                        />
                    ) : null,
                )}

                {/* Vertical day grid lines */}
                {displayRange.days.map((day, i) => (
                    <div
                        key={i}
                        className={cn(
                            'absolute top-0 bottom-0 border-r',
                            isToday(day)
                                ? 'border-primary/20'
                                : 'border-border/40',
                        )}
                        style={{ left: (i + 1) * zoomLevel }}
                    />
                ))}

                {/* NOW line */}
                {todayOffset !== -1 && (
                    <div
                        className="pointer-events-none absolute top-0 bottom-0 z-20 w-px bg-blue-500/50"
                        style={{ left: todayOffset }}
                    >
                        <div className="absolute top-0 -translate-x-1/2 rounded bg-blue-500 px-1.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
                            NOW
                        </div>
                    </div>
                )}

                {/* DEADLINE line */}
                {deadlineOffset !== -1 && (
                    <div
                        className="pointer-events-none absolute top-0 bottom-0 z-20 w-px bg-red-500/50"
                        style={{ left: deadlineOffset }}
                    >
                        <div className="absolute top-0 -translate-x-1/2 rounded bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
                            DEADLINE
                        </div>
                    </div>
                )}

                {/* Task rows */}
                {visibleTasks.map(({ task, hasChildren }, rowIdx) => {
                    const { left, width } = getBarStyle(task);
                    const isLate =
                        task.due_date &&
                        isPast(new Date(task.due_date)) &&
                        !isToday(new Date(task.due_date)) &&
                        task.status !== 'done';

                    const colors =
                        task.status === 'done'
                            ? STATUS_COLORS.done
                            : isLate
                              ? STATUS_COLORS.blocked
                              : (STATUS_COLORS[task.status] ??
                                STATUS_COLORS.todo);

                    return (
                        <div
                            key={task.id}
                            className="absolute right-0 left-0 border-b border-border/30 hover:bg-muted/10"
                            style={{
                                top: rowIdx * ROW_HEIGHT,
                                height: ROW_HEIGHT,
                            }}
                        >
                            {task.is_milestone ? (
                                /* Milestone diamond */
                                <Tooltip delayDuration={0}>
                                    <TooltipTrigger asChild>
                                        <button
                                            className="absolute top-1/2 z-10 -translate-y-1/2 cursor-pointer"
                                            style={{
                                                left: Math.max(0, left - 8),
                                            }}
                                            onClick={() => onEditTask(task)}
                                        >
                                            <div className="h-4 w-4 rotate-45 border-2 border-amber-500 bg-amber-100 shadow-sm shadow-amber-500/20 transition-all hover:scale-110 hover:shadow-md hover:shadow-amber-500/30" />
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent
                                        side="top"
                                        className="max-w-[260px] rounded-lg border-0 bg-popover p-0 shadow-xl"
                                    >
                                        <div className="space-y-2 p-3">
                                            {/* Title row */}
                                            <div className="flex items-start gap-2">
                                                <p className="text-[13px] leading-tight font-bold text-foreground">
                                                    {task.title}
                                                </p>
                                            </div>
                                            {/* Badge */}
                                            <div className="flex items-center gap-1.5">
                                                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                                                    Milestone
                                                </span>
                                            </div>
                                            {/* Date */}
                                            {task.due_date && (
                                                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                                                    <Calendar className="h-3 w-3" />
                                                    <span>
                                                        {format(
                                                            new Date(
                                                                task.due_date,
                                                            ),
                                                            'EEEE, MMM d, yyyy',
                                                        )}
                                                    </span>
                                                </div>
                                            )}
                                            {/* Late warning */}
                                            {isLate && (
                                                <div className="flex items-center gap-1.5 text-[11px] font-medium text-destructive">
                                                    <AlertTriangle className="h-3 w-3" />
                                                    <span>
                                                        Overdue by{' '}
                                                        {differenceInDays(
                                                            today,
                                                            new Date(
                                                                task.due_date!,
                                                            ),
                                                        )}{' '}
                                                        days
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </TooltipContent>
                                </Tooltip>
                            ) : hasChildren ? (
                                /* Parent Task Summary Bar */
                                <Tooltip delayDuration={100}>
                                    <TooltipTrigger asChild>
                                        <button
                                            className="absolute top-1/2 z-10 h-2 -translate-y-1/2 cursor-pointer transition-all hover:brightness-90"
                                            style={{
                                                left,
                                                width,
                                            }}
                                            onClick={() => onEditTask(task)}
                                        >
                                            <div className="relative h-2 w-full bg-muted-foreground/40">
                                                {/* Left bracket */}
                                                <div className="absolute top-0 left-0 h-4 w-[2px] -translate-y-[2px] bg-muted-foreground/40" />
                                                {/* Right bracket */}
                                                <div className="absolute top-0 right-0 h-4 w-[2px] -translate-y-[2px] bg-muted-foreground/40" />
                                                {/* Bottom bar connecting brackets */}
                                                <div className="absolute top-2 right-0 left-0 h-[2px] bg-muted-foreground/40" />
                                            </div>
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent
                                        side="top"
                                        className="max-w-[280px] rounded-lg border border-border bg-popover p-0 shadow-xl"
                                    >
                                        {/* Same Tooltip Content as regular task */}
                                        <div className="space-y-2.5 p-3">
                                            <p className="text-[13px] leading-tight font-bold text-foreground">
                                                {task.title}
                                            </p>
                                            <div className="flex flex-wrap items-center gap-1.5">
                                                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                                                    Summary
                                                </span>
                                            </div>
                                            {(task.start_date ||
                                                task.due_date) && (
                                                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                                                    <Calendar className="h-3 w-3 shrink-0" />
                                                    <span>
                                                        {task.start_date
                                                            ? format(
                                                                  new Date(
                                                                      task.start_date,
                                                                  ),
                                                                  'MMM d',
                                                              )
                                                            : 'No start'}
                                                        {' → '}
                                                        {task.due_date
                                                            ? format(
                                                                  new Date(
                                                                      task.due_date,
                                                                  ),
                                                                  'MMM d, yyyy',
                                                              )
                                                            : 'No due date'}
                                                    </span>
                                                </div>
                                            )}
                                            {task.start_date &&
                                                task.due_date && (
                                                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                                                        <Clock className="h-3 w-3 shrink-0" />
                                                        <span>
                                                            {(() => {
                                                                const start =
                                                                    new Date(
                                                                        task.start_date!,
                                                                    );
                                                                const end =
                                                                    new Date(
                                                                        task.due_date!,
                                                                    );
                                                                const d =
                                                                    Math.max(
                                                                        1,
                                                                        differenceInDays(
                                                                            end,
                                                                            start,
                                                                        ) + 1,
                                                                    );
                                                                return `${d} day${d !== 1 ? 's' : ''}`;
                                                            })()}
                                                        </span>
                                                    </div>
                                                )}
                                        </div>
                                    </TooltipContent>
                                </Tooltip>
                            ) : (
                                /* Task bar */
                                <Tooltip delayDuration={100}>
                                    <TooltipTrigger asChild>
                                        <button
                                            className={cn(
                                                'absolute top-1/2 z-10 h-7 -translate-y-1/2 cursor-pointer overflow-hidden rounded-md border px-2 text-left shadow-sm transition-all hover:shadow-md hover:brightness-110',
                                                colors.bar,
                                            )}
                                            style={{
                                                left,
                                                width: Math.max(width, 28),
                                            }}
                                            onClick={() => onEditTask(task)}
                                        >
                                            {width >= 40 && (
                                                <span
                                                    className={cn(
                                                        'block truncate text-[11px] leading-7 font-semibold',
                                                        colors.text,
                                                    )}
                                                >
                                                    {task.title}
                                                </span>
                                            )}
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent
                                        side="top"
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
                                                {(() => {
                                                    const p =
                                                        PRIORITY_COLORS[
                                                            task.priority
                                                        ] ??
                                                        PRIORITY_COLORS.medium;
                                                    return (
                                                        <span
                                                            className={cn(
                                                                'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold',
                                                                p.bg,
                                                                p.text,
                                                            )}
                                                        >
                                                            {p.label}
                                                        </span>
                                                    );
                                                })()}
                                                {isLate && (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-600 dark:bg-red-950/30 dark:text-red-400">
                                                        <AlertTriangle className="h-2.5 w-2.5" />
                                                        Overdue
                                                    </span>
                                                )}
                                            </div>

                                            {/* Date range */}
                                            {(task.start_date ||
                                                task.due_date) && (
                                                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                                                    <Calendar className="h-3 w-3 shrink-0" />
                                                    <span>
                                                        {task.start_date
                                                            ? format(
                                                                  new Date(
                                                                      task.start_date,
                                                                  ),
                                                                  'MMM d',
                                                              )
                                                            : 'No start'}
                                                        {' → '}
                                                        {task.due_date
                                                            ? format(
                                                                  new Date(
                                                                      task.due_date,
                                                                  ),
                                                                  'MMM d, yyyy',
                                                              )
                                                            : 'No due date'}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Duration */}
                                            {task.start_date &&
                                                task.due_date && (
                                                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                                                        <Clock className="h-3 w-3 shrink-0" />
                                                        <span>
                                                            {(() => {
                                                                const start =
                                                                    new Date(
                                                                        task.start_date!,
                                                                    );
                                                                const end =
                                                                    new Date(
                                                                        task.due_date!,
                                                                    );
                                                                const d =
                                                                    Math.max(
                                                                        1,
                                                                        differenceInDays(
                                                                            end,
                                                                            start,
                                                                        ) + 1,
                                                                    );
                                                                return `${d} day${d !== 1 ? 's' : ''}`;
                                                            })()}
                                                        </span>
                                                    </div>
                                                )}

                                            {/* Overdue detail */}
                                            {isLate && (
                                                <div className="flex items-center gap-1.5 text-[11px] font-medium text-destructive">
                                                    <AlertTriangle className="h-3 w-3 shrink-0" />
                                                    <span>
                                                        Overdue by{' '}
                                                        {differenceInDays(
                                                            today,
                                                            new Date(
                                                                task.due_date!,
                                                            ),
                                                        )}{' '}
                                                        days
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </TooltipContent>
                                </Tooltip>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Empty state */}
            {visibleTasks.length === 0 && (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                    No tasks to display on the timeline.
                </div>
            )}
        </div>
    );
}
