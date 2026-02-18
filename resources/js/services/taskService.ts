import type { RequestPayload } from '@inertiajs/core';
import { router, useForm } from '@inertiajs/react';
import type { ServiceOptions } from '@/types';

export interface ReorderTaskData {
    id: number;
    order: number;
    [key: string]: number;
}

export const taskService = {
    /**
     * Hook to handle task form state
     */
    useTaskForm: (projectId: number) => {
        return useForm({
            project_id: projectId,
            description: '',
            start_date: null as string | null,
            due_date: null as string | null,
            is_milestone: false,
            parent_id: null as number | null,
        });
    },

    /**
     * Create a new task
     */
    createTask(
        data: {
            project_id: number;
            description: string;
            start_date?: string | null;
            due_date?: string | null;
            is_milestone?: boolean;
            parent_id?: number | null;
        },
        options: ServiceOptions = {},
    ): void {
        router.post('/tasks', data as unknown as RequestPayload, {
            preserveScroll: true,
            ...options,
        });
    },

    /**
     * Toggle task completion status
     */
    toggleComplete(taskId: number, options: ServiceOptions = {}): void {
        router.put(
            `/tasks/${taskId}/toggle-complete`,
            {},
            {
                preserveScroll: true,
                ...options,
            },
        );
    },

    /**
     * Update task details (description, due date, etc.)
     */
    updateTask(
        taskId: number,
        data: {
            description?: string;
            due_date?: string | null;
            start_date?: string | null;
            is_milestone?: boolean;
            parent_id?: number | null;
        },
        options: ServiceOptions = {},
    ): void {
        router.patch(`/tasks/${taskId}`, data as unknown as RequestPayload, {
            preserveScroll: true,
            ...options,
        });
    },

    /**
     * Delete a task
     */
    deleteTask(taskId: number, options: ServiceOptions = {}): void {
        router.delete(`/tasks/${taskId}`, {
            preserveScroll: true,
            ...options,
        });
    },

    /**
     * Reorder tasks
     */
    reorderTasks(tasks: ReorderTaskData[], options: ServiceOptions = {}): void {
        router.post('/tasks/reorder', { tasks } as unknown as RequestPayload, {
            preserveScroll: true,
            ...options,
        });
    },

    /**
     * Bulk complete tasks
     */
    bulkComplete(taskIds: number[], options: ServiceOptions = {}): void {
        router.post(
            '/tasks/bulk-complete',
            { task_ids: taskIds } as unknown as RequestPayload,
            {
                preserveScroll: true,
                ...options,
            },
        );
    },
};
