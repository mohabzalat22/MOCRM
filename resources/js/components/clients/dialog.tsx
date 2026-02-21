import { useForm } from '@inertiajs/react';
import { Camera } from 'lucide-react';
import type { ChangeEvent } from 'react';
import React, { useRef, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { CurrencyInput } from '@/components/ui/currency-input';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function ClientDialog({ trigger }: { trigger?: React.ReactNode } = {}) {
    const [image, setImage] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [isDialogOpen, setDialogOpen] = useState(false);
    const { data, setData, post, processing, reset } = useForm({
        name: '',
        company_name: '',
        email: '',
        phone: '',
        website: '',
        address: '',
        image: null as File | null,
        monthly_value: 0,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        post('/clients', {
            forceFormData: true,
            onSuccess: () => {
                toast.success('Client has been created.');
                reset();
                setImage(null);
                setDialogOpen(false);
            },
            onError: (errors) => {
                if (errors && Object.keys(errors).length > 0) {
                    Object.values(errors).forEach((message) => {
                        if (typeof message === 'string') {
                            toast.error(message);
                        }
                    });
                } else {
                    toast.error('An error occurred while creating the client.');
                }
            },
        });
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
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

    return (
        <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button onClick={() => setDialogOpen(true)}>
                        Add New Client
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent>
                <form
                    onSubmit={handleSubmit}
                    action="/clients"
                    method="post"
                    encType="multipart/form-data"
                >
                    <DialogHeader>
                        <DialogTitle>Add New Client</DialogTitle>
                        <DialogDescription>
                            Make changes to your client profile here. Click save
                            when you&apos;re done.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="no-scrollbar -mx-4 grid max-h-[50vh] gap-4 overflow-y-auto px-4 py-4">
                        <div className="mt-4 flex justify-center gap-4">
                            {/* memo */}
                            {image ? (
                                <div className="flex justify-center">
                                    <img
                                        src={image}
                                        alt="client image"
                                        className="h-60 w-60 cursor-pointer rounded-2xl object-cover"
                                        onClick={() =>
                                            inputRef.current?.click()
                                        }
                                    />
                                </div>
                            ) : (
                                <div
                                    className="flex h-30 w-30 items-center justify-center rounded-2xl bg-gray-800 lg:h-50 lg:w-50"
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
                        <div className="grid gap-3">
                            <Label htmlFor="name">
                                Client Name
                                <span className="m-1 text-red-500">*</span>
                            </Label>
                            <Input
                                id="name"
                                placeholder="name"
                                name={data.name}
                                onChange={(e) =>
                                    setData('name', e.target.value)
                                }
                            />
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="name-1">Company Name</Label>
                            <Input
                                id="company-name"
                                placeholder="client's company name"
                                name={data.company_name}
                                onChange={(e) =>
                                    setData('company_name', e.target.value)
                                }
                            />
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="name-1">
                                Email
                                <span className="m-1 text-red-500">*</span>
                            </Label>
                            <Input
                                id="email"
                                placeholder="client email"
                                name={data.email}
                                onChange={(e) =>
                                    setData('email', e.target.value)
                                }
                            />
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="name-1">Phone</Label>
                            <Input
                                id="phone"
                                placeholder="client phone"
                                name={data.phone}
                                onChange={(e) =>
                                    setData('phone', e.target.value)
                                }
                            />
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="name-1">Website</Label>
                            <Input
                                id="website"
                                placeholder="client website"
                                name={data.website}
                                onChange={(e) =>
                                    setData('website', e.target.value)
                                }
                            />
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="name-1">Address</Label>
                            <Input
                                id="address"
                                placeholder="client address"
                                name={data.address}
                                onChange={(e) =>
                                    setData('address', e.target.value)
                                }
                            />
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="monthly-value">
                                Monthly Value ($)
                            </Label>
                            <CurrencyInput
                                id="monthly-value"
                                placeholder="0.00"
                                value={data.monthly_value}
                                onChange={(val) =>
                                    setData('monthly_value', val)
                                }
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline" type="button">
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving...' : 'Save changes'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
