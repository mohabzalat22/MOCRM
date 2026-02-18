import { Phone, Mail, Users, FileText, CreditCard, Plus } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

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

export interface AddActivityFormProps {
    clientId?: number | string; // Optional now since we don't use it directly
    activity?: Activity;
    initialType?: ActivityType;
    onSuccess?: () => void;
    enableImmediateSave?: boolean;
}

interface ActivityFormData {
    type: ActivityType;
    summary: string;
    data: ActivityData;
}

export default function ActivityForm({
    activity,
    initialType,
    onSuccess,
    enableImmediateSave = false,
    clientId,
}: AddActivityFormProps) {
    const { addActivityChange } = useClientStore();

    const [data, setData] = useState<ActivityFormData>({
        type: initialType || activity?.type || 'note',
        summary: activity?.summary || '',
        data: activity?.data || {},
    });
    const [processing, setProcessing] = useState(false);

    const [reminderEnabled, setReminderEnabled] = useState(false);
    const [reminderData, setReminderData] = useState({
        title: '',
        reminder_at: '',
        priority: 'low' as Reminder['priority'],
    });

    const [actionItems, setActionItems] = useState<ActionItem[]>(
        activity?.data?.action_items || [],
    );
    const [newActionItem, setNewActionItem] = useState('');

    const handleTypeChange = (type: ActivityType) => {
        setData((prev) => ({
            ...prev,
            type,
            summary: (activity?.type === type ? activity.summary : '') || '',
            data: (activity?.type === type ? activity.data : {}) || {},
        }));
        setActionItems(
            activity?.type === type ? activity.data?.action_items || [] : [],
        );
    };

    const updateData = <K extends keyof ActivityData>(
        key: K,
        value: ActivityData[K],
    ) => {
        setData((prev) => ({
            ...prev,
            data: {
                ...prev.data,
                [key]: value,
            },
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

    const submit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        e.stopPropagation(); // Prevent event from bubbling to parent form
        setProcessing(true);

        if (enableImmediateSave && clientId) {
            clientService.createActivity({
                clientId,
                activityData: data as unknown as Record<string, unknown>,
                onSuccess: () => {
                    setProcessing(false);
                    toast.success('Activity added successfully.');

                    // Create reminder if enabled
                    if (reminderEnabled && reminderData.reminder_at) {
                        reminderService.create({
                            title:
                                reminderData.title ||
                                `Follow up: ${data.summary}`,
                            reminder_at: new Date(
                                reminderData.reminder_at,
                            ).toISOString(),
                            priority: reminderData.priority,
                            remindable_id: clientId,
                            remindable_type: 'App\\Models\\Client',
                        });
                    }

                    onSuccess?.();
                    // Reset form
                    if (!activity) {
                        setData({
                            type: initialType || 'note',
                            summary: '',
                            data: {},
                        });
                        setActionItems([]);
                    }
                },
                onError: (errors) => {
                    setProcessing(false);
                    // Show error toast
                    if (errors && Object.keys(errors).length > 0) {
                        Object.values(errors).forEach((message) => {
                            if (typeof message === 'string') {
                                toast.error(message);
                            }
                        });
                    } else {
                        toast.error('Failed to add activity.');
                    }
                },
            });
            return;
        }

        // Add the activity change to the store instead of submitting immediately
        if (activity) {
            // Update existing activity
            addActivityChange({
                type: 'update',
                activityId: activity.id,
                activityData: data,
            });
        } else {
            // Create new activity
            addActivityChange({
                type: 'create',
                activityData: data,
            });
        }

        // Reset form for new activities
        if (!activity) {
            setData({
                type: initialType || 'note',
                summary: '',
                data: {},
            });
            setActionItems([]);
        }

        setProcessing(false);
        onSuccess?.();
    };

    const activityTypes: {
        type: ActivityType;
        label: string;
        icon: React.ComponentType<{ className?: string }>;
    }[] = [
        { type: 'note', label: 'Note', icon: FileText },
        { type: 'call', label: 'Call', icon: Phone },
        { type: 'email', label: 'Email', icon: Mail },
        { type: 'meeting', label: 'Meeting', icon: Users },
        { type: 'transaction', label: 'Transaction', icon: CreditCard },
    ];

    return (
        <Card className="overflow-hidden border-none bg-muted/30 shadow-sm">
            <CardContent className="p-4">
                <form onSubmit={submit} className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                        {activityTypes.map((t) => (
                            <Button
                                key={t.type}
                                type="button"
                                variant={
                                    data.type === t.type ? 'default' : 'outline'
                                }
                                size="sm"
                                className="gap-2"
                                onClick={() => handleTypeChange(t.type)}
                            >
                                <t.icon className="h-4 w-4" />
                                {t.label}
                            </Button>
                        ))}
                    </div>

                    <div className="grid gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="summary">Subject / Title</Label>
                            <Input
                                id="summary"
                                placeholder={
                                    data.type === 'note'
                                        ? 'Quick summary...'
                                        : data.type === 'call'
                                          ? 'Call topic...'
                                          : data.type === 'email'
                                            ? 'Email subject...'
                                            : data.type === 'meeting'
                                              ? 'Meeting title...'
                                              : 'Transaction reference...'
                                }
                                value={data.summary}
                                onChange={(e) =>
                                    setData((prev) => ({
                                        ...prev,
                                        summary: e.target.value,
                                    }))
                                }
                                required
                            />
                        </div>

                        {data.type === 'call' && (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Duration</Label>
                                    <Input
                                        placeholder="e.g. 15m"
                                        value={data.data.duration || ''}
                                        onChange={(e) =>
                                            updateData(
                                                'duration',
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Outcome</Label>
                                    <Select
                                        value={data.data.outcome || ''}
                                        onValueChange={(val) =>
                                            updateData('outcome', val)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select outcome" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Connected">
                                                Connected
                                            </SelectItem>
                                            <SelectItem value="Voicemail">
                                                Voicemail
                                            </SelectItem>
                                            <SelectItem value="No answer">
                                                No answer
                                            </SelectItem>
                                            <SelectItem value="Busy">
                                                Busy
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        )}

                        {data.type === 'meeting' && (
                            <>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Meeting Type</Label>
                                        <Select
                                            value={data.data.meeting_type || ''}
                                            onValueChange={(val) =>
                                                updateData('meeting_type', val)
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="In-person">
                                                    In-person
                                                </SelectItem>
                                                <SelectItem value="Video">
                                                    Video
                                                </SelectItem>
                                                <SelectItem value="Phone">
                                                    Phone
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Duration</Label>
                                        <Input
                                            placeholder="e.g. 1h"
                                            value={data.data.duration || ''}
                                            onChange={(e) =>
                                                updateData(
                                                    'duration',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Attendees</Label>
                                    <Input
                                        placeholder="Name, Name..."
                                        value={data.data.attendees || ''}
                                        onChange={(e) =>
                                            updateData(
                                                'attendees',
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Action Items</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Add action item..."
                                            value={newActionItem}
                                            onChange={(e) =>
                                                setNewActionItem(e.target.value)
                                            }
                                            onKeyDown={(e) =>
                                                e.key === 'Enter' &&
                                                (e.preventDefault(),
                                                addActionItem())
                                            }
                                        />
                                        <Button
                                            type="button"
                                            size="icon"
                                            variant="outline"
                                            onClick={addActionItem}
                                        >
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    {actionItems.length > 0 && (
                                        <div className="mt-2 space-y-2 rounded-md border p-2">
                                            {actionItems.map((item, idx) => (
                                                <div
                                                    key={idx}
                                                    className="flex items-center gap-2"
                                                >
                                                    <Checkbox
                                                        id={`item-${idx}`}
                                                        checked={item.completed}
                                                        onCheckedChange={() =>
                                                            toggleActionItem(
                                                                idx,
                                                            )
                                                        }
                                                    />
                                                    <label
                                                        htmlFor={`item-${idx}`}
                                                        className={`text-sm ${item.completed ? 'text-muted-foreground line-through' : ''}`}
                                                    >
                                                        {item.text}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        {data.type === 'transaction' && (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Transaction Type</Label>
                                    <Select
                                        value={data.data.transaction_type || ''}
                                        onValueChange={(val) =>
                                            updateData('transaction_type', val)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Invoice Sent">
                                                Invoice Sent
                                            </SelectItem>
                                            <SelectItem value="Payment Received">
                                                Payment Received
                                            </SelectItem>
                                            <SelectItem value="Refund Issued">
                                                Refund Issued
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Amount</Label>
                                    <Input
                                        type="text"
                                        placeholder="$0.00"
                                        value={data.data.amount || ''}
                                        onChange={(e) =>
                                            updateData('amount', e.target.value)
                                        }
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="notes">
                                {data.type === 'note'
                                    ? 'Note Content'
                                    : 'Notes / Description'}
                            </Label>
                            <Textarea
                                id="notes"
                                placeholder="Add more details here..."
                                className="min-h-[80px]"
                                value={data.data.notes || ''}
                                onChange={(e) =>
                                    updateData('notes', e.target.value)
                                }
                            />
                        </div>
                    </div>

                    <div className="space-y-4 border-t pt-4">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="set-reminder"
                                checked={reminderEnabled}
                                onCheckedChange={(checked) =>
                                    setReminderEnabled(!!checked)
                                }
                            />
                            <Label
                                htmlFor="set-reminder"
                                className="cursor-pointer text-sm font-medium"
                            >
                                Set a follow-up reminder
                            </Label>
                        </div>

                        {reminderEnabled && (
                            <div className="grid animate-in grid-cols-1 gap-4 fade-in slide-in-from-top-1 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label className="text-xs">
                                        Reminder Date & Time
                                    </Label>
                                    <Input
                                        type="datetime-local"
                                        value={reminderData.reminder_at}
                                        onChange={(e) =>
                                            setReminderData({
                                                ...reminderData,
                                                reminder_at: e.target.value,
                                            })
                                        }
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs">Priority</Label>
                                    <div className="flex gap-2">
                                        {[
                                            {
                                                value: 'low',
                                                label: 'Low',
                                                color: 'bg-green-500 hover:bg-green-600',
                                            },
                                            {
                                                value: 'medium',
                                                label: 'Medium',
                                                color: 'bg-yellow-500 hover:bg-yellow-600 text-yellow-950',
                                            },
                                            {
                                                value: 'high',
                                                label: 'High',
                                                color: 'bg-red-500 hover:bg-red-600',
                                            },
                                        ].map((p) => (
                                            <Button
                                                key={p.value}
                                                type="button"
                                                variant={
                                                    reminderData.priority ===
                                                    p.value
                                                        ? 'default'
                                                        : 'outline'
                                                }
                                                size="sm"
                                                className={`h-8 flex-1 text-[10px] ${reminderData.priority === p.value ? p.color : ''}`}
                                                onClick={() =>
                                                    setReminderData({
                                                        ...reminderData,
                                                        priority:
                                                            p.value as Reminder['priority'],
                                                    })
                                                }
                                            >
                                                {p.label}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-2 sm:col-span-2">
                                    <Label className="text-xs">
                                        Reminder Subject (Optional)
                                    </Label>
                                    <Input
                                        placeholder="Defaults to activity subject..."
                                        value={reminderData.title}
                                        onChange={(e) =>
                                            setReminderData({
                                                ...reminderData,
                                                title: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="submit" disabled={processing}>
                            {processing
                                ? 'Adding...'
                                : activity
                                  ? 'Update Activity'
                                  : 'Add Activity'}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
