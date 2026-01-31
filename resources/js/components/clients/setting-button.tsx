import { router } from '@inertiajs/react';
import { Settings } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useConfirmDialog } from '@/hooks/use-confirm-dialog';
import { useClientStore } from '@/stores/useClientStore';

export default function SettingButton() {
    const { 
        editMode, 
        deleting, 
        client, 
        setEditMode, 
        setDeleting 
    } = useClientStore();
    
    const { confirm, ConfirmDialog } = useConfirmDialog();

    const handleDelete = () => {
        if (!client) return;
        
        confirm(
            () => {
                setDeleting(true);
                router.delete(`/clients/${client.id}`, {
                    onSuccess: () => {
                        setEditMode(false);
                        toast.success('Client has been deleted.');
                    },
                    onError: () => {
                        setDeleting(false);
                        toast.error('Failed to delete client.');
                    },
                });
            },
            {
                title: 'Confirm Delete',
                message:
                    'Are you sure you want to delete this client? This action cannot be undone.',
            },
        );
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                        <Settings />
                        settings
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-40" align="center">
                    <DropdownMenuGroup>
                        <DropdownMenuLabel>Client Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                            onSelect={(e) => {
                                e.preventDefault();
                                setEditMode(!editMode);
                            }}
                            className={
                                editMode
                                    ? 'bg-zinc-100 font-bold dark:bg-zinc-800'
                                    : ''
                            }
                        >
                            {editMode ? 'Editing...' : 'Edit'}
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />

                    <DropdownMenuGroup>
                        <DropdownMenuItem
                            onSelect={(e) => {
                                e.preventDefault();
                                if (!deleting) handleDelete();
                            }}
                            disabled={deleting}
                            className="text-red-600 focus:bg-red-100 dark:focus:bg-red-900"
                        >
                            {deleting ? 'Deleting...' : 'Delete'}
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>
            <ConfirmDialog />
        </>
    );
}
