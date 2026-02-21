import { format } from 'date-fns';
import { useState } from 'react';
import { taskService } from '@/services/taskService';
import type { Task } from '@/types/project';

interface UseTaskFormProps {
    task: Task;
    onSuccess?: () => void;
    onError?: () => void;
}

export function useTaskForm({ task, onSuccess, onError }: UseTaskFormProps) {
    const [title, setTitle] = useState(task.title);
    const [description, setDescription] = useState<string>(
        task.description ?? '',
    );
    const [status, setStatus] = useState<string>(task.status);
    const [priority, setPriority] = useState<string>(task.priority);
    const [startDate, setStartDate] = useState<Date | undefined>(
        task.start_date ? new Date(task.start_date) : undefined,
    );
    const [dueDate, setDueDate] = useState<Date | undefined>(
        task.due_date ? new Date(task.due_date) : undefined,
    );
    const [isMilestone, setIsMilestone] = useState(task.is_milestone);
    const [parentId, setParentId] = useState<string>(
        task.parent_id?.toString() ?? 'none',
    );
    const [saving, setSaving] = useState(false);

    const [prevTaskId, setPrevTaskId] = useState(task.id);

    if (task.id !== prevTaskId) {
        setPrevTaskId(task.id);
        setTitle(task.title);
        setDescription(task.description ?? '');
        setStatus(task.status);
        setPriority(task.priority);
        setStartDate(task.start_date ? new Date(task.start_date) : undefined);
        setDueDate(task.due_date ? new Date(task.due_date) : undefined);
        setIsMilestone(task.is_milestone);
        setParentId(task.parent_id?.toString() ?? 'none');
    }

    const handleSave = () => {
        if (!title.trim()) return;

        // Basic date validation
        if (startDate && dueDate && startDate > dueDate) {
            // Ideally we'd show a toast here, but for now we'll just prevent save
            // and the UI should ideally show the error state
            return;
        }

        setSaving(true);
        taskService.updateTask(
            task.id,
            {
                title: title.trim(),
                description: description || undefined,
                status,
                priority,
                start_date: startDate ? format(startDate, 'yyyy-MM-dd') : null,
                due_date: dueDate ? format(dueDate, 'yyyy-MM-dd') : null,
                is_milestone: isMilestone,
                parent_id: parentId === 'none' ? null : parseInt(parentId),
            },
            {
                onSuccess: () => {
                    setSaving(false);
                    onSuccess?.();
                },
                onError: () => {
                    setSaving(false);
                    onError?.();
                },
            },
        );
    };

    return {
        title,
        setTitle,
        description,
        setDescription,
        status,
        setStatus,
        priority,
        setPriority,
        startDate,
        setStartDate,
        dueDate,
        setDueDate,
        isMilestone,
        setIsMilestone,
        parentId,
        setParentId,
        saving,
        handleSave,
    };
}
