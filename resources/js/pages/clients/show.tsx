import { Head, useForm, router } from '@inertiajs/react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import ClientForm from '@/components/clients/client-form';
import ClientImageUpload from '@/components/clients/client-image';
import type { Client } from '@/components/clients/Columns';
import type { CustomField } from '@/components/clients/custom-fields';
import SettingButton from '@/components/clients/setting-button';
import StatusButton from '@/components/clients/status-button';
import TagInput, { type TagChange } from '@/components/clients/tag-input';
import { Button } from '@/components/ui/button';
import { useConfirmDialog } from '@/hooks/use-confirm-dialog';
import AppLayout from '@/layouts/app-layout';
import type { Tag } from '@/types';
import type { BreadcrumbItem } from '@/types';

interface ClientPageProps {
    client: Client;
    allTags?: Tag[];
}

const STORAGE_BASE_URL = 'http://localhost:8000/storage/';

// Helper functions
const getImageUrl = (imagePath: string | null): string | null => {
    return imagePath ? `${STORAGE_BASE_URL}/${imagePath}` : null;
};

const customFieldsChanged = (
    current: CustomField[],
    initial: CustomField[],
): boolean => {
    if (current.length !== initial.length) return true;

    return current.some((field, idx) => {
        const initialField = initial[idx];
        if (!initialField) return true;
        return (
            field.key !== initialField.key || field.value !== initialField.value
        );
    });
};

