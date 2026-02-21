import {
    format,
    parse,
    startOfWeek,
    getDay,
    addDays,
    startOfMonth,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths,
    differenceInDays,
    isPast,
    isToday,
} from 'date-fns';
import { enUS } from 'date-fns/locale';
import {
    ChevronLeft,
    Plus,
    Filter,
    X,
    Pencil,
    Calendar as CalendarIcon,
    Clock,
    AlertTriangle,
} from 'lucide-react';
import { useMemo, useState, useRef, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import type { ToolbarProps, EventProps, View } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import {
    PRIORITY_COLORS,
    STATUS_COLORS,
} from '@/components/projects/timeline/constants';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import type { Task } from '@/types/project';

const locales = {
    'en-US': enUS,
};

interface CalendarEvent {
    id: number;
    title: string;
    start: Date;
    end: Date;
    allDay: boolean;
    resource: Task;
}

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

interface CalendarViewProps {
    tasks: Task[];
    onEditTask: (task: Task) => void;
    onCreateTask: () => void;
}

// Custom Toolbar Component
const CustomToolbar = (toolbar: ToolbarProps<CalendarEvent>) => {
    const setView = (view: View) => toolbar.onView(view);

    const getLabel = () => {
        const date = toolbar.date;
        if (toolbar.view === 'month') {
            return format(date, 'MMMM yyyy');
        } else if (toolbar.view === 'week') {
            const start = startOfWeek(date);
            const end = addDays(start, 6);
            if (start.getMonth() === end.getMonth()) {
                return `${format(start, 'MMMM d')} – ${format(end, 'd, yyyy')}`;
            }
            return `${format(start, 'MMM d')} – ${format(end, 'MMM d, yyyy')}`;
        } else {
            return format(date, 'MMMM d, yyyy');
        }
    };

    return (
        <div className="flex items-center justify-between border-b bg-background px-6 py-4">
            <div className="flex items-center gap-6">
                <span className="min-w-[200px] text-xl font-medium text-foreground">
                    {getLabel()}
                </span>
            </div>
            <div className="flex items-center gap-1 rounded-lg border border-border/50 bg-muted/40 p-1">
                {(['day', 'week', 'month'] as View[]).map((v) => (
                    <Button
                        key={v}
                        variant={toolbar.view === v ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => setView(v)}
                        className={cn(
                            'h-7 px-4 text-xs font-medium capitalize transition-all duration-200',
                            toolbar.view === v
                                ? 'bg-background text-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground',
                        )}
                    >
                        {v}
                    </Button>
                ))}
            </div>
        </div>
    );
};

// Custom Event Component
const CustomEvent = ({ event }: EventProps<CalendarEvent>) => {
    const task = event.resource;
    const colors = STATUS_COLORS[task.status] || STATUS_COLORS.todo;
    const isAllDay = event.allDay;

    return (
        <div
            className={cn(
                'group relative flex h-full w-full flex-col justify-center overflow-hidden rounded-md px-2 py-0.5 text-[11px] leading-tight transition-all duration-200 hover:shadow-md active:scale-[0.98]',
                isAllDay
                    ? colors.calendar + ' text-white shadow-sm brightness-110'
                    : 'border border-border/50 bg-background hover:border-primary/50',
            )}
        >
            <div className="flex items-center gap-1.5 truncate">
                {!isAllDay && (
                    <div
                        className={cn(
                            'h-1.5 w-1.5 shrink-0 rounded-full',
                            colors.dot,
                        )}
                    />
                )}
                <span
                    className={cn(
                        'truncate',
                        isAllDay ? 'font-bold' : 'font-medium',
                    )}
                >
                    {event.title}
                </span>
            </div>
            {!isAllDay && (
                <div className="text-[10px] font-medium text-muted-foreground/80">
                    {format(event.start, 'h:mm a')}
                </div>
            )}
        </div>
    );
};

// GCal-style event detail popover
interface EventPopoverProps {
    task: Task;
    position: { x: number; y: number };
    onClose: () => void;
    onEdit: () => void;
}

const EventDetailPopover = ({
    task,
    position,
    onClose,
    onEdit,
}: EventPopoverProps) => {
    const ref = useRef<HTMLDivElement>(null);
    const colors = STATUS_COLORS[task.status] ?? STATUS_COLORS.todo;
    const priority = PRIORITY_COLORS[task.priority] ?? PRIORITY_COLORS.medium;
    const isLate =
        task.due_date &&
        isPast(new Date(task.due_date)) &&
        !isToday(new Date(task.due_date)) &&
        task.status !== 'done';

    // Adjust position so the card doesn't overflow the viewport
    useEffect(() => {
        if (!ref.current) return;
        const card = ref.current;
        const rect = card.getBoundingClientRect();
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        if (rect.right > vw - 16)
            card.style.left = `${position.x - rect.width - 8}px`;
        if (rect.bottom > vh - 16)
            card.style.top = `${position.y - rect.height}px`;
    }, [position]);

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node))
                onClose();
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [onClose]);

    return (
        <div
            ref={ref}
            className="fixed z-50 w-80 rounded-xl border border-border bg-popover shadow-2xl"
            style={{ left: position.x + 8, top: position.y }}
        >
            {/* Color-coded top strip */}
            <div className={cn('h-2 w-full rounded-t-xl', colors.calendar)} />

            {/* Header */}
            <div className="flex items-start justify-between p-4 pb-2">
                <h3 className="pr-6 text-[15px] leading-tight font-semibold text-foreground">
                    {task.title}
                </h3>
                <div className="flex shrink-0 items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit();
                        }}
                        title="Edit task"
                    >
                        <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={onClose}
                    >
                        <X className="h-3.5 w-3.5" />
                    </Button>
                </div>
            </div>

            {/* Body */}
            <div className="space-y-2.5 px-4 pb-4">
                {/* Status & Priority badges */}
                <div className="flex flex-wrap gap-1.5">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold">
                        <span
                            className={cn('h-2 w-2 rounded-full', colors.dot)}
                        />
                        {colors.label}
                    </span>
                    <span
                        className={cn(
                            'inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold',
                            priority.bg,
                            priority.text,
                        )}
                    >
                        {priority.label}
                    </span>
                    {isLate && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-600 dark:bg-red-950/30 dark:text-red-400">
                            <AlertTriangle className="h-3 w-3" />
                            Overdue
                        </span>
                    )}
                </div>

                {/* Dates */}
                {(task.start_date || task.due_date) && (
                    <div className="flex items-start gap-2.5 text-sm text-muted-foreground">
                        <CalendarIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        <div className="space-y-0.5">
                            {task.start_date && (
                                <div className="text-[12px]">
                                    <span className="mr-1 text-muted-foreground/70">
                                        Start:
                                    </span>
                                    {format(
                                        new Date(task.start_date),
                                        'EEEE, MMM d, yyyy',
                                    )}
                                </div>
                            )}
                            {task.due_date && (
                                <div
                                    className={cn(
                                        'text-[12px]',
                                        isLate &&
                                            'font-medium text-destructive',
                                    )}
                                >
                                    <span className="mr-1 text-muted-foreground/70">
                                        Due:
                                    </span>
                                    {format(
                                        new Date(task.due_date),
                                        'EEEE, MMM d, yyyy',
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Duration */}
                {task.start_date && task.due_date && (
                    <div className="flex items-center gap-2.5 text-[12px] text-muted-foreground">
                        <Clock className="h-3.5 w-3.5 shrink-0" />
                        {(() => {
                            const d = Math.max(
                                1,
                                differenceInDays(
                                    new Date(task.due_date!),
                                    new Date(task.start_date!),
                                ) + 1,
                            );
                            return `${d} day${d !== 1 ? 's' : ''}`;
                        })()}
                    </div>
                )}

                {/* Description */}
                {task.description && (
                    <p className="border-t border-border/50 pt-2.5 text-[12px] leading-relaxed text-muted-foreground">
                        {task.description}
                    </p>
                )}
            </div>
        </div>
    );
};

interface MiniCalendarProps {
    currentDate: Date;
    onDateSelect: (date: Date) => void;
}

const MiniCalendar = ({ currentDate, onDateSelect }: MiniCalendarProps) => {
    const [month, setMonth] = useState(startOfMonth(currentDate));

    const days = useMemo(() => {
        const start = startOfWeek(startOfMonth(month));
        const end = addDays(start, 41); // 6 weeks
        return eachDayOfInterval({ start, end });
    }, [month]);

    return (
        <div className="p-2">
            <div className="mb-2 flex items-center justify-between px-2">
                <span className="text-sm font-semibold capitalize">
                    {format(month, 'MMMM yyyy')}
                </span>
                <div className="flex gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setMonth(subMonths(month, 1))}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setMonth(addMonths(month, 1))}
                    >
                        <ChevronLeft className="h-4 w-4 rotate-180" />
                    </Button>
                </div>
            </div>
            <div className="mb-1 grid grid-cols-7 gap-px text-center text-[10px] font-bold text-muted-foreground">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                    <div key={i} className="py-1">
                        {d}
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-7 gap-px">
                {days.map((day, i) => (
                    <button
                        key={i}
                        onClick={() => onDateSelect(day)}
                        className={cn(
                            'flex h-8 w-8 items-center justify-center rounded-full text-[11px] transition-colors',
                            !isSameMonth(day, month) &&
                                'text-muted-foreground/40',
                            isSameDay(day, currentDate)
                                ? 'bg-primary font-bold text-primary-foreground'
                                : 'font-medium hover:bg-muted',
                            isSameDay(day, new Date()) &&
                                !isSameDay(day, currentDate) &&
                                'text-primary ring-1 ring-primary/30',
                        )}
                    >
                        {format(day, 'd')}
                    </button>
                ))}
            </div>
        </div>
    );
};

export function CalendarView({
    tasks,
    onEditTask,
    onCreateTask,
}: CalendarViewProps) {
    const [viewDate, setViewDate] = useState(new Date());
    const [view, setView] = useState<View>('month');
    const [visibleStatuses, setVisibleStatuses] = useState<Set<string>>(
        new Set(Object.keys(STATUS_COLORS)),
    );
    const [selectedEvent, setSelectedEvent] = useState<{
        task: Task;
        position: { x: number; y: number };
    } | null>(null);

    const toggleStatus = (status: string) => {
        setVisibleStatuses((prev) => {
            const next = new Set(prev);
            if (next.has(status)) {
                next.delete(status);
            } else {
                next.add(status);
            }
            return next;
        });
    };

    const events = useMemo(() => {
        return tasks
            .filter((task) => visibleStatuses.has(task.status))
            .map((task) => {
                const startDate = task.start_date
                    ? new Date(task.start_date)
                    : new Date();
                const endDate = task.due_date
                    ? new Date(task.due_date)
                    : new Date(startDate.getTime() + 60 * 60 * 1000);

                const isAllDay =
                    task.start_date?.includes(' ') === false &&
                    task.due_date?.includes(' ') === false &&
                    !task.start_date?.includes(':');

                return {
                    id: task.id,
                    title: task.title,
                    start: startDate,
                    end: endDate,
                    allDay: isAllDay,
                    resource: task,
                };
            });
    }, [tasks, visibleStatuses]);

    // Map Tailwind color classes to hex for custom checkbox coloring
    const statusHexMap: Record<string, string> = {
        done: '#10b981',
        in_progress: '#2563eb',
        review: '#f59e0b',
        blocked: '#f43f5e',
        todo: '#64748b',
    };

    return (
        <div className="flex h-[800px] overflow-hidden rounded-2xl border bg-background shadow-2xl">
            {/* Sidebar */}
            <div className="flex w-72 flex-col overflow-hidden border-r bg-muted/10 pt-6">
                <div className="mb-6 px-6">
                    <Button
                        className="h-11 w-full justify-start gap-3 rounded-full border border-border/50 bg-background text-foreground shadow-md transition-shadow hover:shadow-lg"
                        variant="outline"
                        onClick={onCreateTask}
                    >
                        <div className="flex h-6 w-6 items-center justify-center">
                            <Plus className="h-5 w-5 text-primary" />
                        </div>
                        <span className="text-sm font-semibold">
                            Create Task
                        </span>
                    </Button>
                </div>

                <div className="mb-6 px-2">
                    <MiniCalendar
                        currentDate={viewDate}
                        onDateSelect={(date) => {
                            setViewDate(date);
                            setView('day');
                        }}
                    />
                </div>

                <div className="flex-1 space-y-4 overflow-y-auto px-6 pb-6">
                    <div>
                        <div className="mb-3 flex items-center gap-2 text-[11px] font-bold tracking-widest text-muted-foreground uppercase">
                            <Filter className="h-3 w-3" />
                            My Calendars
                        </div>
                        <div className="space-y-1">
                            {Object.entries(STATUS_COLORS).map(
                                ([key, value]) => {
                                    const isChecked = visibleStatuses.has(key);
                                    const hexColor =
                                        statusHexMap[key] || '#64748b';
                                    return (
                                        <div
                                            key={key}
                                            className="group flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted/50"
                                            onClick={() => toggleStatus(key)}
                                        >
                                            <div
                                                className="pointer-events-none flex items-center justify-center"
                                                onClick={(e) =>
                                                    e.stopPropagation()
                                                }
                                            >
                                                <Checkbox
                                                    checked={isChecked}
                                                    onCheckedChange={() => {}} // Handled by parent div to avoid double-firing
                                                    className="border-2 transition-all duration-200"
                                                    style={{
                                                        backgroundColor:
                                                            isChecked
                                                                ? hexColor
                                                                : 'transparent',
                                                        borderColor: hexColor,
                                                        color: 'white',
                                                    }}
                                                />
                                            </div>
                                            <span
                                                className={cn(
                                                    'text-xs font-medium transition-colors select-none',
                                                    isChecked
                                                        ? 'font-semibold text-foreground'
                                                        : 'text-muted-foreground',
                                                )}
                                            >
                                                {value.label}
                                            </span>
                                        </div>
                                    );
                                },
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Calendar */}
            <div className="relative flex flex-1 flex-col bg-background">
                <style
                    dangerouslySetInnerHTML={{
                        __html: `
                .rbc-calendar { font-family: inherit; border: none; }
                .rbc-header { padding: 8px 0; font-weight: 600; text-transform: uppercase; font-size: 10px; color: hsl(var(--muted-foreground)); border-bottom: 1px solid hsl(var(--border)/0.5); }
                .rbc-month-view { border: none !important; }
                .rbc-day-bg { border-left: 1px solid hsl(var(--border)/0.3); }
                .rbc-day-bg + .rbc-day-bg { border-left: 1px solid hsl(var(--border)/0.3); }
                .rbc-month-row { border-top: 1px solid hsl(var(--border)/0.3); }
                .rbc-event { background: transparent !important; padding: 1px 4px !important; border: none !important; }
                .rbc-today { background-color: transparent !important; }
                .rbc-today .rbc-day-number { background: hsl(var(--primary)); color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; margin: 4px auto; }
                .rbc-day-number { font-size: 11px; font-weight: 500; text-align: center; padding: 4px; }
                .rbc-off-range-bg { background-color: transparent; }
                .rbc-off-range { color: hsl(var(--muted-foreground)/0.3); }
                .rbc-time-view { border: none; background: transparent; }
                .rbc-time-header { padding-right: 0 !important; border-bottom: 1px solid hsl(var(--border)/0.5); }
                .rbc-time-content { border-top: none; }
                .rbc-time-gutter .rbc-timeslot-group { border-bottom: none; }
                .rbc-timeslot-group { border-bottom: 1px solid hsl(var(--border)/0.3); min-height: 48px; }
                .rbc-label { font-size: 10px; color: hsl(var(--muted-foreground)); padding: 0 12px; }
                .rbc-current-time-indicator { background-color: hsl(var(--destructive)); }
                .rbc-show-more { font-size: 10px; font-weight: 700; color: hsl(var(--primary)); }
                .rbc-time-slot { border-top: 1px solid hsl(var(--border)/0.1); }
            `,
                    }}
                />
                <Calendar<CalendarEvent>
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: '100%' }}
                    views={['month', 'week', 'day']}
                    view={view}
                    onView={(v) => setView(v)}
                    date={viewDate}
                    onNavigate={(d) => setViewDate(d)}
                    components={{
                        toolbar: CustomToolbar,
                        event: CustomEvent,
                    }}
                    onSelectEvent={(event, e) => {
                        const rect = (
                            e.target as HTMLElement
                        ).getBoundingClientRect();
                        setSelectedEvent({
                            task: event.resource,
                            position: { x: rect.right, y: rect.top },
                        });
                    }}
                    className="calendar-transition"
                />
            </div>

            {/* GCal-style event detail popover */}
            {selectedEvent && (
                <EventDetailPopover
                    task={selectedEvent.task}
                    position={selectedEvent.position}
                    onClose={() => setSelectedEvent(null)}
                    onEdit={() => {
                        onEditTask(selectedEvent.task);
                        setSelectedEvent(null);
                    }}
                />
            )}
        </div>
    );
}
