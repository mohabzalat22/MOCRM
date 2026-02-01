import { Phone, Mail, Plus, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useClientStore } from '@/stores/useClientStore';
import type { Client, ActivityType } from '@/types';

interface QuickActionsProps {
    client: Client;
}

export default function QuickActions({ client }: QuickActionsProps) {
    const { setActivityDialogOpen, setActivityType } = useClientStore();

    const openActivity = (type: ActivityType) => {
        setActivityType(type);
        setActivityDialogOpen(true);
    };

    return (
        <div className="flex flex-wrap items-center gap-2">
            {client.phone && (
                <Button
                    variant="outline"
                    size="sm"
                    className="h-9 gap-2 rounded-full border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
                    onClick={() => {
                        window.location.href = `tel:${client.phone}`;
                    }}
                >
                    <Phone className="h-4 w-4" />
                    <span>Call</span>
                </Button>
            )}

            <Button
                variant="outline"
                size="sm"
                className="h-9 gap-2 rounded-full border-green-200 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 dark:border-green-900 dark:bg-green-950/30 dark:text-green-400 dark:hover:bg-green-900/50"
                onClick={() => {
                    window.location.href = `mailto:${client.email}`;
                }}
            >
                <Mail className="h-4 w-4" />
                <span>Email</span>
            </Button>

            <Button
                variant="outline"
                size="sm"
                className="h-9 gap-2 rounded-full border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 hover:text-purple-800 dark:border-purple-900 dark:bg-purple-950/30 dark:text-purple-400 dark:hover:bg-purple-900/50"
                onClick={() => openActivity('note')}
            >
                <Plus className="h-4 w-4" />
                <span>Add activity</span>
            </Button>

            <Button
                variant="outline"
                size="sm"
                className="h-9 gap-2 rounded-full border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100 hover:text-orange-800 dark:border-orange-900 dark:bg-orange-950/30 dark:text-orange-400 dark:hover:bg-orange-900/50"
                onClick={() => openActivity('meeting')}
            >
                <Calendar className="h-4 w-4" />
                <span>Schedule meeting</span>
            </Button>
        </div>
    );
}
