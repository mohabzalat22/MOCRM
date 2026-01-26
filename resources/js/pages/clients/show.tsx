import { Head, useForm, router } from '@inertiajs/react';
import { Camera } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import type { Client } from '@/components/clients/Columns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useConfirmDialog } from '@/hooks/use-confirm-dialog';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
interface ClientPageProps {
    client: Client;
}

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

    const [image, setImage] = useState<string | null>(
        client?.image ? `http://localhost:8000/storage/${client?.image}` : null,
    );

    const inputRef = useRef<HTMLInputElement | null>(null);
    const { data, setData, post, processing } = useForm({
        _method: 'PUT',
        name: client.name,
        company_name: client.company_name,
        email: client.email,
        phone: client.phone,
        website: client.website,
        address: client.address,
        image: null as File | null,
    });

    const [deleting, setDeleting] = useState(false);

    const handleDelete = () => {
        confirm(
            () => {
                setDeleting(true);
                router.delete(`/clients/${client.id}`, {
                    onSuccess: () => {
                        toast.success('Client has been deleted.');
                    },
                    onError: (errors) => {
                        setDeleting(false);
                        if (errors && Object.keys(errors).length > 0) {
                            Object.values(errors).forEach((message) => {
                                if (typeof message === 'string') {
                                    toast.error(message);
                                }
                            });
                        } else {
                            toast.error(
                                'An error occurred while deleting the client.',
                            );
                        }
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        confirm(
            () => {
                post(`/clients/${client.id}`, {
                    forceFormData: true,
                    onSuccess: () => {
                        toast.success('Client has been updated.');
                    },
                    onError: (errors) => {
                        if (errors && Object.keys(errors).length > 0) {
                            Object.values(errors).forEach((message) => {
                                if (typeof message === 'string') {
                                    toast.error(message);
                                }
                            });
                        } else {
                            toast.error(
                                'An error occurred while updating the client.',
                            );
                        }
                    },
                });
            },
            {
                title: 'Confirm Update',
                message: 'Are you sure you want to update this client data?',
            },
        );
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('image', file);
            const reader = new FileReader();
            reader.onload = () => {
                setImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        setImage(null);
        setData('image', null);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Clients" />
            <div className="flex justify-center p-4">
                <form
                    onSubmit={handleSubmit}
                    encType="multipart/form-data"
                    className="w-full rounded-lg bg-white p-6 shadow dark:bg-zinc-900 dark:shadow-zinc-800"
                >
                    <div className="mb-6 flex flex-col items-center justify-center gap-2">
                        {image ? (
                            <div className="flex flex-col items-center gap-2">
                                <img
                                    src={image}
                                    alt="client image"
                                    className="h-40 w-40 cursor-pointer rounded-full border object-cover lg:h-60 lg:w-60 dark:border-zinc-700"
                                    onClick={() => inputRef.current?.click()}
                                />
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    onClick={handleRemoveImage}
                                >
                                    Remove Image
                                </Button>
                            </div>
                        ) : (
                            <div
                                className="flex h-40 w-40 cursor-pointer items-center justify-center rounded-full bg-gray-800 dark:bg-zinc-800"
                                onClick={() => inputRef.current?.click()}
                            >
                                <Camera className="h-10 w-10 text-white" />
                            </div>
                        )}
                        <input
                            type="file"
                            name="image"
                            accept="image/png, image/jpg, image/jpeg, image/webp"
                            onChange={handleFileChange}
                            ref={inputRef}
                            className="hidden"
                        />
                    </div>
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Client Name</Label>
                            <Input
                                id="name"
                                placeholder="name"
                                value={data.name}
                                onChange={(e) =>
                                    setData('name', e.target.value)
                                }
                                className="border bg-white text-black dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="company-name">Company Name</Label>
                            <Input
                                id="company-name"
                                placeholder="client's company name"
                                value={data.company_name}
                                onChange={(e) =>
                                    setData('company_name', e.target.value)
                                }
                                className="border bg-white text-black dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                placeholder="client email"
                                value={data.email}
                                onChange={(e) =>
                                    setData('email', e.target.value)
                                }
                                className="border bg-white text-black dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                                id="phone"
                                placeholder="client phone"
                                value={data.phone}
                                onChange={(e) =>
                                    setData('phone', e.target.value)
                                }
                                className="border bg-white text-black dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="website">Website</Label>
                            <Input
                                id="website"
                                placeholder="client website"
                                value={data.website}
                                onChange={(e) =>
                                    setData('website', e.target.value)
                                }
                                className="border bg-white text-black dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="address">Address</Label>
                            <Input
                                id="address"
                                placeholder="client address"
                                value={data.address}
                                onChange={(e) =>
                                    setData('address', e.target.value)
                                }
                                className="border bg-white text-black dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                            />
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end gap-2">
                        <Button variant="outline">Cancel</Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving...' : 'Save changes'}
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            disabled={deleting}
                            onClick={handleDelete}
                        >
                            {deleting ? 'Deleting...' : 'Delete'}
                        </Button>
                    </div>
                </form>
            </div>
            {/* confirmDialog */}
            <ConfirmDialog />
        </AppLayout>
    );
}
