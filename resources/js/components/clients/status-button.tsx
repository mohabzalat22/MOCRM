import { Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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

export default function StatusButton({
    className,
}: StatusButtonProps) {
    const { editMode, formData, updateFormData } = useClientStore();
    const status = formData.status;

    // Map status to button color class
    const getStatusBtnClass = (s: string) => {
        switch (s) {
            case Status.ACTIVE:
                return 'status-btn-active';
            case Status.LEAD:
                return 'status-btn-lead';
            case Status.AT_RISK:
                return 'status-btn-at-risk';
            case Status.IN_ACTIVE:
                return 'status-btn-in-active';
            default:
                return '';
        }
    };

    const handleSelect = (newStatus: string) => {
        updateFormData('status', newStatus);
    };

    if (!editMode) {
        return (
            <Button
                variant="outline"
                disabled
                className={
                    className
                        ? `${getStatusBtnClass(status)} ${className}`
                        : getStatusBtnClass(status)
                }
            >
                <Activity />
                {status}
            </Button>
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    className={
                        className
                            ? `${getStatusBtnClass(status)} ${className}`
                            : getStatusBtnClass(status)
                    }
                >
                    <Activity />
                    {status}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-40" align="center">
                <DropdownMenuGroup>
                    {Object.values(Status).map((e) => (
                        <DropdownMenuItem
                            onClick={() => handleSelect(e)}
                            key={e}
                        >
                            <span
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                }}
                            >
                                <span
                                    className={getStatusBtnClass(e)}
                                    style={{
                                        display: 'inline-block',
                                        width: '12px',
                                        height: '12px',
                                        borderRadius: '50%',
                                        marginRight: '0.5rem',
                                    }}
                                />
                                {e}
                            </span>
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
