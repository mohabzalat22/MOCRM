import { format } from 'date-fns';
import { useState } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { Button } from '@/components/ui/button';
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
import { reminderService } from '@/services/reminderService';
import type {
    Reminder,
    ServiceOptions,
    CreateReminderData,
    UpdateReminderData,
} from '@/types';

interface ReminderFormProps {
    reminder?: Reminder;
    clientId?: number | string;
    clients?: { id: number; name: string }[];
    activities?: { id: number; type: string; summary: string }[];
    onSuccess?: () => void;
}

export function ReminderForm({
    reminder,
    clientId,
    clients = [],
    activities = [],
    onSuccess,
}: ReminderFormProps) {
    const [processing, setProcessing] = useState(false);
    const [showUpdateConfirm, setShowUpdateConfirm] = useState(false);

    // Determine initial type
    const initialType =
        reminder?.remindable_type ||
        (clientId ? 'App\\Models\\Client' : 'none');

    const [data, setData] = useState({
        title: reminder?.title || '',
        description: reminder?.description || '',
        priority: reminder?.priority || 'medium',
        reminder_at: reminder?.reminder_at
            ? format(new Date(reminder.reminder_at), "yyyy-MM-dd'T'HH:mm")
            : '',
        remindable_id: clientId || reminder?.remindable_id || '',
        remindable_type: initialType,
        is_recurring: reminder?.is_recurring || false,
        recurrence_pattern: (reminder?.recurrence_pattern ||
            'weekly') as Reminder['recurrence_pattern'],
        recurrence_interval: reminder?.recurrence_interval || 1,
        recurrence_end_date: reminder?.recurrence_end_date || '',
    });

    const performSubmit = () => {
        const rid =
            data.remindable_id &&
            data.remindable_id !== 'none' &&
            data.remindable_id !== ''
                ? typeof data.remindable_id === 'string'
                    ? parseInt(data.remindable_id, 10)
                    : data.remindable_id
                : null;

        setProcessing(true);
        const options: ServiceOptions = {
            onSuccess: () => {
                setProcessing(false);
                toast.success(
                    reminder ? 'Reminder updated' : 'Reminder created',
                );
                onSuccess?.();
            },
            onError: (errors) => {
                setProcessing(false);
                Object.values(errors).forEach((error) => toast.error(error));
            },
        };

        const submissionData = {
            ...data,
            remindable_id: rid,
            remindable_type: rid ? data.remindable_type : null,
            reminder_at: new Date(data.reminder_at).toISOString(),
            // Ensure recurrence fields are null if not recurring
            recurrence_pattern: data.is_recurring
                ? data.recurrence_pattern
                : null,
            recurrence_interval: data.is_recurring
                ? data.recurrence_interval
                : null,
            recurrence_end_date:
                data.is_recurring && data.recurrence_end_date
                    ? data.recurrence_end_date
                    : null,
        };

        if (reminder) {
            reminderService.update(
                reminder.id,
                submissionData as UpdateReminderData,
                options,
            );
        } else {
            reminderService.create(
                submissionData as CreateReminderData,
                options,
            );
        }
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        if (reminder) {
            setShowUpdateConfirm(true);
        } else {
            performSubmit();
        }
    };

    return (
        <form
            onSubmit={submit}
            className="max-w-full space-y-4 overflow-hidden"
        >
            {!clientId && (
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Relate to</Label>
                        <Select
                            value={data.remindable_type || 'none'}
                            onValueChange={(val) =>
                                setData({
                                    ...data,
                                    remindable_type: val,
                                    remindable_id: '',
                                })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">
                                    None (General)
                                </SelectItem>
                                <SelectItem value="App\Models\Client">
                                    Client
                                </SelectItem>
                                <SelectItem value="App\Models\Activity">
                                    Activity
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {data.remindable_type === 'App\\Models\\Client' && (
                        <div className="space-y-2">
                            <Label htmlFor="client">Client</Label>
                            <Select
                                value={data.remindable_id?.toString() || ''}
                                onValueChange={(val) =>
                                    setData({ ...data, remindable_id: val })
                                }
                            >
                                <SelectTrigger id="client">
                                    <SelectValue placeholder="Select client" />
                                </SelectTrigger>
                                <SelectContent>
                                    {clients.map((client) => (
                                        <SelectItem
                                            key={client.id}
                                            value={client.id.toString()}
                                        >
                                            {client.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {data.remindable_type === 'App\\Models\\Activity' && (
                        <div className="space-y-2">
                            <Label htmlFor="activity">Activity</Label>
                            <Select
                                value={data.remindable_id?.toString() || ''}
                                onValueChange={(val) =>
                                    setData({ ...data, remindable_id: val })
                                }
                            >
                                <SelectTrigger id="activity">
                                    <SelectValue placeholder="Select activity" />
                                </SelectTrigger>
                                <SelectContent>
                                    {activities.map((activity) => (
                                        <SelectItem
                                            key={activity.id}
                                            value={activity.id.toString()}
                                        >
                                            {activity.type}: {activity.summary}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </div>
            )}

            <div className="max-w-full space-y-2">
                <Label htmlFor="title">What to do?</Label>
                <Input
                    id="title"
                    placeholder="e.g. Follow up on proposal"
                    value={data.title}
                    onChange={(e) =>
                        setData({ ...data, title: e.target.value })
                    }
                    required
                    className="w-full"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="reminder_at">When?</Label>
                    <Input
                        id="reminder_at"
                        type="datetime-local"
                        value={data.reminder_at}
                        onChange={(e) =>
                            setData({ ...data, reminder_at: e.target.value })
                        }
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label>Priority</Label>
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
                                    data.priority === p.value
                                        ? 'default'
                                        : 'outline'
                                }
                                size="sm"
                                className={`flex-1 ${data.priority === p.value ? p.color : ''}`}
                                onClick={() =>
                                    setData({
                                        ...data,
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
            </div>

            <div className="space-y-4 rounded-md border p-4">
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="is_recurring"
                        checked={data.is_recurring}
                        onCheckedChange={(checked) =>
                            setData({ ...data, is_recurring: checked === true })
                        }
                    />
                    <Label htmlFor="is_recurring">Repeat this reminder</Label>
                </div>

                {data.is_recurring && (
                    <div className="ml-1.5 grid grid-cols-2 gap-4 border-l-2 border-muted pl-6">
                        <div className="space-y-2">
                            <Label htmlFor="recurrence_pattern">Pattern</Label>
                            <Select
                                value={data.recurrence_pattern || 'weekly'}
                                onValueChange={(val) =>
                                    setData({
                                        ...data,
                                        recurrence_pattern:
                                            val as Reminder['recurrence_pattern'],
                                    })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select pattern" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="daily">Daily</SelectItem>
                                    <SelectItem value="weekly">
                                        Weekly
                                    </SelectItem>
                                    <SelectItem value="monthly">
                                        Monthly
                                    </SelectItem>
                                    <SelectItem value="quarterly">
                                        Quarterly
                                    </SelectItem>
                                    <SelectItem value="yearly">
                                        Yearly
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="recurrence_interval">
                                Every (Interval)
                            </Label>
                            <Input
                                id="recurrence_interval"
                                type="number"
                                min={1}
                                value={data.recurrence_interval}
                                onChange={(e) =>
                                    setData({
                                        ...data,
                                        recurrence_interval:
                                            parseInt(e.target.value) || 1,
                                    })
                                }
                            />
                        </div>
                        <div className="col-span-2 space-y-2">
                            <Label htmlFor="recurrence_end_date">
                                End Date (Optional)
                            </Label>
                            <Input
                                id="recurrence_end_date"
                                type="date"
                                value={data.recurrence_end_date}
                                onChange={(e) =>
                                    setData({
                                        ...data,
                                        recurrence_end_date: e.target.value,
                                    })
                                }
                            />
                        </div>
                    </div>
                )}
            </div>

            <div className="max-w-full space-y-2">
                <Label htmlFor="description">Details (Optional)</Label>
                <Textarea
                    id="description"
                    placeholder="Add more context..."
                    value={data.description}
                    onChange={(e) =>
                        setData({ ...data, description: e.target.value })
                    }
                    rows={3}
                    className="w-full min-w-0"
                />
            </div>

            <div className="flex justify-end gap-2 pt-2">
                <Button type="submit" disabled={processing}>
                    {processing
                        ? 'Saving...'
                        : reminder
                          ? 'Update Reminder'
                          : 'Set Reminder'}
                </Button>
            </div>

            <ConfirmDialog
                isOpen={showUpdateConfirm}
                title="Save Changes?"
                message="Are you sure you want to update this reminder? All modifications will be saved immediately."
                onConfirm={() => {
                    setShowUpdateConfirm(false);
                    performSubmit();
                }}
                onCancel={() => setShowUpdateConfirm(false)}
            />
        </form>
    );
}
