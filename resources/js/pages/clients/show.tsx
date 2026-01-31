import { Head, router } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';
import ClientForm from '@/components/clients/client-form';
import ClientImageUpload from '@/components/clients/client-image';
import type { Client } from '@/components/clients/Columns';
import type { CustomField } from '@/components/clients/custom-fields';
import SettingButton from '@/components/clients/setting-button';
import StatusButton from '@/components/clients/status-button';
import TagInput from '@/components/clients/tag-input';
import { Button } from '@/components/ui/button';
import { useConfirmDialog } from '@/hooks/use-confirm-dialog';
import AppLayout from '@/layouts/app-layout';
import { useClientStore } from '@/stores/useClientStore';
import type { Tag } from '@/types';
import type { BreadcrumbItem } from '@/types';

interface ClientPageProps {
    client: Client;
    allTags?: Tag[];
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

const showErrorToasts = (errors: Record<string, unknown>) => {
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

export default function Show({ client, allTags = [] }: ClientPageProps) {
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
        setTagChanges
    } = useClientStore();

    // Initialize store on mount or prop change
    useEffect(() => {
        initialize(client, allTags);
    }, [client, allTags, initialize]);

    const { confirm, ConfirmDialog } = useConfirmDialog();

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const hasTagChanges = tagChanges.tagsToAdd.length > 0 || tagChanges.tagsToRemove.length > 0;
        const hasFieldChanges = Object.keys(changedFields).length > 0;

        if (!hasFieldChanges && !hasTagChanges) {
            toast.info('No changes to save.');
            return;
        }

        // Separate custom field changes from other field changes
        const hasCustomFieldChanges = 'custom_fields' in changedFields;
        const customFieldsValue = changedFields.custom_fields as CustomField[] | undefined;
        
        // Check if custom fields have real changes
        const validCustomFields = Array.isArray(customFieldsValue) 
            ? customFieldsValue.filter(field => field && field.key && field.key.trim() !== '')
            : [];
        
        // We need initialData custom fields to check if we cleared them
        const initialCustomFields = client.custom_fields || [];

        const hasRealCustomFieldChanges = hasCustomFieldChanges && (
            (validCustomFields.length === 0 && initialCustomFields.length > 0) ||
            validCustomFields.length > 0
        );

        // Check if there are any real client data changes (excluding custom fields)
        const clientDataChanges = Object.entries(changedFields).filter(
            ([key]) => key !== 'custom_fields'
        );
        const hasRealClientChanges = clientDataChanges.length > 0;

        if (!hasRealClientChanges && !hasRealCustomFieldChanges && !hasTagChanges) {
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
                        handleTagSubmission(() => {
                            if (!hasErrors) toast.success('Client has been updated.');
                            finishSubmission();
                        }, () => {
                            hasErrors = true;
                            finishSubmission();
                        });
                    } else {
                        if (!hasErrors) toast.success('Client has been updated.');
                        finishSubmission();
                    }
                };

                const submitCustomFields = () => {
                    if (hasRealCustomFieldChanges) {
                        const customFieldsFormData = new FormData();
                        
                        if (Array.isArray(customFieldsValue)) {
                            // Filter valid fields again to be sure
                            const fieldsToSend = customFieldsValue.filter(
                                field => field && field.key && field.key.trim() !== ''
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
                                customFieldsFormData.append('custom_fields', '');
                            }
                        }

                        router.post(`/clients/${client.id}/custom-fields`, customFieldsFormData, {
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
                        });
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

    const handleTagSubmission = (onComplete: () => void, onError: () => void) => {
        // Queue operations to run sequentially
        const operations: Array<() => void> = [];

        // Add tag additions to queue
        tagChanges.tagsToAdd.forEach(tag => {
            operations.push(() => {
                router.post('/tags', {
                    name: tag.name,
                    color: tag.color,
                    taggable_id: client.id,
                    taggable_type: 'App\\Models\\Client',
                }, {
                    preserveScroll: true,
                    preserveState: true,
                    onSuccess: processNext,
                    onError: (err) => {
                        console.error('Tag add failed', err);
                        onError();
                        processNext();
                    }
                });
            });
        });

        // Add tag removals to queue
        tagChanges.tagsToRemove.forEach(tagId => {
            operations.push(() => {
                router.delete(`/client/${client.id}/tags/${tagId}`, {
                    preserveScroll: true,
                    preserveState: true,
                    onSuccess: processNext,
                    onError: (err) => {
                        console.error('Tag remove failed', err);
                        onError();
                        processNext();
                    }
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
            <div className="flex flex-col justify-center gap-4 p-4">
                <div className="w-full rounded-lg bg-white p-6 shadow dark:bg-zinc-900 dark:shadow-zinc-800">
                    <div className="mb-6 flex flex-col items-center justify-center gap-2">
                        <div className="flex w-full justify-between">
                            <div>
                                <p>
                                    Client since:
                                    <span className="ms-2 text-sm font-bold">
                                        {client?.created_at}
                                    </span>
                                </p>
                            </div>
                            <div className="flex">
                                <StatusButton className="mx-1" />
                                <SettingButton />
                            </div>
                        </div>

                        <ClientImageUpload />
                    </div>

                    {/* Tag Input for this client */}
                    <div className="mb-6">
                        <TagInput />
                    </div>

                    <form onSubmit={handleSubmit} encType="multipart/form-data">
                        <ClientForm />

                        {editMode && (
                            <div className="mt-6 flex justify-end gap-2">
                                <Button
                                    variant="outline"
                                    type="button"
                                    onClick={resetForm}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isSaving}>
                                    {isSaving ? 'Saving...' : 'Save changes'}
                                </Button>
                            </div>
                        )}
                    </form>
                </div>
            </div>
            <ConfirmDialog />
        </AppLayout>
    );
}
