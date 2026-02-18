import { Plus, X } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { ActionItem } from '@/types';

interface ActionItemsSectionProps {
    actionItems: ActionItem[];
    newActionItem: string;
    setNewActionItem: (val: string) => void;
    addActionItem: () => void;
    toggleActionItem: (index: number) => void;
    removeActionItem: (index: number) => void;
}

export const ActionItemsSection: React.FC<ActionItemsSectionProps> = ({
    actionItems,
    newActionItem,
    setNewActionItem,
    addActionItem,
    toggleActionItem,
    removeActionItem,
}) => {
    return (
        <div className="space-y-2">
            <Label className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Action Items
            </Label>
            <div className="flex gap-2">
                <Input
                    placeholder="Add mission/task..."
                    className="h-9 text-sm"
                    value={newActionItem}
                    onChange={(e) => setNewActionItem(e.target.value)}
                    onKeyDown={(e) =>
                        e.key === 'Enter' &&
                        (e.preventDefault(), addActionItem())
                    }
                />
                <Button
                    type="button"
                    size="icon"
                    variant="secondary"
                    className="h-9 w-9 shrink-0"
                    onClick={addActionItem}
                >
                    <Plus className="h-4 w-4" />
                </Button>
            </div>
            {actionItems.length > 0 && (
                <div className="mt-2 max-h-[120px] space-y-1 overflow-auto rounded-md border bg-muted/10 p-2">
                    {actionItems.map((item, idx) => (
                        <div
                            key={idx}
                            className="group flex items-center gap-3 py-1"
                        >
                            <Checkbox
                                id={`item-${idx}`}
                                checked={item.completed}
                                onCheckedChange={() => toggleActionItem(idx)}
                                className="h-4 w-4"
                            />
                            <label
                                htmlFor={`item-${idx}`}
                                className={cn(
                                    'cursor-pointer text-sm transition-colors',
                                    item.completed
                                        ? 'text-muted-foreground line-through opacity-60'
                                        : 'text-foreground',
                                )}
                            >
                                {item.text}
                            </label>
                            <button
                                type="button"
                                className="ml-auto opacity-0 transition-opacity group-hover:opacity-100"
                                onClick={() => removeActionItem(idx)}
                            >
                                <X className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
