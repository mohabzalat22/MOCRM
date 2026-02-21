export const ZOOM_LEVELS = [32, 48, 64, 80] as const;
export type ZoomLevel = (typeof ZOOM_LEVELS)[number];

export const STATUS_COLORS: Record<
    string,
    {
        bar: string;
        text: string;
        dot: string;
        label: string;
        badge: string;
        calendar: string;
    }
> = {
    done: {
        bar: 'bg-emerald-500/80 border-emerald-600/30',
        text: 'text-white',
        dot: 'bg-emerald-500',
        label: 'Done',
        badge: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20',
        calendar: 'bg-emerald-500 border-emerald-600',
    },
    in_progress: {
        bar: 'bg-blue-600/90 border-blue-700/40',
        text: 'text-white',
        dot: 'bg-blue-600',
        label: 'In Progress',
        badge: 'bg-blue-600/10 text-blue-700 border-blue-600/20',
        calendar: 'bg-blue-600 border-blue-700',
    },
    review: {
        bar: 'bg-amber-500/80 border-amber-600/30',
        text: 'text-white',
        dot: 'bg-amber-500',
        label: 'Review',
        badge: 'bg-amber-500/10 text-amber-700 border-amber-500/20',
        calendar: 'bg-amber-500 border-amber-600',
    },
    blocked: {
        bar: 'bg-rose-500/80 border-rose-600/40',
        text: 'text-white',
        dot: 'bg-rose-500',
        label: 'Blocked',
        badge: 'bg-rose-500/10 text-rose-700 border-rose-500/20',
        calendar: 'bg-rose-500 border-rose-600',
    },
    todo: {
        bar: 'bg-slate-500/70 border-slate-600/30',
        text: 'text-white',
        dot: 'bg-slate-500',
        label: 'To Do',
        badge: 'bg-slate-500/10 text-slate-700 border-slate-500/20',
        calendar: 'bg-slate-500 border-slate-600',
    },
};

export const PRIORITY_COLORS: Record<
    string,
    { bg: string; text: string; dot: string; label: string }
> = {
    low: {
        bg: 'bg-emerald-100 dark:bg-emerald-900/40',
        text: 'text-emerald-700 dark:text-emerald-400',
        dot: 'bg-emerald-500',
        label: 'Low',
    },
    medium: {
        bg: 'bg-amber-100 dark:bg-amber-900/40',
        text: 'text-amber-700 dark:text-amber-400',
        dot: 'bg-amber-500',
        label: 'Medium',
    },
    high: {
        bg: 'bg-rose-100 dark:bg-rose-900/40',
        text: 'text-rose-700 dark:text-rose-400',
        dot: 'bg-rose-500',
        label: 'High',
    },
    urgent: {
        bg: 'bg-red-100 dark:bg-red-900/40',
        text: 'text-red-700 dark:text-red-400',
        dot: 'bg-red-700',
        label: 'Urgent',
    },
};

export const ROW_HEIGHT = 52;
export const HEADER_HEIGHT = 76;
export const SIDEBAR_WIDTH = 260;
