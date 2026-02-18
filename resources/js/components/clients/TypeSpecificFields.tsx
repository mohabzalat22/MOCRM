import React from 'react';
import { CurrencyInput } from '@/components/ui/currency-input';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { ActivityType, ActivityData } from '@/types';

interface TypeSpecificFieldsProps {
    type: ActivityType;
    data: ActivityData;
    updateData: <K extends keyof ActivityData>(
        key: K,
        value: ActivityData[K],
    ) => void;
}

export const TypeSpecificFields: React.FC<TypeSpecificFieldsProps> = ({
    type,
    data,
    updateData,
}) => {
    if (type === 'call') {
        return (
            <div className="grid grid-cols-2 gap-4 rounded-lg border bg-muted/20 p-3">
                <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Duration</Label>
                    <Input
                        placeholder="e.g. 15m"
                        className="h-9 text-sm"
                        value={data.duration || ''}
                        onChange={(e) => updateData('duration', e.target.value)}
                    />
                </div>
                <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Outcome</Label>
                    <Select
                        value={data.outcome || ''}
                        onValueChange={(val) => updateData('outcome', val)}
                    >
                        <SelectTrigger className="h-9 text-sm">
                            <SelectValue placeholder="Select outcome" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Connected">Connected</SelectItem>
                            <SelectItem value="Voicemail">Voicemail</SelectItem>
                            <SelectItem value="No answer">No answer</SelectItem>
                            <SelectItem value="Busy">Busy</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        );
    }

    if (type === 'meeting') {
        return (
            <div className="space-y-4 rounded-lg border bg-muted/20 p-3">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <Label className="text-xs font-medium">
                            Meeting Type
                        </Label>
                        <Select
                            value={data.meeting_type || ''}
                            onValueChange={(val) =>
                                updateData('meeting_type', val)
                            }
                        >
                            <SelectTrigger className="h-9 text-sm">
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="In-person">
                                    In-person
                                </SelectItem>
                                <SelectItem value="Video">Video</SelectItem>
                                <SelectItem value="Phone">Phone</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-xs font-medium">Duration</Label>
                        <Input
                            placeholder="e.g. 1h"
                            className="h-9 text-sm"
                            value={data.duration || ''}
                            onChange={(e) =>
                                updateData('duration', e.target.value)
                            }
                        />
                    </div>
                </div>
                <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Attendees</Label>
                    <Input
                        placeholder="Name, Name..."
                        className="h-9 text-sm"
                        value={data.attendees || ''}
                        onChange={(e) =>
                            updateData('attendees', e.target.value)
                        }
                    />
                </div>
            </div>
        );
    }

    if (type === 'transaction') {
        return (
            <div className="grid grid-cols-2 gap-4 rounded-lg border bg-muted/20 p-3">
                <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Type</Label>
                    <Select
                        value={data.transaction_type || ''}
                        onValueChange={(val) =>
                            updateData('transaction_type', val)
                        }
                    >
                        <SelectTrigger className="h-9 text-sm">
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
                <div className="space-y-1.5">
                    <Label htmlFor="amount">Amount</Label>
                    <CurrencyInput
                        id="amount"
                        placeholder="0.00"
                        value={data.amount || ''}
                        onChange={(val) => updateData('amount', val)}
                    />
                </div>
            </div>
        );
    }

    return null;
};
