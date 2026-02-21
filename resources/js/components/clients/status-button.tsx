import { Badge } from '@/components/ui/badge';
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

const statusColorMap: Record<string, string> = {
    [Status.ACTIVE]: 'bg-green-500',
    [Status.LEAD]: 'bg-yellow-500',
    [Status.AT_RISK]: 'bg-red-500',
    [Status.IN_ACTIVE]: 'bg-slate-500',
};

const StatusBadge = ({
    label,
    isInteractive = false,
    className,
}: {
    label: string;
    isInteractive?: boolean;
    className?: string;
}) => (
    <Badge
        variant="secondary"
        className={cn(
            'gap-1.5 border-none bg-muted px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase shadow-none transition-all',
            isInteractive && 'cursor-pointer hover:bg-muted/80',
            className,
        )}
    >
        <div
            className={cn(
                'h-1.5 w-1.5 rounded-full',
                statusColorMap[label] || 'bg-slate-400',
            )}
        />
        {label}
    </Badge>
);

export default function StatusButton({ className }: StatusButtonProps) {
    const { editMode, formData, updateFormData } = useClientStore();
    const status = formData.status;

    const handleSelect = (newStatus: string) => {
        updateFormData('status', newStatus);
    };

    if (!editMode) {
        return <StatusBadge label={status} className={className} />;
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <div className="inline-block">
                    <StatusBadge
                        label={status}
                        isInteractive
                        className={className}
                    />
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="min-w-32 rounded-xl">
                {Object.values(Status).map((e) => (
                    <DropdownMenuItem
                        key={e}
                        onClick={() => handleSelect(e)}
                        className="gap-2 text-xs font-semibold"
                    >
                        <div
                            className={cn(
                                'h-1.5 w-1.5 rounded-full',
                                statusColorMap[e],
                            )}
                        />
                        {e}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
