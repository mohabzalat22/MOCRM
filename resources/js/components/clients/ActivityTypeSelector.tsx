import { Phone, Mail, Users, FileText, CreditCard, Zap } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ActivityType } from '@/types';

interface ActivityTypeSelectorProps {
    currentType: ActivityType;
    onTypeChange: (type: ActivityType) => void;
    quickMode: boolean;
    onQuickModeToggle: () => void;
}

export const ActivityTypeSelector: React.FC<ActivityTypeSelectorProps> = ({
    currentType,
    onTypeChange,
    quickMode,
    onQuickModeToggle,
}) => {
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
        <div className="flex items-center justify-between border-b bg-muted/30 p-4">
            <div className="flex flex-wrap gap-1">
                {activityTypes.map((t) => (
                    <Button
                        key={t.type}
                        type="button"
                        variant={currentType === t.type ? 'default' : 'ghost'}
                        size="sm"
                        className={cn(
                            'h-8 gap-2 px-3 text-xs',
                            currentType === t.type &&
                                'bg-primary text-primary-foreground shadow-sm',
                        )}
                        onClick={() => onTypeChange(t.type)}
                    >
                        <t.icon className="h-3.5 w-3.5" />
                        {t.label}
                    </Button>
                ))}
            </div>

            <Button
                type="button"
                variant="outline"
                size="sm"
                className={cn(
                    'h-8 gap-2 text-[11px] font-medium transition-colors',
                    quickMode &&
                        'border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100 hover:text-amber-700 dark:border-amber-900 dark:bg-amber-950/20 dark:text-amber-400',
                )}
                onClick={onQuickModeToggle}
            >
                <Zap
                    className={cn(
                        'h-3.5 w-3.5',
                        quickMode && 'animate-pulse fill-current',
                    )}
                />
                {quickMode ? 'Quick Mode Active' : 'Switch to Quick Log'}
            </Button>
        </div>
    );
};
