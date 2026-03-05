import type { RequestPayload } from '@inertiajs/core';
import { router } from '@inertiajs/react';
import type { ServiceOptions } from '@/types';

export interface ReorderTemplateTaskData {
    id: number;
    order: number;
}

export const templateTaskService = {
    /**
     * Create a new template task
     */
    createTask(
        data: {
            project_template_id: number;
            title: string;
            description?: string;
            priority?: string;
            is_milestone?: boolean;
            parent_id?: number | null;
        },
        options: ServiceOptions = {},
    ): void {
        router.post(
            route('project-template-tasks.store'),
            data as unknown as RequestPayload,
            {
                preserveScroll: true,
                ...options,
            },
        );
    },

    /**
     * Update a template task
     */
    updateTask(
        taskId: number,
        data: {
            title?: string;
            description?: string;
            priority?: string;
            is_milestone?: boolean;
            parent_id?: number | null;
        },
        options: ServiceOptions = {},
    ): void {
        router.patch(
            route('project-template-tasks.update', taskId),
            data as unknown as RequestPayload,
            {
                preserveScroll: true,
                ...options,
            },
        );
    },
    /**
     * Reorder template tasks
     */
    reorderTasks(
        tasks: ReorderTemplateTaskData[],
        options: ServiceOptions = {},
    ): void {
        router.post(
            route('project-template-tasks.reorder'),
            { tasks } as unknown as RequestPayload,
            {
                preserveScroll: true,
                ...options,
            },
        );
    },

    /**
     * Delete a template task
     */
    deleteTask(taskId: number, options: ServiceOptions = {}): void {
        router.delete(route('project-template-tasks.destroy', taskId), {
            preserveScroll: true,
            ...options,
        });
    },
};
