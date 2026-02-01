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
        <div className="flex flex-wrap items-center gap-3">
            {client.phone && (
                <Button
                    variant="outline"
                    size="sm"
                    className="h-10 gap-2 rounded-full transition-all duration-200 hover:border-green-300 hover:bg-green-50 hover:text-green-700 dark:hover:border-green-800 dark:hover:bg-green-950/30 dark:hover:text-green-400"
                    onClick={() => {
                        window.location.href = `tel:${client.phone}`;
                    }}
                >
                    <Phone className="h-4 w-4" />
                    <span className="font-medium">Call</span>
                </Button>
            )}

            <Button
                variant="outline"
                size="sm"
                className="h-10 gap-2 rounded-full transition-all duration-200 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 dark:hover:border-blue-800 dark:hover:bg-blue-950/30 dark:hover:text-blue-400"
                onClick={() => {
                    window.location.href = `mailto:${client.email}`;
                }}
            >
                <Mail className="h-4 w-4" />
                <span className="font-medium">Email</span>
            </Button>

            <Button
                variant="outline"
                size="sm"
                className="h-10 gap-2 rounded-full transition-all duration-200 hover:border-purple-300 hover:bg-purple-50 hover:text-purple-700 dark:hover:border-purple-800 dark:hover:bg-purple-950/30 dark:hover:text-purple-400"
                onClick={() => openActivity('note')}
            >
                <Plus className="h-4 w-4" />
                <span className="font-medium">Add Activity</span>
            </Button>

            <Button
                variant="outline"
                size="sm"
                className="h-10 gap-2 rounded-full transition-all duration-200 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700 dark:hover:border-orange-800 dark:hover:bg-orange-950/30 dark:hover:text-orange-400"
                onClick={() => openActivity('meeting')}
            >
                <Calendar className="h-4 w-4" />
                <span className="font-medium">Schedule Meeting</span>
            </Button>
        </div>
    );
}
