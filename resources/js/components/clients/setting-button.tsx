import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface SettingButtonProps {
    onEdit?: () => void;
    onDeleteConfirm?: () => void;
    editMode?: boolean;
    deleting?: boolean;
}

export default function SettingButton({
    onEdit,
    onDeleteConfirm,
    editMode,
    deleting,
}: SettingButtonProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline">
                    <Settings></Settings>
                    settings
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-40" align="center">
                <DropdownMenuGroup>
                    <DropdownMenuLabel>Client Actions</DropdownMenuLabel>
                    <DropdownMenuItem
                        onSelect={(e) => {
                            e.preventDefault();
                            if (onEdit) onEdit();
                        }}
                        className={
                            editMode
                                ? 'bg-zinc-100 font-bold dark:bg-zinc-800'
                                : ''
                        }
                    >
                        {editMode ? 'Editing...' : 'Edit'}
                        <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />

                <DropdownMenuGroup>
                    <DropdownMenuItem
                        onSelect={(e) => {
                            e.preventDefault();
                            if (!deleting && onDeleteConfirm) onDeleteConfirm();
                        }}
                        disabled={deleting}
                        className="text-red-600 focus:bg-red-100 dark:focus:bg-red-900"
                    >
                        {deleting ? 'Deleting...' : 'Delete'}
                        <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
