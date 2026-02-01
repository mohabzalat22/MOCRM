import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useClientStore } from '@/stores/useClientStore';

enum Status {
    ACTIVE = 'Active',
    LEAD = 'Lead',
    AT_RISK = 'At Risk',
    IN_ACTIVE = 'In Active',
}

interface StatusButtonProps {
    className?: string;
}

export default function StatusButton({ className }: StatusButtonProps) {
    const { editMode, formData, updateFormData } = useClientStore();
    const status = formData.status;

    const handleSelect = (newStatus: string) => {
        updateFormData('status', newStatus);
    };

    if (!editMode) {
        return (
            <div
                className={cn(
                    'flex items-center gap-2 rounded-full border bg-muted/50 px-3 py-1 text-xs font-medium',
                    className,
                )}
            >
                <div
                    className={cn(
                        'h-2 w-2 rounded-full',
                        status === Status.ACTIVE && 'bg-green-500',
                        status === Status.LEAD && 'bg-yellow-500',
                        status === Status.AT_RISK && 'bg-red-500',
                        status === Status.IN_ACTIVE && 'bg-slate-500',
                    )}
                />
                {status}
            </div>
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className={cn('h-8 gap-2 rounded-full', className)}
                >
                    <div
                        className={cn(
                            'h-2 w-2 rounded-full',
                            status === Status.ACTIVE && 'bg-green-500',
                            status === Status.LEAD && 'bg-yellow-500',
                            status === Status.AT_RISK && 'bg-red-500',
                            status === Status.IN_ACTIVE && 'bg-slate-500',
                        )}
                    />
                    {status}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
                {Object.values(Status).map((e) => (
                    <DropdownMenuItem
                        key={e}
                        onClick={() => handleSelect(e)}
                        className="gap-2"
                    >
                        <div
                            className={cn(
                                'h-2 w-2 rounded-full',
                                e === Status.ACTIVE && 'bg-green-500',
                                e === Status.LEAD && 'bg-yellow-500',
                                e === Status.AT_RISK && 'bg-red-500',
                                e === Status.IN_ACTIVE && 'bg-slate-500',
                            )}
                        />
                        {e}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
