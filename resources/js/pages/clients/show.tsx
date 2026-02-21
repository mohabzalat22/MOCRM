import { Head } from '@inertiajs/react';
import { History as HistoryIcon, Book } from 'lucide-react';
import { useEffect } from 'react';
import ActivityForm from '@/components/clients/activity-form';
import ClientActivityTab from '@/components/clients/client-activity-tab';
import ClientHeader from '@/components/clients/client-header';
import ClientOverviewTab from '@/components/clients/client-overview-tab';
import ClientProjectsTab from '@/components/clients/client-projects-tab';
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
import type { Client, Activity, Tag, BreadcrumbItem, Project } from '@/types';

interface ClientPageProps {
    client: Client;
    allTags?: Tag[];
    activities?: Activity[];
    projects?: Project[];
}

export default function Show({
    client,
    allTags = [],
    activities = [],
    projects = [],
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
                title: 'Save Client Details?',
                message:
                    'Are you sure you want to save these changes to the client profile?',
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Client: ${client.name}`} />
            <div className="mx-auto w-full max-w-(--breakpoint-2xl) p-4 md:p-6 lg:p-8">
                <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
                    {/* Left Sidebar - Client Info */}
                    <aside className="space-y-6">
                        <ClientHeader client={client} />

                        <div className="space-y-6">
                            <ClientOverviewTab client={client} />
                        </div>
                    </aside>

                    {/* Right Main Content - Activities & Projects */}
                    <main>
                        <Tabs
                            defaultValue="activity"
                            className="w-full space-y-6"
                        >
                            <div className="flex items-center justify-between overflow-x-auto rounded-xl border bg-card p-1 shadow-sm">
                                <TabsList className="h-10 bg-transparent p-0">
                                    <TabsTrigger
                                        value="activity"
                                        className="gap-2 px-4 py-2 transition-all data-[state=active]:bg-muted data-[state=active]:shadow-none"
                                    >
                                        <HistoryIcon className="h-4 w-4" />
                                        Activity History
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="projects"
                                        className="gap-2 px-4 py-2 transition-all data-[state=active]:bg-muted data-[state=active]:shadow-none"
                                    >
                                        <Book className="h-4 w-4" />
                                        Projects
                                    </TabsTrigger>
                                </TabsList>
                            </div>

                            <form onSubmit={onSubmit} className="mt-0">
                                <TabsContent
                                    value="activity"
                                    className="mt-0 focus-visible:outline-none"
                                >
                                    <ClientActivityTab
                                        activities={activities}
                                        client={client}
                                    />
                                </TabsContent>

                                <TabsContent
                                    value="projects"
                                    className="mt-0 focus-visible:outline-none"
                                >
                                    <ClientProjectsTab
                                        projects={projects}
                                        client={client}
                                    />
                                </TabsContent>

                                {editMode && (
                                    <SaveButtonFooter
                                        isSaving={isSaving}
                                        onCancel={resetForm}
                                    />
                                )}
                            </form>
                        </Tabs>
                    </main>
                </div>
            </div>
            <ConfirmDialog />

            <Dialog
                open={activityDialogOpen}
                onOpenChange={setActivityDialogOpen}
            >
                <DialogContent className="hide-scrollbar overflow-y-auto sm:max-h-[90vh]">
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
                        enableImmediateSave={true}
                    />
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
