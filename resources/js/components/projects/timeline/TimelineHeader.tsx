import { format, isToday, isWeekend } from 'date-fns';
import type { RefObject } from 'react';
import { cn } from '@/lib/utils';
import type { ZoomLevel } from './constants';
import { HEADER_HEIGHT } from './constants';

interface TimelineHeaderProps {
    displayRange: { days: Date[] };
    zoomLevel: ZoomLevel;
    totalWidth: number;
    scrollHeaderRef: RefObject<HTMLDivElement | null>;
    onHeaderScroll: () => void;
}

export function TimelineHeader({
    displayRange,
    zoomLevel,
    totalWidth,
    scrollHeaderRef,
    onHeaderScroll,
}: TimelineHeaderProps) {
    return (
        <div
            ref={scrollHeaderRef}
            className="hide-scrollbar shrink-0 overflow-x-auto overflow-y-hidden border-b bg-muted/20"
            style={{ height: HEADER_HEIGHT }}
            onScroll={onHeaderScroll}
        >
            <div className="flex flex-col" style={{ width: totalWidth }}>
                {/* Row 1 — Month bands */}
                <div className="relative flex" style={{ height: 22 }}>
                    {(() => {
                        // Group consecutive days by month
                        const bands: { label: string; count: number }[] = [];
                        displayRange.days.forEach((day) => {
                            const label = format(day, 'MMMM yyyy');
                            if (
                                bands.length &&
                                bands[bands.length - 1].label === label
                            ) {
                                bands[bands.length - 1].count++;
                            } else {
                                bands.push({ label, count: 1 });
                            }
                        });
                        return bands.map(({ label, count }, i) => (
                            <div
                                key={i}
                                className="flex items-center border-r border-border/50 bg-muted/40 px-2"
                                style={{
                                    width: count * zoomLevel,
                                    minWidth: count * zoomLevel,
                                }}
                            >
                                <span className="text-[10px] font-bold tracking-wider text-foreground/70 uppercase">
                                    {label}
                                </span>
                            </div>
                        ));
                    })()}
                </div>

                {/* Row 2 — Day columns */}
                <div className="flex" style={{ height: 54 }}>
                    {displayRange.days.map((day) => (
                        <div
                            key={day.toISOString()}
                            className={cn(
                                'flex flex-col items-center justify-center border-r pt-1',
                                isToday(day)
                                    ? 'bg-primary/5'
                                    : isWeekend(day)
                                      ? 'bg-muted/30'
                                      : '',
                            )}
                            style={{ width: zoomLevel, minWidth: zoomLevel }}
                        >
                            <span className="text-[9px] font-bold text-muted-foreground/50 uppercase">
                                {format(day, 'EEE')}
                            </span>
                            <span
                                className={cn(
                                    'flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold',
                                    isToday(day)
                                        ? 'bg-primary text-primary-foreground shadow-md'
                                        : isWeekend(day)
                                          ? 'text-muted-foreground/50'
                                          : 'text-foreground/70',
                                )}
                            >
                                {format(day, 'd')}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
