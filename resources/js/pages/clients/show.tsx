import { Head, router } from '@inertiajs/react';
import { LayoutDashboard, History as HistoryIcon } from 'lucide-react';
import { useEffect } from 'react';
import { toast } from 'sonner';
import ActivityForm from '@/components/clients/activity-form';
import ActivityTimeline from '@/components/clients/activity-timeline';
import ClientForm from '@/components/clients/client-form';
import ClientImageUpload from '@/components/clients/client-image';
import CustomFieldsView from '@/components/clients/custom-fields-view';
import QuickActions from '@/components/clients/quick-actions';
import SettingButton from '@/components/clients/setting-button';
import StatusButton from '@/components/clients/status-button';
import TagInput from '@/components/clients/tag-input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useConfirmDialog } from '@/hooks/use-confirm-dialog';
import AppLayout from '@/layouts/app-layout';
import { useClientStore } from '@/stores/useClientStore';
import type {
    Client,
    CustomField,
    Activity,
    Tag,
    BreadcrumbItem,
} from '@/types';

interface ClientPageProps {
    client: Client;
    allTags?: Tag[];
    activities?: Activity[];
}

const buildFormData = (
    changedFields: Record<string, string | File | CustomField[] | null>,
    excludeCustomFields = false,
): FormData => {
    const formData = new FormData();

    Object.entries(changedFields).forEach(([key, value]) => {
        if (key === 'custom_fields' && excludeCustomFields) {
            // Skip custom fields when building client data form
            return;
        }

        if (key === 'image') {
            formData.append('image', value === '' ? '' : (value as File));
        } else if (key === 'custom_fields') {
            if (Array.isArray(value)) {
                value.forEach((field, idx) => {
                    if (field && typeof field === 'object') {
                        if ('key' in field) {
                            formData.append(
                                `custom_fields[${idx}][key]`,
                                field.key ?? '',
                            );
                        }
                        if ('value' in field) {
                            formData.append(
                                `custom_fields[${idx}][value]`,
                                field.value ?? '',
                            );
                        }
                    }
                });
                // If the array is empty, still send an empty array to backend
                if (value.length === 0) {
                    // This ensures Laravel gets an empty array, not a string
                    formData.append('custom_fields', '');
                }
            }
        } else {
            formData.append(key, value as string);
        }
    });

    formData.append('_method', 'PATCH');
    return formData;
};

