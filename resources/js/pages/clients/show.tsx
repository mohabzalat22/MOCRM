import { Head, useForm, router } from '@inertiajs/react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import ClientForm from '@/components/clients/client-form';
import ClientImageUpload from '@/components/clients/client-image';
import type { Client } from '@/components/clients/Columns';
import SettingButton from '@/components/clients/setting-button';
import { Button } from '@/components/ui/button';
import { useConfirmDialog } from '@/hooks/use-confirm-dialog';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface ClientPageProps {
    client: Client;
}

const STORAGE_BASE_URL = 'http://localhost:8000/storage/';

// Helper functions
const getImageUrl = (imagePath: string | null): string | null => {
    return imagePath ? `${STORAGE_BASE_URL}/${imagePath}` : null;
};

const buildFormData = (
    changedFields: Record<string, string | File>,
): FormData => {
    const formData = new FormData();
    Object.entries(changedFields).forEach(([key, value]) => {
        if (key === 'image') {
            formData.append('image', value === '' ? '' : (value as File));
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

export default function Show({ client }: ClientPageProps) {
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
        Record<string, string | File>
    >({});

    // FORM Setup
    const initialData = {
        name: client.name ?? '',
        company_name: client.company_name ?? '',
        email: client.email ?? '',
        phone: client.phone ?? '',
        website: client.website ?? '',
        address: client.address ?? '',
        image: null as File | null,
    };
    const { data, setData, processing } = useForm(initialData);

    // Helper to update data and track changes
    // TODO : refactor this handleFieldChange function
    const handleFieldChange = (
        key: keyof typeof initialData,
        value: string | File | null,
    ) => {
        setData(key, value);
        if (key === 'image') {
            if (value === null || value === '') {
                setChangedFields((prev) => ({ ...prev, image: '' }));
            } else {
                setChangedFields((prev) => ({ ...prev, image: value }));
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
        setData(initialData);
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (Object.keys(changedFields).length === 0) {
            toast.info('No changes to save.');
            return;
        }

        confirm(
            () => {
                const formData = buildFormData(changedFields);

                router.post(`/clients/${client.id}`, formData, {
                    onSuccess: () => {
                        setEditMode(false);
                        toast.success('Client has been updated.');
                    },
                    onError: showErrorToasts,
                });
            },
            {
                title: 'Confirm Update',
                message: 'Are you sure you want to update this client data?',
            },
        );
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
            <div className="flex justify-center p-4">
                <div className="w-full rounded-lg bg-white p-6 shadow dark:bg-zinc-900 dark:shadow-zinc-800">
                    <div className="mb-6 flex flex-col items-center justify-center gap-2">
                        <div className="flex w-full justify-end">
                            <SettingButton
                                onEdit={() => setEditMode(true)}
                                onDeleteConfirm={handleDelete}
                                editMode={editMode}
                                deleting={deleting}
                            />
                        </div>

                        <ClientImageUpload
                            image={image}
                            editMode={editMode}
                            inputRef={inputRef}
                            onImageChange={handleImageChange}
                            onRemoveImage={handleRemoveImage}
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
