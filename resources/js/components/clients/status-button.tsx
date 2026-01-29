import { Activity } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

enum Status {
    ACTIVE = 'Active',
    LEAD = 'Lead',
    AT_RISK = 'At Risk',
    IN_ACTIVE = 'In Active',
}

interface StatusButtonProps {
    initialStatus: string;
    onSelect: (value: string) => void;
    editMode: boolean;
    className?: string;
}

export default function StatusButton({
    initialStatus,
    onSelect,
    editMode,
    className,
}: StatusButtonProps) {
    const [status, setStatus] = useState(initialStatus);

    useEffect(() => {
        setStatus(initialStatus);
    }, [initialStatus]);

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
                            onClick={() => {
                                setStatus(e);
                                onSelect(e);
                            }}
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
