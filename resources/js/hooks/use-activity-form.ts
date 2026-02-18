import { useState } from 'react';
import { toast } from 'sonner';
import type { ActivityTag } from '@/components/clients/activity-tag-input';
import { clientService } from '@/services/clientService';
import { reminderService } from '@/services/reminderService';
import { useClientStore } from '@/stores/useClientStore';
import type {
    Activity,
    ActivityType,
    ActivityData,
    ActionItem,
    Reminder,
} from '@/types';

interface ActivityFormData {
    type: ActivityType;
    summary: string;
    data: ActivityData;
}

interface UseActivityFormProps {
    activity?: Activity;
    initialType?: ActivityType;
    clientId?: number | string;
    onSuccess?: () => void;
    enableImmediateSave?: boolean;
}

export function useActivityForm({
    activity,
    initialType,
    clientId,
    onSuccess,
    enableImmediateSave,
}: UseActivityFormProps) {
    const { addActivityChange } = useClientStore();

    const [data, setData] = useState<ActivityFormData>({
        type: initialType || activity?.type || 'note',
        summary: activity?.summary || '',
        data: activity?.data || {},
    });

    const [quickMode, setQuickMode] = useState(false);
    const [occurredAt, setOccurredAt] = useState<string>(
        activity?.occurred_at
            ? new Date(activity.occurred_at).toISOString().slice(0, 16)
            : new Date().toISOString().slice(0, 16),
    );
    const [markdownNotes, setMarkdownNotes] = useState(
        activity?.data?.notes || '',
    );
    const [actionItems, setActionItems] = useState<ActionItem[]>(
        activity?.data?.action_items || [],
    );
    const [newActionItem, setNewActionItem] = useState('');
    const [processing, setProcessing] = useState(false);

    const [reminderEnabled, setReminderEnabled] = useState(false);
    const [reminderData, setReminderData] = useState({
        title: '',
        reminder_at: '',
        priority: 'low' as Reminder['priority'],
    });

    const handleTypeChange = (type: ActivityType) => {
        setData((prev) => ({ ...prev, type }));
    };

    const updateData = <K extends keyof ActivityData>(
        key: K,
        value: ActivityData[K],
    ) => {
        setData((prev) => ({
            ...prev,
            data: { ...prev.data, [key]: value },
        }));
    };

    const addActionItem = () => {
        if (!newActionItem.trim()) return;
        const updated = [
            ...actionItems,
            { text: newActionItem, completed: false },
        ];
        setActionItems(updated);
        updateData('action_items', updated);
        setNewActionItem('');
    };

    const toggleActionItem = (index: number) => {
        const updated = actionItems.map((item, i) =>
            i === index ? { ...item, completed: !item.completed } : item,
        );
        setActionItems(updated);
        updateData('action_items', updated);
    };

    const removeActionItem = (index: number) => {
        const updated = actionItems.filter((_, i) => i !== index);
        setActionItems(updated);
        updateData('action_items', updated);
    };

    const resetForm = () => {
        setData({
            type: initialType || 'note',
            summary: '',
            data: {},
        });
        setMarkdownNotes('');
        setOccurredAt(new Date().toISOString().slice(0, 16));
        setActionItems([]);
    };

    const submit = async (
        e: React.FormEvent<HTMLFormElement>,
        {
            selectedTags,
            files,
            removedAttachmentIds,
            resetAttachments,
        }: {
            selectedTags: ActivityTag[];
            files: File[];
            removedAttachmentIds: number[];
            resetAttachments: (initial?: {
                files: File[];
                removed_attachment_ids: number[];
            }) => void;
        },
    ) => {
        e.preventDefault();
        e.stopPropagation();
        setProcessing(true);

        const formData = new FormData();
        formData.append('type', data.type);
        formData.append('summary', data.summary);
        formData.append('occurred_at', occurredAt);

        const finalizedData = {
            ...data.data,
            notes: markdownNotes,
            action_items: actionItems,
        };

        formData.append('data', JSON.stringify(finalizedData));

        selectedTags.forEach((tag, index) => {
            formData.append(`tags[${index}][name]`, tag.name);
            formData.append(`tags[${index}][color]`, tag.color);
        });

        files.forEach((file, index) => {
            formData.append(`attachments[${index}]`, file);
        });

        removedAttachmentIds.forEach((id, index) => {
            formData.append(`removed_attachment_ids[${index}]`, id.toString());
        });

        if (enableImmediateSave && clientId) {
            const apiParams = activity
                ? { activityId: activity.id, activityData: formData }
                : { clientId, activityData: formData };

            try {
                const apiParamsObj = {
                    ...apiParams,
                    onSuccess: () => {
                        setProcessing(false);
                        toast.success(
                            activity ? 'Activity updated.' : 'Activity added.',
                        );

                        if (reminderEnabled && reminderData.reminder_at) {
                            reminderService.create({
                                title:
                                    reminderData.title ||
                                    `Follow up: ${data.summary}`,
                                reminder_at: new Date(
                                    reminderData.reminder_at,
                                ).toISOString(),
                                priority: reminderData.priority,
                                remindable_id: clientId as number,
                                remindable_type: 'App\\Models\\Client',
                            });
                        }

                        onSuccess?.();
                        if (!activity) {
                            resetForm();
                            resetAttachments();
                        }
                    },
                    onError: (errors: Record<string, string | string[]>) => {
                        setProcessing(false);
                        if (errors && Object.keys(errors).length > 0) {
                            Object.values(errors).forEach((message) => {
                                if (typeof message === 'string')
                                    toast.error(message);
                            });
                        } else {
                            toast.error('Failed to save activity.');
                        }
                    },
                };

                if (activity) {
                    clientService.updateActivity(
                        apiParamsObj as {
                            activityId: number;
                            activityData: FormData;
                            onSuccess?: () => void;
                            onError?: (
                                errors: Record<string, string | string[]>,
                            ) => void;
                        },
                    );
                } else {
                    clientService.createActivity(
                        apiParamsObj as {
                            clientId: number | string;
                            activityData: FormData;
                            onSuccess?: () => void;
                            onError?: (
                                errors: Record<string, string | string[]>,
                            ) => void;
                        },
                    );
                }
            } catch {
                setProcessing(false);
                toast.error('An unexpected error occurred.');
            }
            return;
        }

        const storeData = {
            ...data,
            occurred_at: occurredAt,
            tags: selectedTags,
            files,
            removed_attachment_ids: removedAttachmentIds,
            data: finalizedData,
        };

        if (activity) {
            addActivityChange({
                type: 'update',
                activityId: activity.id,
                activityData: storeData,
            });
        } else {
            addActivityChange({
                type: 'create',
                activityData: storeData,
            });
        }

        if (!activity) {
            resetForm();
            resetAttachments();
        }
        setProcessing(false);
        onSuccess?.();
    };

    return {
        data,
        setData,
        quickMode,
        setQuickMode,
        occurredAt,
        setOccurredAt,
        markdownNotes,
        setMarkdownNotes,
        actionItems,
        setActionItems,
        newActionItem,
        setNewActionItem,
        processing,
        reminderEnabled,
        setReminderEnabled,
        reminderData,
        setReminderData,
        handleTypeChange,
        updateData,
        addActionItem,
        toggleActionItem,
        removeActionItem,
        resetForm,
        submit,
    };
}
