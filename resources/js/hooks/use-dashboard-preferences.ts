import type { RequestPayload } from '@inertiajs/core';
import { router } from '@inertiajs/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { DashboardPreference, DateRangeKey, WidgetConfig } from '@/types';

// Simple debounce implementation if not exists
function useDebounceValue<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
}

export function useDashboardPreferences(initialPreferences: DashboardPreference | null, currentRange?: string) {
    // Initialize state from props, but don't update state when props change
    // to avoid conflict between local state (dragging) and server state.
    const [layout, setLayout] = useState<WidgetConfig[]>(initialPreferences?.layout || []);
    const [dateRange, setDateRange] = useState<DateRangeKey>((currentRange as DateRangeKey) || initialPreferences?.date_range || '30d');
    
    // Track the last saved layout to prevent redundant saves
    const lastSavedLayout = useRef<string>(JSON.stringify(initialPreferences?.layout || []));

    // Debounce layout updates to avoid too many API calls while dragging
    const debouncedLayout = useDebounceValue(layout, 1000);

    // Save preferences function
    const savePreferences = useCallback((newLayout: WidgetConfig[], newDateRange: DateRangeKey) => {
        router.post(route('dashboard.preferences.update'), {
            layout: newLayout,
            date_range: newDateRange,
        } as unknown as RequestPayload, {
            preserveScroll: true,
            preserveState: true,
            only: ['summary', 'metrics', 'preferences', 'currentDateRange'], 
        });
    }, []);

    // Effect to save layout when it changes (debounced)
    useEffect(() => {
        const currentLayoutString = JSON.stringify(debouncedLayout);
        
        // Only save if the layout is effectively different from what we last saved
        // and we have a layout to save.
        if (debouncedLayout.length > 0 && currentLayoutString !== lastSavedLayout.current) {
             savePreferences(debouncedLayout, dateRange);
             lastSavedLayout.current = currentLayoutString;
        }
    }, [debouncedLayout, savePreferences, dateRange]);

    const updateLayout = (newLayout: WidgetConfig[]) => {
        setLayout(newLayout);
    };

    const updateDateRange = (newRange: DateRangeKey) => {
        setDateRange(newRange);
        // Immediate save for date range
        savePreferences(layout, newRange);
    };

    return {
        layout,
        dateRange,
        updateLayout,
        updateDateRange,
    };
}
