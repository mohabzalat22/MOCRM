import { format, addDays, subDays } from 'date-fns';
import {
    ChevronLeft,
    ChevronRight,
    Diamond,
    ZoomIn,
    ZoomOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ZoomLevel } from './constants';
import { ZOOM_LEVELS, STATUS_COLORS } from './constants';

interface TimelineToolbarProps {
    viewDate: Date;
    setViewDate: (date: Date | ((d: Date) => Date)) => void;
    zoomLevel: ZoomLevel;
    zoomIn: () => void;
    zoomOut: () => void;
}

export function TimelineToolbar({
    viewDate,
    setViewDate,
    zoomLevel,
    zoomIn,
    zoomOut,
}: TimelineToolbarProps) {
    return (
        <div className="flex shrink-0 items-center justify-between gap-4 border-b bg-muted/20 px-4 py-2.5">
            {/* Navigation */}
            <div className="flex items-center gap-2">
                <div className="flex items-center overflow-hidden rounded-md border bg-background shadow-sm">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-none border-r"
                        onClick={() => setViewDate((d) => subDays(d, 30))}
                    >
                        <ChevronLeft className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                        variant="ghost"
                        className="h-7 rounded-none px-3 text-[11px] font-bold"
                        onClick={() => setViewDate(new Date())}
                    >
                        Today
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-none border-l"
                        onClick={() => setViewDate((d) => addDays(d, 30))}
                    >
                        <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                </div>
                <span className="text-sm font-semibold text-foreground">
                    {format(viewDate, 'MMMM yyyy')}
                </span>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-3">
                {/* Legend */}
                <div className="hidden items-center gap-3 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase sm:flex">
                    {[
                        {
                            key: 'todo',
                            label: STATUS_COLORS.todo.label,
                            cls: STATUS_COLORS.todo.dot,
                        },
                        {
                            key: 'in_progress',
                            label: STATUS_COLORS.in_progress.label,
                            cls: STATUS_COLORS.in_progress.dot,
                        },
                        {
                            key: 'review',
                            label: STATUS_COLORS.review.label,
                            cls: STATUS_COLORS.review.dot,
                        },
                        {
                            key: 'done',
                            label: STATUS_COLORS.done.label,
                            cls: STATUS_COLORS.done.dot,
                        },
                    ].map(({ key, label, cls }) => (
                        <span key={key} className="flex items-center gap-1.5">
                            <span className={cn('h-2 w-2 rounded-sm', cls)} />
                            {label}
                        </span>
                    ))}
                    <span className="ml-1 flex items-center gap-1 border-l pl-3">
                        <Diamond className="h-3 w-3 fill-amber-500/20 text-amber-500" />
                        Milestone
                    </span>
                </div>

                {/* Zoom */}
                <div className="flex items-center overflow-hidden rounded-md border bg-background shadow-sm">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-none border-r"
                        onClick={zoomOut}
                        disabled={zoomLevel === ZOOM_LEVELS[0]}
                    >
                        <ZoomOut className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-none"
                        onClick={zoomIn}
                        disabled={
                            zoomLevel === ZOOM_LEVELS[ZOOM_LEVELS.length - 1]
                        }
                    >
                        <ZoomIn className="h-3.5 w-3.5" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