const buildFormData = (
    changedFields: Record<string, string | File | CustomField[] | null>,
): FormData => {
    const formData = new FormData();

    Object.entries(changedFields).forEach(([key, value]) => {
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
    const { confirm, ConfirmDialog } = useConfirmDialog();

    const inputRef = useRef<HTMLInputElement>(null);

    // state
    const [image, setImage] = useState<string | null>(
        getImageUrl(client?.image ?? null),
    );
    const [deleting, setDeleting] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [changedFields, setChangedFields] = useState<
        Record<string, string | File | CustomField[] | null>
    >({});
    const [tagChanges, setTagChanges] = useState<TagChange>({
        tagsToAdd: [],
        tagsToRemove: [],
    });

    // FORM Setup
    const initialData = {
        name: client.name ?? '',
        company_name: client.company_name ?? '',
        email: client.email ?? '',
        phone: client.phone ?? '',
        website: client.website ?? '',
        address: client.address ?? '',
        image: null as File | null,
        custom_fields: (client.custom_fields || []) as CustomField[],
        status: client.status ?? '',
    };
    const { data, setData, processing } = useForm(initialData);

    // Helper to update data and track changes
    const handleFieldChange = (
        key: keyof typeof initialData,
        value: string | File | CustomField[] | null,
    ) => {
        setData(key, value as never);

        if (key === 'image') {
            if (value === null || value === '') {
                setChangedFields((prev) => ({ ...prev, image: '' }));
            } else {
                setChangedFields((prev) => ({ ...prev, image: value as File }));
            }
        } else if (key === 'custom_fields') {
            // Filter out completely empty custom fields
            const fieldsArray = (value as CustomField[]) || [];
            const nonEmptyFields = fieldsArray.filter(
                (field) =>
                    (field.key && field.key.trim() !== '') ||
                    (field.value && field.value.trim() !== ''),
            );

            // Only mark as changed if non-empty fields differ from initial
            const hasChanges = customFieldsChanged(
                nonEmptyFields,
                initialData.custom_fields,
            );

            if (hasChanges && nonEmptyFields.length > 0) {
                // Has actual changes with content
                setChangedFields((prev) => ({
                    ...prev,
                    custom_fields: fieldsArray, // Keep all fields including empty ones for the form
                }));
            } else if (
                nonEmptyFields.length === 0 &&
                initialData.custom_fields.length > 0
            ) {
                // All fields deleted (went from having fields to empty)
                setChangedFields((prev) => ({
                    ...prev,
                    custom_fields: [],
                }));
            } else {
                // No meaningful changes
                setChangedFields((prev) => {
                    const updated = { ...prev };
                    delete updated.custom_fields;
                    return updated;
                });
            }
        } else if (value !== initialData[key]) {
            setChangedFields((prev) => ({
                ...prev,
                [key]: value as string,
            }));
        } else {
            setChangedFields((prev) => {
                const updated = { ...prev };
                delete updated[key];
                return updated;
            });
        }
    };

    const resetForm = () => {
        setEditMode(false);
        setChangedFields({});
        setTagChanges({ tagsToAdd: [], tagsToRemove: [] });
        setData(initialData);
        setImage(getImageUrl(client?.image ?? null));
        if (inputRef.current) {
            inputRef.current.value = '';
        }
    };

    const handleImageChange = (file: File) => {
        handleFieldChange('image', file);
        const reader = new FileReader();
        reader.onload = () => setImage(reader.result as string);
        reader.readAsDataURL(file);
    };

    const handleRemoveImage = () => {
        setImage(null);
        setData('image', null);
        handleFieldChange('image', '');
        if (inputRef.current) {
            inputRef.current.value = '';
        }
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const hasTagChanges = tagChanges.tagsToAdd.length > 0 || tagChanges.tagsToRemove.length > 0;
        const hasFieldChanges = Object.keys(changedFields).length > 0;

        if (!hasFieldChanges && !hasTagChanges) {
            toast.info('No changes to save.');
            return;
        }

        // Check if there are any real field changes
        const hasRealChanges = Object.entries(changedFields).some(
            ([key, value]) => {
                if (key === 'custom_fields' && Array.isArray(value)) {
                    // Empty array is a valid change if we had fields before (deletion case)
                    if (
                        value.length === 0 &&
                        initialData.custom_fields.length > 0
                    ) {
                        return true;
                    }
                    // Check if custom fields have actual content
                    return value.some(
                        (field) =>
                            (field.key && field.key.trim() !== '') ||
                            (field.value && field.value.trim() !== ''),
                    );
                }
                return true; // Other fields are considered real changes
            },
        );

        if (!hasRealChanges && !hasTagChanges) {
            toast.info('No changes to save.');
            return;
        }

        confirm(
            () => {
                // If we have field changes, submit them first
                if (hasRealChanges) {
                    const formData = buildFormData(changedFields);

                    router.post(`/clients/${client.id}`, formData, {
                        onSuccess: () => {
                            // After successfully updating client fields, handle tag changes
                            if (hasTagChanges) {
                                handleTagSubmission();
                            } else {
                                setEditMode(false);
                                setChangedFields({});
                                setTagChanges({ tagsToAdd: [], tagsToRemove: [] });
                                toast.success('Client has been updated.');
                            }
                        },
                        onError: showErrorToasts,
                    });
                } else if (hasTagChanges) {
                    // Only tag changes, submit them directly
                    handleTagSubmission();
                }
            },
            {
                title: 'Confirm Update',
                message: 'Are you sure you want to update this client data?',
            },
        );
    };

    const handleTagSubmission = () => {
        let completedOperations = 0;
        const totalOperations = tagChanges.tagsToAdd.length + tagChanges.tagsToRemove.length;

        const checkCompletion = () => {
            completedOperations++;
            if (completedOperations === totalOperations) {
                setEditMode(false);
                setChangedFields({});
                setTagChanges({ tagsToAdd: [], tagsToRemove: [] });
                toast.success('Client has been updated.');
            }
        };

        // Add new tags
        tagChanges.tagsToAdd.forEach((tag) => {
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
                    onSuccess: checkCompletion,
                    onError: (errors) => {
                        console.error('Error adding tag:', errors);
                        checkCompletion();
                    },
                },
            );
        });

        // Remove tags
        tagChanges.tagsToRemove.forEach((tagId) => {
            router.delete(`/client/${client.id}/tags/${tagId}`, {
                preserveScroll: true,
                preserveState: true,
                onSuccess: checkCompletion,
                onError: (errors) => {
                    console.error('Error removing tag:', errors);
                    checkCompletion();
                },
            });
        });
    };

    const handleDelete = () => {
        confirm(
            () => {
                setDeleting(true);
                router.delete(`/clients/${client.id}`, {
                    onSuccess: () => {
                        setEditMode(false);
                        toast.success('Client has been deleted.');
                    },
                    onError: (errors) => {
                        setDeleting(false);
                        showErrorToasts(errors);
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
                                <StatusButton
                                    className="mx-1"
                                    editMode={editMode}
                                    initialStatus={client.status}
                                    onSelect={(status) => {
                                        setData('status', status);
                                        setChangedFields((prev) => ({
                                            ...prev,
                                            status,
                                        }));
                                    }}
                                />
                                <SettingButton
                                    onToggleEdit={() =>
                                        setEditMode((prev) => !prev)
                                    }
                                    onDeleteConfirm={handleDelete}
                                    editMode={editMode}
                                    deleting={deleting}
                                />
                            </div>
                        </div>

                        <ClientImageUpload
                            image={image}
                            editMode={editMode}
                            inputRef={inputRef}
                            onImageChange={handleImageChange}
                            onRemoveImage={handleRemoveImage}
                        />
                    </div>

                    {/* Tag Input for this client */}
                    <div className="mb-6">
                        <TagInput
                            taggableId={Number(client.id)}
                            taggableType="client"
                            existingTags={client.tags || []}
                            allTags={allTags}
                            editMode={editMode}
                            onChange={setTagChanges}
                        />
                    </div>

                    <form onSubmit={handleSubmit} encType="multipart/form-data">
                        <ClientForm
                            data={data}
                            editMode={editMode}
                            onFieldChange={handleFieldChange}
                            onReset={resetForm}
                        />

                        {editMode && (
                            <div className="mt-6 flex justify-end gap-2">
                                <Button
                                    variant="outline"
                                    type="button"
                                    onClick={resetForm}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Saving...' : 'Save changes'}
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
