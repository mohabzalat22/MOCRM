import { useState } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { Button } from '@/components/ui/button';
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
import type { Reminder, ServiceOptions, CreateReminderData, UpdateReminderData } from '@/types';

interface ReminderFormProps {
    reminder?: Reminder;
    clientId?: number | string;
    clients?: { id: number; name: string }[];
    onSuccess?: () => void;
}

export function ReminderForm({
    reminder,
    clientId,
    clients = [],
    onSuccess,
}: ReminderFormProps) {
    const [processing, setProcessing] = useState(false);
    const [showUpdateConfirm, setShowUpdateConfirm] = useState(false);
    const [data, setData] = useState({
        title: reminder?.title || '',
        description: reminder?.description || '',
        priority: reminder?.priority || 'medium',
        reminder_at: reminder?.reminder_at 
            ? new Date(reminder.reminder_at).toISOString().slice(0, 16) 
            : '',
        remindable_id: clientId || reminder?.remindable_id || '',
        remindable_type: 'App\\Models\\Client',
    });

    const performSubmit = () => {
        setProcessing(true);
        const options: ServiceOptions = {
            onSuccess: () => {
                setProcessing(false);
                toast.success(reminder ? 'Reminder updated' : 'Reminder created');
                onSuccess?.();
            },
            onError: (errors) => {
                setProcessing(false);
                Object.values(errors).forEach((error) => toast.error(error));
            },
        };

        if (reminder) {
            reminderService.update(reminder.id, data as UpdateReminderData, options);
        } else {
            reminderService.create(data as CreateReminderData, options);
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
        <form onSubmit={submit} className="space-y-4 max-w-full overflow-hidden">
            {!clientId && !reminder && clients.length > 0 && (
                <div className="space-y-2">
                    <Label htmlFor="client">Client</Label>
                    <Select
                        value={data.remindable_id.toString()}
                        onValueChange={(val) => setData({ ...data, remindable_id: val })}
                        required
                    >
                        <SelectTrigger id="client">
                            <SelectValue placeholder="Select a client" />
                        </SelectTrigger>
                        <SelectContent>
                            {clients.map((client) => (
                                <SelectItem key={client.id} value={client.id.toString()}>
                                    {client.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}

            <div className="space-y-2 max-w-full">
                <Label htmlFor="title">What to do?</Label>
                <Input
                    id="title"
                    placeholder="e.g. Follow up on proposal"
                    value={data.title}
                    onChange={(e) => setData({ ...data, title: e.target.value })}
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
                        onChange={(e) => setData({ ...data, reminder_at: e.target.value })}
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label>Priority</Label>
                    <div className="flex gap-2">
                        {[
                            { value: 'low', label: 'Low', color: 'bg-green-500 hover:bg-green-600' },
                            { value: 'medium', label: 'Medium', color: 'bg-yellow-500 hover:bg-yellow-600 text-yellow-950' },
                            { value: 'high', label: 'High', color: 'bg-red-500 hover:bg-red-600' },
                        ].map((p) => (
                            <Button
                                key={p.value}
                                type="button"
                                variant={data.priority === p.value ? 'default' : 'outline'}
                                size="sm"
                                className={`flex-1 ${data.priority === p.value ? p.color : ''}`}
                                onClick={() => setData({ ...data, priority: p.value as Reminder['priority'] })}
                            >
                                {p.label}
                            </Button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="space-y-2 max-w-full">
                <Label htmlFor="description">Details (Optional)</Label>
                <Textarea
                    id="description"
                    placeholder="Add more context..."
                    value={data.description}
                    onChange={(e) => setData({ ...data, description: e.target.value })}
                    rows={3}
                    className="w-full min-w-0"
                />
            </div>

            <div className="flex justify-end gap-2 pt-2">
                <Button type="submit" disabled={processing}>
                    {processing ? 'Saving...' : reminder ? 'Update Reminder' : 'Set Reminder'}
                </Button>
            </div>

            <ConfirmDialog
                isOpen={showUpdateConfirm}
                title="Update Reminder?"
                message="Are you sure you want to save these changes to the reminder?"
                onConfirm={() => {
                    setShowUpdateConfirm(false);
                    performSubmit();
                }}
                onCancel={() => setShowUpdateConfirm(false)}
            />
        </form>
    );
}
