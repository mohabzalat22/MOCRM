import { AlertCircle } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { Reminder } from '@/types';

interface ReminderSectionProps {
    enabled: boolean;
    setEnabled: (val: boolean) => void;
    reminderData: {
        title: string;
        reminder_at: string;
        priority: Reminder['priority'];
    };
    onDataChange: (data: ReminderSectionProps['reminderData']) => void;
}

export const ReminderSection: React.FC<ReminderSectionProps> = ({
    enabled,
    setEnabled,
    reminderData,
    onDataChange,
}) => {
    return (
        <div className="space-y-4 rounded-xl border bg-accent/5 p-4">
            <div className="flex items-center space-x-3">
                <Checkbox
                    id="set-reminder"
                    checked={enabled}
                    onCheckedChange={(checked) => setEnabled(!!checked)}
                    className="h-5 w-5"
                />
                <Label
                    htmlFor="set-reminder"
                    className="flex cursor-pointer items-center gap-2 text-sm font-semibold"
                >
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                    Set a follow-up reminder
                </Label>
            </div>

            {enabled && (
                <div className="grid animate-in grid-cols-1 gap-4 rounded-lg border bg-background p-3 shadow-sm duration-300 slide-in-from-top-2 sm:grid-cols-2">
                    <div className="space-y-1.5">
                        <Label className="text-[10px] font-bold text-muted-foreground uppercase">
                            When?
                        </Label>
                        <Input
                            type="datetime-local"
                            className="h-9 text-xs"
                            value={reminderData.reminder_at}
                            onChange={(e) =>
                                onDataChange({
                                    ...reminderData,
                                    reminder_at: e.target.value,
                                })
                            }
                            required
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-[10px] font-bold text-muted-foreground uppercase">
                            Priority
                        </Label>
                        <div className="flex gap-1.5">
                            {(['low', 'medium', 'high'] as const).map((p) => (
                                <Button
                                    key={p}
                                    type="button"
                                    variant={
                                        reminderData.priority === p
                                            ? 'default'
                                            : 'outline'
                                    }
                                    size="sm"
                                    className={cn(
                                        'h-8 flex-1 text-[10px] font-semibold capitalize transition-all',
                                        reminderData.priority === p &&
                                            p === 'high' &&
                                            'border-destructive bg-destructive text-white shadow-sm',
                                        reminderData.priority === p &&
                                            p === 'medium' &&
                                            'border-amber-500 bg-amber-500 text-white shadow-sm',
                                        reminderData.priority === p &&
                                            p === 'low' &&
                                            'border-emerald-600 bg-emerald-600 text-white shadow-sm',
                                    )}
                                    onClick={() =>
                                        onDataChange({
                                            ...reminderData,
                                            priority: p,
                                        })
                                    }
                                >
                                    {p}
                                </Button>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                        <Label className="text-[10px] font-bold text-muted-foreground uppercase">
                            What is it about?
                        </Label>
                        <Input
                            placeholder="Subject of the reminder..."
                            className="h-9 text-xs"
                            value={reminderData.title}
                            onChange={(e) =>
                                onDataChange({
                                    ...reminderData,
                                    title: e.target.value,
                                })
                            }
                        />
                    </div>
                </div>
            )}
        </div>
    );
};
