import { useRef, useCallback } from 'react';

export function useTimelineScroll() {
    const scrollBodyRef = useRef<HTMLDivElement>(null);
    const scrollHeaderRef = useRef<HTMLDivElement>(null);
    const scrollSidebarRef = useRef<HTMLDivElement>(null);
    const isSyncing = useRef(false);

    // Sync horizontal scroll between header and body
    const onBodyScroll = useCallback(() => {
        if (isSyncing.current) return;
        isSyncing.current = true;
        if (scrollHeaderRef.current && scrollBodyRef.current) {
            scrollHeaderRef.current.scrollLeft =
                scrollBodyRef.current.scrollLeft;
        }
        isSyncing.current = false;
    }, []);

    const onHeaderScroll = useCallback(() => {
        if (isSyncing.current) return;
        isSyncing.current = true;
        if (scrollBodyRef.current && scrollHeaderRef.current) {
            scrollBodyRef.current.scrollLeft =
                scrollHeaderRef.current.scrollLeft;
        }
        isSyncing.current = false;
    }, []);

    // Sync vertical scroll between sidebar and body
    const onSidebarScroll = useCallback(() => {
        if (isSyncing.current) return;
        isSyncing.current = true;
        if (scrollBodyRef.current && scrollSidebarRef.current) {
            scrollBodyRef.current.scrollTop =
                scrollSidebarRef.current.scrollTop;
        }
        isSyncing.current = false;
    }, []);

    const onBodyVerticalScroll = useCallback(() => {
        if (isSyncing.current) return;
        isSyncing.current = true;
        if (scrollSidebarRef.current && scrollBodyRef.current) {
            scrollSidebarRef.current.scrollTop =
                scrollBodyRef.current.scrollTop;
        }
        isSyncing.current = false;
    }, []);

    return {
        scrollBodyRef,
        scrollHeaderRef,
        scrollSidebarRef,
        onBodyScroll,
        onHeaderScroll,
        onSidebarScroll,
        onBodyVerticalScroll,
    };
}
