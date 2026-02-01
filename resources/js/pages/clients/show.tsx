import { Head } from '@inertiajs/react';
import { LayoutDashboard, History as HistoryIcon } from 'lucide-react';
import { useEffect } from 'react';
import ActivityForm from '@/components/clients/activity-form';
import ClientActivityTab from '@/components/clients/client-activity-tab';
import ClientHeader from '@/components/clients/client-header';
import ClientOverviewTab from '@/components/clients/client-overview-tab';
import SaveButtonFooter from '@/components/clients/save-button-footer';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useConfirmDialog } from '@/hooks/use-confirm-dialog';
import { useClientSubmit } from '@/hooks/useClientSubmit';
import AppLayout from '@/layouts/app-layout';
import { useClientStore } from '@/stores/useClientStore';
import type { Client, Activity, Tag, BreadcrumbItem } from '@/types';

interface ClientPageProps {
    client: Client;
    allTags?: Tag[];
    activities?: Activity[];
}

export default function Show({
    client,
    allTags = [],
    activities = [],
}: ClientPageProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Clients',
            href: '/clients',
        },
        {
            title: client.name,
            href: `/clients/${client.id}`,
        },
    ];

    // Use Store
    const {
        initialize,
        editMode,
        resetForm,
        isSaving,
        activityDialogOpen,
        activityType,
        setActivityDialogOpen,
    } = useClientStore();

    // Use submission hook
    const { submitClient } = useClientSubmit();

    // Initialize store on mount or prop change
    useEffect(() => {
        initialize(client, allTags);
    }, [client, allTags, initialize]);

    const { confirm, ConfirmDialog } = useConfirmDialog();

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        confirm(
            () => {
                submitClient();
            },
            {
                title: 'Confirm Update',
                message: 'Are you sure you want to update this client data?',
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Clients" />
            <div className="flex flex-col gap-6 p-4 md:p-8">
                {/* Enhanced Modern Header Section */}
                <ClientHeader client={client} />

                <Tabs defaultValue="overview" className="w-full space-y-8">
                    <div className="flex items-center justify-center">
                        <TabsList className="h-12 gap-2 rounded-2xl border border-border/40 bg-muted/50 p-1.5 shadow-inner">
                            <TabsTrigger
                                value="overview"
                                className="flex items-center gap-2 rounded-xl px-6 py-2 text-sm font-bold transition-all duration-300 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-md"
                            >
                                <LayoutDashboard className="h-4 w-4" />
                                Overview
                            </TabsTrigger>
                            <TabsTrigger
                                value="activity"
                                className="flex items-center gap-2 rounded-xl px-6 py-2 text-sm font-bold transition-all duration-300 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-md"
                            >
                                <HistoryIcon className="h-4 w-4" />
                                Activity History
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <form onSubmit={onSubmit} className="mt-6">
                        <TabsContent
                            value="overview"
                            className="mt-0 focus-visible:outline-none"
                        >
                            <ClientOverviewTab client={client} />
                        </TabsContent>

                        <TabsContent
                            value="activity"
                            className="mt-0 focus-visible:outline-none"
                        >
                            <ClientActivityTab activities={activities} />
                        </TabsContent>

                        {editMode && (
                            <SaveButtonFooter
                                isSaving={isSaving}
                                onCancel={resetForm}
                            />
                        )}
                    </form>
                </Tabs>
            </div>
            <ConfirmDialog />

            <Dialog
                open={activityDialogOpen}
                onOpenChange={setActivityDialogOpen}
            >
                <DialogContent className="sm:max-w-150">
                    <DialogHeader>
                        <DialogTitle>
                            {activityType === 'meeting'
                                ? 'Schedule Meeting'
                                : 'Add Activity'}
                        </DialogTitle>
                    </DialogHeader>
                    <ActivityForm
                        clientId={client.id}
                        initialType={activityType}
                        onSuccess={() => setActivityDialogOpen(false)}
                    />
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
