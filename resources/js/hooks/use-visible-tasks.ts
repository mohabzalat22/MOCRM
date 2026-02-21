import { useState, useMemo } from 'react';
import type { Task } from '@/types/project';

export function useVisibleTasks(tasks: Task[]) {
    const [collapsed, setCollapsed] = useState<Record<number, boolean>>({});

    const visibleTasks = useMemo(() => {
        const result: {
            task: Task;
            depth: number;
            hasChildren: boolean;
        }[] = [];

        // Pre-calculate aggregate dates for tasks with children
        const taskDates = new Map<
            number,
            { start: Date | null; end: Date | null }
        >();

        const getAggregateDates = (taskId: number) => {
            if (taskDates.has(taskId)) return taskDates.get(taskId)!;

            const task = tasks.find((t) => t.id === taskId);
            if (!task) return { start: null, end: null };

            let start = task.start_date ? new Date(task.start_date) : null;
            let end = task.due_date ? new Date(task.due_date) : null;

            const children = tasks.filter((t) => t.parent_id === taskId);
            children.forEach((child) => {
                const childDates = getAggregateDates(child.id);
                if (childDates.start) {
                    if (!start || childDates.start < start)
                        start = childDates.start;
                }
                if (childDates.end) {
                    if (!end || childDates.end > end) end = childDates.end;
                }
            });

            const dates = { start, end };
            taskDates.set(taskId, dates);
            return dates;
        };

        const process = (parentId: number | null, depth: number) => {
            tasks
                .filter((t) => t.parent_id === parentId)
                .sort((a, b) => a.order - b.order)
                .forEach((child) => {
                    const children = tasks.filter(
                        (t) => t.parent_id === child.id,
                    );
                    const hasChildren = children.length > 0;

                    const processedTask = { ...child };
                    if (hasChildren) {
                        const agg = getAggregateDates(child.id);
                        if (agg.start)
                            processedTask.start_date = agg.start.toISOString();
                        if (agg.end)
                            processedTask.due_date = agg.end.toISOString();
                    }

                    result.push({ task: processedTask, depth, hasChildren });
                    if (!collapsed[child.id]) {
                        process(child.id, depth + 1);
                    }
                });
        };
        process(null, 0);
        return result;
    }, [tasks, collapsed]);

    const toggleCollapse = (taskId: number) => {
        setCollapsed((p) => ({ ...p, [taskId]: !p[taskId] }));
    };

    return {
        visibleTasks,
        collapsed,
        toggleCollapse,
    };
}
