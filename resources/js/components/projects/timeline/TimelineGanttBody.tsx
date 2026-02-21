import {
    differenceInDays,
    isPast,
    isToday,
    isWeekend,
    startOfToday,
    isWithinInterval,
} from 'date-fns';
import { useMemo, type RefObject } from 'react';
import { cn } from '@/lib/utils';
import type { Task } from '@/types/project';
import { TaskTooltip } from '../TaskTooltip';
import { ROW_HEIGHT, STATUS_COLORS } from './constants';

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
                                <TaskTooltip
                                    task={task}
                                    side="top"
                                    type="milestone"
                                    delayDuration={0}
                                >
                                    <button
                                        className="absolute top-1/2 z-10 -translate-y-1/2 cursor-pointer"
                                        style={{
                                            left: Math.max(0, left - 8),
                                        }}
                                        onClick={() => onEditTask(task)}
                                    >
                                        <div className="h-4 w-4 rotate-45 border-2 border-amber-500 bg-amber-100 shadow-sm shadow-amber-500/20 transition-all hover:scale-110 hover:shadow-md hover:shadow-amber-500/30" />
                                    </button>
                                </TaskTooltip>
                            ) : hasChildren ? (
                                /* Parent Task Summary Bar */
                                <TaskTooltip
                                    task={task}
                                    side="top"
                                    type="summary"
                                    delayDuration={100}
                                >
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
                                </TaskTooltip>
                            ) : (
                                /* Task bar */
                                <TaskTooltip
                                    task={task}
                                    side="top"
                                    type="task"
                                    delayDuration={100}
                                >
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
                                </TaskTooltip>
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
