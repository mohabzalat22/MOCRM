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
    isWeekend
} from 'date-fns';
import { ChevronLeft, ChevronRight, ChevronDown, Flag } from 'lucide-react';
import { useState, useMemo, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from '@/lib/utils';
import type { Task } from '@/types/project';

interface ProjectTimelineProps {
    tasks: Task[];
    projectStartDate: string;
}

export function ProjectTimeline({ tasks, projectStartDate }: ProjectTimelineProps) {
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
            weeks: eachWeekOfInterval({ start, end })
        };
    }, [viewDate]);

    const toggleCollapse = (id: number) => {
        setCollapsed(prev => ({ ...prev, [id]: !prev[id] }));
    };


    // Flatten tasks with hierarchy for rendering
    const visibleTasks = useMemo(() => {
        const result: { task: Task; depth: number; hasChildren: boolean }[] = [];
        
        const process = (parentId: number | null, depth: number) => {
            const children = tasks
                .filter(t => t.parent_id === parentId)
                .sort((a, b) => a.order - b.order);

            children.forEach(child => {
                const hasChildren = tasks.some(t => t.parent_id === child.id);
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
        if (isWithinInterval(today, { start: displayRange.start, end: displayRange.end })) {
            return differenceInDays(today, displayRange.start) * 48; // 48 is column width
        }
        return -1;
    }, [displayRange, today]);

    return (
        <Card className="flex flex-col h-[700px] shadow-sm border-border/60 overflow-hidden">
                {/* Timeline Toolbar */}
                <div className="p-4 flex items-center justify-between border-b bg-muted/30">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1 bg-background border rounded-md p-0.5 shadow-sm">
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7" 
                                onClick={() => setViewDate(prev => subDays(prev, 30))}
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
                                onClick={() => setViewDate(prev => addDays(prev, 30))}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                        <span className="text-sm font-semibold text-foreground">
                            {format(viewDate, 'MMMM yyyy')}
                        </span>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
                            <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-primary" /> Active</div>
                            <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-success" /> Done</div>
                            <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-destructive" /> Late</div>
                            <div className="flex items-center gap-1.5"><Flag className="h-3 w-3 text-warning" /> Milestone</div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 flex overflow-hidden">
                    {/* Sidebar: Fixed Task Names */}
                    <div 
                        ref={sidebarRef}
                        className="w-[300px] flex-shrink-0 flex flex-col border-r bg-muted/5 z-20 overflow-y-auto hide-scrollbar"
                    >
                        {visibleTasks.map(({ task, depth, hasChildren }) => (
                            <div 
                                key={task.id} 
                                className="h-[56px] border-b flex items-center px-4 gap-2 hover:bg-muted/30 transition-colors group"
                                style={{ paddingLeft: `${depth * 16 + 16}px` }}
                            >
                                {hasChildren ? (
                                    <button 
                                        onClick={() => toggleCollapse(task.id)}
                                        className="h-4 w-4 flex items-center justify-center rounded hover:bg-muted transition-transform"
                                        style={{ transform: collapsed[task.id] ? 'rotate(-90deg)' : 'rotate(0)' }}
                                    >
                                        <ChevronDown className="h-3 w-3 text-muted-foreground" />
                                    </button>
                                ) : (
                                    <div className="h-4 w-4" />
                                )}
                                
                                <div className={cn(
                                    "h-2 w-2 rounded-full",
                                    task.completed ? "bg-success" : (task.due_date && isPast(new Date(task.due_date)) && !isToday(new Date(task.due_date)) ? "bg-destructive" : "bg-primary")
                                )} />
                                
                                <span className={cn(
                                    "text-sm font-medium truncate flex-1",
                                    task.completed && "text-muted-foreground line-through decoration-muted-foreground/30",
                                    task.is_milestone && "text-warning font-semibold italic"
                                )}>
                                    {task.description}
                                </span>
                            </div>
                        ))}
                    </div>

                        {/* Timeline: Scrollable Gantt Chart */}
                        <div className="flex-1 flex flex-col overflow-hidden bg-background/30">
                            {/* Static Header */}
                            <div 
                                ref={headerRef}
                                className="h-[80px] flex-shrink-0 border-b overflow-hidden bg-muted/5 group"
                                style={{ width: '100%' }}
                            >
                                <div className="flex" style={{ width: `${displayRange.days.length * 48}px` }}>
                                    {displayRange.days.map((day) => (
                                        <div 
                                            key={day.toISOString()}
                                            className={cn(
                                                "w-[48px] h-[80px] border-r flex flex-col items-center justify-center gap-1 transition-colors relative",
                                                isToday(day) ? "bg-primary/5" : "group-hover:bg-muted/50"
                                            )}
                                        >
                                            <span className="text-[10px] uppercase font-black text-muted-foreground/40">{format(day, 'EEE')}</span>
                                            <span className={cn(
                                                "text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full transition-all",
                                                isToday(day) ? "bg-primary text-white shadow-lg shadow-primary/20 scale-110" : "text-foreground/70"
                                            )}>
                                                {format(day, 'd')}
                                            </span>
                                            {format(day, 'd') === '1' && (
                                                <span className="absolute top-1 text-[9px] font-bold text-primary/60 uppercase">{format(day, 'MMM')}</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                        {/* Scrollable Body */}
                        <div 
                            ref={timelineRef}
                            className="flex-1 overflow-auto hide-scrollbar relative bg-grid-pattern/5"
                            onScroll={() => {
                                if (headerRef.current && timelineRef.current) {
                                    headerRef.current.scrollLeft = timelineRef.current.scrollLeft;
                                }
                            }}
                        >
                            {/* Task Rows */}
                            <div className="relative" style={{ width: `${displayRange.days.length * 48}px` }}>
                                {/* Weekend Overlays */}
                                <div className="absolute inset-0 pointer-events-none flex">
                                    {displayRange.days.map((day, i) => (
                                        <div 
                                            key={i} 
                                            className={cn(
                                                "w-[48px] h-full",
                                                isWeekend(day) && "bg-muted/10"
                                            )} 
                                        />
                                    ))}
                                </div>

                                {visibleTasks.map(({ task }) => {
                                    const taskStart = task.start_date ? new Date(task.start_date) : (task.due_date ? new Date(task.due_date) : today);
                                    const taskDue = task.due_date ? new Date(task.due_date) : taskStart;
                                    
                                    const left = differenceInDays(taskStart, displayRange.start) * 48;
                                    const width = (differenceInDays(taskDue, taskStart) + 1) * 48;

                                    return (
                                        <div key={task.id} className="h-[56px] border-b flex items-center relative group hover:bg-muted/10 transition-colors">
                                            {task.is_milestone ? (
                                                <Tooltip delayDuration={0}>
                                                    <TooltipTrigger asChild>
                                                        <div 
                                                            className="absolute flex items-center justify-center animate-gantt-bar z-10 cursor-pointer"
                                                            style={{ left: `${left}px`, width: '32px', transform: 'translateX(-16px)' }}
                                                        >
                                                            <div className="h-4 w-4 rotate-45 border-2 border-warning bg-warning/20 shadow-sm shadow-warning/20" />
                                                        </div>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="top">
                                                        <p className="text-xs font-bold">{task.description}</p>
                                                        <p className="text-[10px] text-muted-foreground">Milestone • {format(taskDue, 'MMM d')}</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            ) : (
                                                <Tooltip delayDuration={0}>
                                                    <TooltipTrigger asChild>
                                                        <div 
                                                            className={cn(
                                                                "absolute h-7 rounded-sm shadow-sm flex items-center px-3 animate-gantt-bar border transition-all hover:scale-[1.01]",
                                                                task.completed 
                                                                    ? "bg-success/20 border-success/30 text-success-foreground" 
                                                                    : (task.due_date && isPast(new Date(task.due_date)) && !isToday(new Date(task.due_date)) 
                                                                        ? "bg-destructive/20 border-destructive/30 text-destructive-foreground" 
                                                                        : "bg-primary/20 border-primary/30 text-primary-foreground")
                                                            )}
                                                            style={{ left: `${left}px`, width: `${width}px` }}
                                                        >
                                                            <span className="text-[10px] font-bold truncate tracking-tight">{task.description}</span>
                                                        </div>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="top">
                                                        <p className="text-xs font-bold">{task.description}</p>
                                                        <p className="text-[10px] text-muted-foreground">
                                                            {format(taskStart, 'MMM d')} — {format(taskDue, 'MMM d')}
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
                                        className="absolute top-0 bottom-0 w-px bg-primary z-10"
                                        style={{ left: `${todayOffset + 24}px` }}
                                    >
                                        <div className="absolute top-0 -translate-x-1/2 bg-primary text-white text-[8px] font-black px-1 rounded-b">
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