const showErrorToasts = (errors: Record<string, string | string[]>) => {
    if (errors && Object.keys(errors).length > 0) {
        Object.values(errors).forEach((message) => {
            if (typeof message === 'string') {
                toast.error(message);
            }
        });
    } else {
        toast.error('An unexpected error occurred.');
    }
};

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
        changedFields,
        tagChanges,
        resetForm,
        setIsSaving,
        isSaving,
        setEditMode,
        setChangedFields,
        setTagChanges,
        activityDialogOpen,
        activityType,
        setActivityDialogOpen,
    } = useClientStore();

    // Initialize store on mount or prop change
    useEffect(() => {
        initialize(client, allTags);
    }, [client, allTags, initialize]);

    const { confirm, ConfirmDialog } = useConfirmDialog();

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const hasTagChanges =
            tagChanges.tagsToAdd.length > 0 ||
            tagChanges.tagsToRemove.length > 0;
        const hasFieldChanges = Object.keys(changedFields).length > 0;

        if (!hasFieldChanges && !hasTagChanges) {
            toast.info('No changes to save.');
            return;
        }

        // Separate custom field changes from other field changes
        const hasCustomFieldChanges = 'custom_fields' in changedFields;
        const customFieldsValue = changedFields.custom_fields as
            | CustomField[]
            | undefined;

        // Check if custom fields have real changes
        const validCustomFields = Array.isArray(customFieldsValue)
            ? customFieldsValue.filter(
                  (field) => field && field.key && field.key.trim() !== '',
              )
            : [];

        // We need initialData custom fields to check if we cleared them
        const initialCustomFields = client.custom_fields || [];

        const hasRealCustomFieldChanges =
            hasCustomFieldChanges &&
            ((validCustomFields.length === 0 &&
                initialCustomFields.length > 0) ||
                validCustomFields.length > 0);

        // Check if there are any real client data changes (excluding custom fields)
        const clientDataChanges = Object.entries(changedFields).filter(
            ([key]) => key !== 'custom_fields',
        );
        const hasRealClientChanges = clientDataChanges.length > 0;

        if (
            !hasRealClientChanges &&
            !hasRealCustomFieldChanges &&
            !hasTagChanges
        ) {
            toast.info('No changes to save.');
            return;
        }

        confirm(
            () => {
                let hasErrors = false;
                setIsSaving(true);

                // Define steps
                const submitTags = () => {
                    if (hasTagChanges) {
                        handleTagSubmission(
                            () => {
                                if (!hasErrors)
                                    toast.success('Client has been updated.');
                                finishSubmission();
                            },
                            () => {
                                hasErrors = true;
                                finishSubmission();
                            },
                        );
                    } else {
                        if (!hasErrors)
                            toast.success('Client has been updated.');
                        finishSubmission();
                    }
                };

                const submitCustomFields = () => {
                    if (hasRealCustomFieldChanges) {
                        const customFieldsFormData = new FormData();

                        if (Array.isArray(customFieldsValue)) {
                            // Filter valid fields again to be sure
                            const fieldsToSend = customFieldsValue.filter(
                                (field) =>
                                    field &&
                                    field.key &&
                                    field.key.trim() !== '',
                            );

                            fieldsToSend.forEach((field, idx) => {
                                customFieldsFormData.append(
                                    `custom_fields[${idx}][key]`,
                                    field.key,
                                );
                                customFieldsFormData.append(
                                    `custom_fields[${idx}][value]`,
                                    field.value ?? '',
                                );
                            });

                            if (fieldsToSend.length === 0) {
                                customFieldsFormData.append(
                                    'custom_fields',
                                    '',
                                );
                            }
                        }

                        router.post(
                            `/clients/${client.id}/custom-fields`,
                            customFieldsFormData,
                            {
                                preserveScroll: true,
                                preserveState: true,
                                onSuccess: () => {
                                    submitTags();
                                },
                                onError: (errors) => {
                                    hasErrors = true;
                                    showErrorToasts(errors);
                                    submitTags();
                                },
                            },
                        );
                    } else {
                        submitTags();
                    }
                };

                const finishSubmission = () => {
                    setIsSaving(false);
                    setEditMode(false);
                    setChangedFields({});
                    setTagChanges({ tagsToAdd: [], tagsToRemove: [] });
                };

                // Start with client data
                if (hasRealClientChanges) {
                    const formData = buildFormData(changedFields, true);

                    router.post(`/clients/${client.id}`, formData, {
                        preserveScroll: true,
                        preserveState: true,
                        onSuccess: () => {
                            submitCustomFields();
                        },
                        onError: (errors) => {
                            console.error('Client data failed', errors);
                            hasErrors = true;
                            showErrorToasts(errors);
                            submitCustomFields();
                        },
                    });
                } else {
                    submitCustomFields();
                }
            },
            {
                title: 'Confirm Update',
                message: 'Are you sure you want to update this client data?',
            },
        );
    };

    const handleTagSubmission = (
        onComplete: () => void,
        onError: () => void,
    ) => {
        // Queue operations to run sequentially
        const operations: Array<() => void> = [];

        // Add tag additions to queue
        tagChanges.tagsToAdd.forEach((tag) => {
            operations.push(() => {
                router.post(
                    '/tags',
                    {
                        name: tag.name,
                        color: tag.color,
                        taggable_id: client.id,
                        taggable_type: 'App\\Models\\Client',
                    },
                    {
                        preserveScroll: true,
                        preserveState: true,
                        onSuccess: processNext,
                        onError: (err) => {
                            console.error('Tag add failed', err);
                            onError();
                            processNext();
                        },
                    },
                );
            });
        });

        // Add tag removals to queue
        tagChanges.tagsToRemove.forEach((tagId) => {
            operations.push(() => {
                router.delete(`/client/${client.id}/tags/${tagId}`, {
                    preserveScroll: true,
                    preserveState: true,
                    onSuccess: processNext,
                    onError: (err) => {
                        console.error('Tag remove failed', err);
                        onError();
                        processNext();
                    },
                });
            });
        });

        let currentOpIndex = 0;

        const processNext = () => {
            if (currentOpIndex < operations.length) {
                const op = operations[currentOpIndex];
                currentOpIndex++;
                op();
            } else {
                onComplete();
            }
        };

        // Start processing
        processNext();
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Clients" />
            <div className="flex flex-col gap-6 p-4 md:p-8">
                {/* Enhanced Modern Header Section */}
                <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-card via-card to-muted/20 shadow-xl">
                    {/* Decorative background pattern */}
                    <div className="bg-grid-pattern absolute inset-0 opacity-[0.02]" />

                    <div className="relative flex flex-col items-center gap-8 p-8 md:flex-row md:items-start md:p-10">
                        {/* Profile Image Section */}
                        <div className="shrink-0">
                            <ClientImageUpload />
                        </div>

                        {/* Client Information */}
                        <div className="flex-1 space-y-6 text-center md:text-left">
                            {/* Name and Company */}
                            <div className="space-y-2">
                                <h1 className="text-4xl font-bold tracking-tight text-foreground lg:text-5xl">
                                    {client.name}
                                </h1>
                                {client.company_name && (
                                    <div className="flex items-center justify-center gap-2 md:justify-start">
                                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                        <p className="text-2xl font-semibold text-muted-foreground">
                                            {client.company_name}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Status and Member Info */}
                            <div className="flex flex-wrap items-center justify-center gap-4 md:justify-start">
                                <StatusButton />
                                <Separator
                                    orientation="vertical"
                                    className="hidden h-5 md:block"
                                />
                                <div className="flex items-center gap-2 text-base text-muted-foreground">
                                    <span className="font-medium">Joined</span>
                                    <span className="font-semibold text-foreground">
                                        {new Date(
                                            client.created_at,
                                        ).toLocaleDateString('en-US', {
                                            weekday: 'short',
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric',
                                        })}
                                    </span>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="pt-2">
                                <QuickActions client={client} />
                            </div>
                        </div>

                        {/* Settings Button */}
                        <div className="absolute top-6 right-6 md:relative md:top-0 md:right-0">
                            <SettingButton />
                        </div>
                    </div>
                </div>

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

                    <form onSubmit={handleSubmit} className="mt-6">
                        <TabsContent
                            value="overview"
                            className="mt-0 focus-visible:outline-none"
                        >
                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                                {/* Main Content - 2 spans */}
                                <div className="space-y-6 lg:col-span-2">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>
                                                Contact Information
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <ClientForm />
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader>
                                            <CardTitle>
                                                Additional Details
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <CustomFieldsView />
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Sidebar - 1 span */}
                                <div className="space-y-6">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Organization</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-6">
                                            <div className="space-y-2">
                                                <h3 className="text-sm font-medium text-muted-foreground">
                                                    Tags
                                                </h3>
                                                <TagInput />
                                            </div>

                                            <Separator />

                                            <div className="space-y-3">
                                                <h3 className="text-sm font-medium text-muted-foreground">
                                                    System Info
                                                </h3>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">
                                                        ID
                                                    </span>
                                                    <span className="font-mono">
                                                        #{client.id}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">
                                                        Updated
                                                    </span>
                                                    <span>
                                                        {new Date(
                                                            client.updated_at,
                                                        ).toLocaleDateString(
                                                            'en-US',
                                                            {
                                                                weekday:
                                                                    'short',
                                                                month: 'short',
                                                                day: 'numeric',
                                                                year: 'numeric',
                                                            },
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent
                            value="activity"
                            className="mt-0 focus-visible:outline-none"
                        >
                            <div className="mx-auto max-w-3xl">
                                <ActivityTimeline activities={activities} />
                            </div>
                        </TabsContent>

                        {editMode && (
                            <div className="fixed right-0 bottom-6 left-0 z-50 flex justify-center px-4">
                                <div className="flex w-full max-w-2xl items-center justify-between gap-4 rounded-lg border bg-background p-4 shadow-lg">
                                    <Button
                                        variant="outline"
                                        type="button"
                                        onClick={resetForm}
                                        disabled={isSaving}
                                    >
                                        Cancel
                                    </Button>
                                    <div className="flex items-center gap-3">
                                        {isSaving && (
                                            <span className="text-sm text-muted-foreground">
                                                Saving...
                                            </span>
                                        )}
                                        <Button
                                            type="submit"
                                            disabled={isSaving}
                                        >
                                            Save Changes
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </form>
                </Tabs>
            </div>
            <ConfirmDialog />

            <Dialog
                open={activityDialogOpen}
                onOpenChange={setActivityDialogOpen}
            >
                <DialogContent className="sm:max-w-[600px]">
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
