import {
    subDays,
    addDays,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    startOfToday,
    isWithinInterval,
    differenceInDays,
} from 'date-fns';
import { useState, useMemo } from 'react';

export const ZOOM_LEVELS = [32, 48, 64, 80] as const;
export type ZoomLevel = (typeof ZOOM_LEVELS)[number];

export function useTimelineDisplay(initialDate: string) {
    const [viewDate, setViewDate] = useState(new Date(initialDate));
    const [zoomLevel, setZoomLevel] = useState<ZoomLevel>(48);

    const displayRange = useMemo(() => {
        const start = subDays(startOfMonth(viewDate), 5);
        const end = addDays(endOfMonth(viewDate), 10);
        return {
            start,
            end,
            days: eachDayOfInterval({ start, end }),
        };
    }, [viewDate]);

    const today = useMemo(() => startOfToday(), []);

    const todayOffset = useMemo(() => {
        if (
            isWithinInterval(today, {
                start: displayRange.start,
                end: displayRange.end,
            })
        ) {
            return (
                differenceInDays(today, displayRange.start) * zoomLevel +
                zoomLevel / 2
            );
        }
        return -1;
    }, [displayRange, today, zoomLevel]);

    const totalWidth = displayRange.days.length * zoomLevel;

    const zoomIn = () => {
        const idx = ZOOM_LEVELS.indexOf(zoomLevel);
        if (idx < ZOOM_LEVELS.length - 1) setZoomLevel(ZOOM_LEVELS[idx + 1]);
    };

    const zoomOut = () => {
        const idx = ZOOM_LEVELS.indexOf(zoomLevel);
        if (idx > 0) setZoomLevel(ZOOM_LEVELS[idx - 1]);
    };

    return {
        viewDate,
        setViewDate,
        zoomLevel,
        displayRange,
        today,
        todayOffset,
        totalWidth,
        zoomIn,
        zoomOut,
    };
}
