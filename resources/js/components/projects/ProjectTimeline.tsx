import {
    format,
    differenceInDays,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isWithinInterval,
    isToday,
    isPast,
    addDays,
    subDays,
    startOfToday,
    eachWeekOfInterval,
    isWeekend,
} from 'date-fns';
import { ChevronLeft, ChevronRight, ChevronDown, Flag } from 'lucide-react';
import { useState, useMemo, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { Task } from '@/types/project';

interface ProjectTimelineProps {
    tasks: Task[];
    projectStartDate: string;
}

export function ProjectTimeline({
    tasks,
    projectStartDate,
}: ProjectTimelineProps) {
    const [viewDate, setViewDate] = useState(new Date(projectStartDate));
    const [collapsed, setCollapsed] = useState<Record<number, boolean>>({});
    const timelineRef = useRef<HTMLDivElement>(null);
    const headerRef = useRef<HTMLDivElement>(null);
    const sidebarRef = useRef<HTMLDivElement>(null);

    // Sync vertical scrolling between sidebar and timeline
    useEffect(() => {
        const sidebar = sidebarRef.current;
        const timeline = timelineRef.current;
        if (!sidebar || !timeline) return;

        const handleSidebarScroll = () => {
            if (Math.abs(timeline.scrollTop - sidebar.scrollTop) > 0.5) {
                timeline.scrollTop = sidebar.scrollTop;
            }
        };
        const handleTimelineScroll = () => {
            if (Math.abs(sidebar.scrollTop - timeline.scrollTop) > 0.5) {
                sidebar.scrollTop = timeline.scrollTop;
            }
        };

        sidebar.addEventListener('scroll', handleSidebarScroll);
        timeline.addEventListener('scroll', handleTimelineScroll);

        return () => {
            sidebar.removeEventListener('scroll', handleSidebarScroll);
            timeline.removeEventListener('scroll', handleTimelineScroll);
        };
    }, []);

    // Date range calculations
    const displayRange = useMemo(() => {
        const start = subDays(startOfMonth(viewDate), 3); // Padding
        const end = addDays(endOfMonth(viewDate), 7); // Padding
        return {
            start,
            end,
            days: eachDayOfInterval({ start, end }),
            weeks: eachWeekOfInterval({ start, end }),
        };
    }, [viewDate]);

    const toggleCollapse = (id: number) => {
        setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    // Flatten tasks with hierarchy for rendering
    const visibleTasks = useMemo(() => {
        const result: { task: Task; depth: number; hasChildren: boolean }[] =
            [];

        const process = (parentId: number | null, depth: number) => {
            const children = tasks
                .filter((t) => t.parent_id === parentId)
                .sort((a, b) => a.order - b.order);

            children.forEach((child) => {
                const hasChildren = tasks.some((t) => t.parent_id === child.id);
                result.push({ task: child, depth, hasChildren });
                if (!collapsed[child.id]) {
                    process(child.id, depth + 1);
                }
            });
        };

        process(null, 0);
        return result;
    }, [tasks, collapsed]);

    const today = useMemo(() => startOfToday(), []);
    const todayOffset = useMemo(() => {
        if (
            isWithinInterval(today, {
                start: displayRange.start,
                end: displayRange.end,
            })
        ) {
            return differenceInDays(today, displayRange.start) * 48; // 48 is column width
        }
        return -1;
    }, [displayRange, today]);

    return (
        <Card className="flex h-[700px] flex-col overflow-hidden border-border/60 shadow-sm">
            {/* Timeline Toolbar */}
            <div className="flex items-center justify-between border-b bg-muted/30 p-4">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 rounded-md border bg-background p-0.5 shadow-sm">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() =>
                                setViewDate((prev) => subDays(prev, 30))
                            }
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            className="h-7 px-3 text-[11px] font-bold"
                            onClick={() => setViewDate(new Date())}
                        >
                            Today
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() =>
                                setViewDate((prev) => addDays(prev, 30))
                            }
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                        {format(viewDate, 'MMMM yyyy')}
                    </span>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-4 text-[10px] font-bold tracking-wider text-muted-foreground/80 uppercase">
                        <div className="flex items-center gap-1.5">
                            <div className="h-2 w-2 rounded-full bg-primary" />{' '}
                            Active
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="h-2 w-2 rounded-full bg-success" />{' '}
                            Done
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="h-2 w-2 rounded-full bg-destructive" />{' '}
                            Late
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Flag className="h-3 w-3 text-warning" /> Milestone
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar: Fixed Task Names */}
                <div
                    ref={sidebarRef}
                    className="hide-scrollbar z-20 flex w-[300px] flex-shrink-0 flex-col overflow-y-auto border-r bg-muted/5"
                >
                    {visibleTasks.map(({ task, depth, hasChildren }) => (
                        <div
                            key={task.id}
                            className="group flex h-[56px] items-center gap-2 border-b px-4 transition-colors hover:bg-muted/30"
                            style={{ paddingLeft: `${depth * 16 + 16}px` }}
                        >
                            {hasChildren ? (
                                <button
                                    onClick={() => toggleCollapse(task.id)}
                                    className="flex h-4 w-4 items-center justify-center rounded transition-transform hover:bg-muted"
                                    style={{
                                        transform: collapsed[task.id]
                                            ? 'rotate(-90deg)'
                                            : 'rotate(0)',
                                    }}
                                >
                                    <ChevronDown className="h-3 w-3 text-muted-foreground" />
                                </button>
                            ) : (
                                <div className="h-4 w-4" />
                            )}

                            <div
                                className={cn(
                                    'h-2 w-2 rounded-full',
                                    task.completed
                                        ? 'bg-success'
                                        : task.due_date &&
                                            isPast(new Date(task.due_date)) &&
                                            !isToday(new Date(task.due_date))
                                          ? 'bg-destructive'
                                          : 'bg-primary',
                                )}
                            />

                            <span
                                className={cn(
                                    'flex-1 truncate text-sm font-medium',
                                    task.completed &&
                                        'text-muted-foreground line-through decoration-muted-foreground/30',
                                    task.is_milestone &&
                                        'font-semibold text-warning italic',
                                )}
                            >
                                {task.description}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Timeline: Scrollable Gantt Chart */}
                <div className="flex flex-1 flex-col overflow-hidden bg-background/30">
                    {/* Static Header */}
                    <div
                        ref={headerRef}
                        className="group h-[80px] flex-shrink-0 overflow-hidden border-b bg-muted/5"
                        style={{ width: '100%' }}
                    >
                        <div
                            className="flex"
                            style={{
                                width: `${displayRange.days.length * 48}px`,
                            }}
                        >
                            {displayRange.days.map((day) => (
                                <div
                                    key={day.toISOString()}
                                    className={cn(
                                        'relative flex h-[80px] w-[48px] flex-col items-center justify-center gap-1 border-r transition-colors',
                                        isToday(day)
                                            ? 'bg-primary/5'
                                            : 'group-hover:bg-muted/50',
                                    )}
                                >
                                    <span className="text-[10px] font-black text-muted-foreground/40 uppercase">
                                        {format(day, 'EEE')}
                                    </span>
                                    <span
                                        className={cn(
                                            'flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold transition-all',
                                            isToday(day)
                                                ? 'scale-110 bg-primary text-white shadow-lg shadow-primary/20'
                                                : 'text-foreground/70',
                                        )}
                                    >
                                        {format(day, 'd')}
                                    </span>
                                    {format(day, 'd') === '1' && (
                                        <span className="absolute top-1 text-[9px] font-bold text-primary/60 uppercase">
                                            {format(day, 'MMM')}
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Scrollable Body */}
                    <div
                        ref={timelineRef}
                        className="hide-scrollbar bg-grid-pattern/5 relative flex-1 overflow-auto"
                        onScroll={() => {
                            if (headerRef.current && timelineRef.current) {
                                headerRef.current.scrollLeft =
                                    timelineRef.current.scrollLeft;
                            }
                        }}
                    >
                        {/* Task Rows */}
                        <div
                            className="relative"
                            style={{
                                width: `${displayRange.days.length * 48}px`,
                            }}
                        >
                            {/* Weekend Overlays */}
                            <div className="pointer-events-none absolute inset-0 flex">
                                {displayRange.days.map((day, i) => (
                                    <div
                                        key={i}
                                        className={cn(
                                            'h-full w-[48px]',
                                            isWeekend(day) && 'bg-muted/10',
                                        )}
                                    />
                                ))}
                            </div>

                            {visibleTasks.map(({ task }) => {
                                const taskStart = task.start_date
                                    ? new Date(task.start_date)
                                    : task.due_date
                                      ? new Date(task.due_date)
                                      : today;
                                const taskDue = task.due_date
                                    ? new Date(task.due_date)
                                    : taskStart;

                                const left =
                                    differenceInDays(
                                        taskStart,
                                        displayRange.start,
                                    ) * 48;
                                const width =
                                    (differenceInDays(taskDue, taskStart) + 1) *
                                    48;

                                return (
                                    <div
                                        key={task.id}
                                        className="group relative flex h-[56px] items-center border-b transition-colors hover:bg-muted/10"
                                    >
                                        {task.is_milestone ? (
                                            <Tooltip delayDuration={0}>
                                                <TooltipTrigger asChild>
                                                    <div
                                                        className="animate-gantt-bar absolute z-10 flex cursor-pointer items-center justify-center"
                                                        style={{
                                                            left: `${left}px`,
                                                            width: '32px',
                                                            transform:
                                                                'translateX(-16px)',
                                                        }}
                                                    >
                                                        <div className="h-4 w-4 rotate-45 border-2 border-warning bg-warning/20 shadow-sm shadow-warning/20" />
                                                    </div>
                                                </TooltipTrigger>
                                                <TooltipContent side="top">
                                                    <p className="text-xs font-bold">
                                                        {task.description}
                                                    </p>
                                                    <p className="text-[10px] text-muted-foreground">
                                                        Milestone •{' '}
                                                        {format(
                                                            taskDue,
                                                            'MMM d',
                                                        )}
                                                    </p>
                                                </TooltipContent>
                                            </Tooltip>
                                        ) : (
                                            <Tooltip delayDuration={0}>
                                                <TooltipTrigger asChild>
                                                    <div
                                                        className={cn(
                                                            'animate-gantt-bar absolute flex h-7 items-center rounded-sm border px-3 shadow-sm transition-all hover:scale-[1.01]',
                                                            task.completed
                                                                ? 'border-success/30 bg-success/20 text-success-foreground'
                                                                : task.due_date &&
                                                                    isPast(
                                                                        new Date(
                                                                            task.due_date,
                                                                        ),
                                                                    ) &&
                                                                    !isToday(
                                                                        new Date(
                                                                            task.due_date,
                                                                        ),
                                                                    )
                                                                  ? 'border-destructive/30 bg-destructive/20 text-destructive-foreground'
                                                                  : 'border-primary/30 bg-primary/20 text-primary-foreground',
                                                        )}
                                                        style={{
                                                            left: `${left}px`,
                                                            width: `${width}px`,
                                                        }}
                                                    >
                                                        <span className="truncate text-[10px] font-bold tracking-tight">
                                                            {task.description}
                                                        </span>
                                                    </div>
                                                </TooltipTrigger>
                                                <TooltipContent side="top">
                                                    <p className="text-xs font-bold">
                                                        {task.description}
                                                    </p>
                                                    <p className="text-[10px] text-muted-foreground">
                                                        {format(
                                                            taskStart,
                                                            'MMM d',
                                                        )}{' '}
                                                        —{' '}
                                                        {format(
                                                            taskDue,
                                                            'MMM d',
                                                        )}
                                                    </p>
                                                </TooltipContent>
                                            </Tooltip>
                                        )}
                                    </div>
                                );
                            })}

                            {/* Today Indicator */}
                            {todayOffset >= 0 && (
                                <div
                                    className="absolute top-0 bottom-0 z-10 w-px bg-primary"
                                    style={{ left: `${todayOffset + 24}px` }}
                                >
                                    <div className="absolute top-0 -translate-x-1/2 rounded-b bg-primary px-1 text-[8px] font-black text-white">
                                        TODAY
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
}
