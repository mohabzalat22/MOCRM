import { Transition } from '@headlessui/react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import DeleteUser from '@/components/delete-user';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import ProfilePhotoUpload from '@/components/settings/ProfilePhotoUpload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { edit } from '@/routes/profile';
import { send } from '@/routes/verification';
import type { BreadcrumbItem, SharedData } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Profile settings',
        href: edit().url,
    },
];

const timezones = [
    { value: 'UTC', label: 'UTC' },
    { value: 'Africa/Cairo', label: 'Cairo, Egypt' },
    { value: 'America/New_York', label: 'Eastern Time (US & Canada)' },
    { value: 'America/Chicago', label: 'Central Time (US & Canada)' },
    { value: 'America/Denver', label: 'Mountain Time (US & Canada)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (US & Canada)' },
    { value: 'Europe/London', label: 'London, Dublin, Lisbon' },
    { value: 'Europe/Paris', label: 'Paris, Berlin, Rome' },
    { value: 'Asia/Tokyo', label: 'Tokyo, Seoul, Osaka' },
];

const dateFormats = [
    { value: 'Y-m-d', label: 'YYYY-MM-DD' },
    { value: 'd/m/Y', label: 'DD/MM/YYYY' },
    { value: 'm/d/Y', label: 'MM/DD/YYYY' },
];

const currencies = [
    { value: 'USD', label: 'USD ($)' },
    { value: 'EUR', label: 'EUR (€)' },
    { value: 'GBP', label: 'GBP (£)' },
    { value: 'EGP', label: 'EGP (E£)' },
];

export default function Profile({
    mustVerifyEmail,
    status,
}: {
    mustVerifyEmail: boolean;
    status?: string;
}) {
    const { auth } = usePage<SharedData>().props;

    const { data, setData, post, errors, processing, recentlySuccessful } =
        useForm({
            _method: 'PATCH',
            name: auth.user.name,
            email: auth.user.email,
            avatar: null as File | null,
            business_name: auth.user.business_name || '',
            business_logo: null as File | null,
            timezone: auth.user.timezone || 'UTC',
            date_format: auth.user.date_format || 'Y-m-d',
            currency: auth.user.currency || 'USD',
        });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('profile.update'), {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile settings" />

            <h1 className="sr-only">Profile Settings</h1>

            <SettingsLayout>
                <div className="space-y-12">
                    <form onSubmit={submit} className="space-y-12">
                        {/* Personal Information */}
                        <section className="space-y-6">
                            <Heading
                                variant="small"
                                title="Profile Information"
                                description="Update your personal details and profile picture."
                            />

                            <div className="grid gap-8 md:grid-cols-2">
                                <div className="space-y-6">
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">Name</Label>
                                        <Input
                                            id="name"
                                            className="mt-1 block w-full"
                                            value={data.name}
                                            onChange={(e) =>
                                                setData('name', e.target.value)
                                            }
                                            required
                                            autoComplete="name"
                                            placeholder="Full name"
                                        />
                                        <InputError message={errors.name} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="email">
                                            Email address
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            className="mt-1 block w-full"
                                            value={data.email}
                                            onChange={(e) =>
                                                setData('email', e.target.value)
                                            }
                                            required
                                            autoComplete="username"
                                            placeholder="Email address"
                                        />
                                        <InputError message={errors.email} />

                                        {mustVerifyEmail &&
                                            auth.user.email_verified_at ===
                                                null && (
                                                <div className="mt-2">
                                                    <p className="text-sm text-muted-foreground">
                                                        Your email address is
                                                        unverified.{' '}
                                                        <Link
                                                            href={send()}
                                                            as="button"
                                                            className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                                        >
                                                            Click here to resend
                                                            the verification
                                                            email.
                                                        </Link>
                                                    </p>
                                                    {status ===
                                                        'verification-link-sent' && (
                                                        <div className="mt-2 text-sm font-medium text-green-600">
                                                            A new verification
                                                            link has been sent
                                                            to your email
                                                            address.
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                    </div>
                                </div>

                                <div className="flex flex-col items-center justify-center space-y-4 rounded-xl border border-border bg-muted/30 p-8">
                                    <Label className="text-center font-semibold">
                                        Profile Photo
                                    </Label>
                                    <ProfilePhotoUpload
                                        currentImage={auth.user.avatar_url}
                                        onChange={(file) =>
                                            setData('avatar', file)
                                        }
                                        label="Upload Avatar"
                                    />
                                    <p className="text-center text-xs text-muted-foreground">
                                        Recommended: Square image, max 2MB
                                    </p>
                                    <InputError message={errors.avatar} />
                                </div>
                            </div>
                        </section>

                        <hr className="border-border" />

                        {/* Business Information */}
                        <section className="space-y-6">
                            <Heading
                                variant="small"
                                title="Business Settings"
                                description="Manage your business identity and branding."
                            />

                            <div className="grid gap-8 md:grid-cols-2">
                                <div className="space-y-6">
                                    <div className="grid gap-2">
                                        <Label htmlFor="business_name">
                                            Business Name
                                        </Label>
                                        <Input
                                            id="business_name"
                                            className="mt-1 block w-full"
                                            value={data.business_name}
                                            onChange={(e) =>
                                                setData(
                                                    'business_name',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Your company name"
                                        />
                                        <InputError
                                            message={errors.business_name}
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col items-center justify-center space-y-4 rounded-xl border border-border bg-muted/30 p-8">
                                    <Label className="text-center font-semibold">
                                        Business Logo
                                    </Label>
                                    <ProfilePhotoUpload
                                        currentImage={
                                            auth.user.business_logo_url
                                        }
                                        onChange={(file) =>
                                            setData('business_logo', file)
                                        }
                                        label="Upload Logo"
                                    />
                                    <p className="text-center text-xs text-muted-foreground">
                                        Used for invoices and reports
                                    </p>
                                    <InputError
                                        message={errors.business_logo}
                                    />
                                </div>
                            </div>
                        </section>

                        <hr className="border-border" />

                        {/* Localization */}
                        <section className="space-y-6">
                            <Heading
                                variant="small"
                                title="Localization & Preferences"
                                description="Set your preferred timezone, date format, and currency."
                            />

                            <div className="grid gap-6 md:grid-cols-3">
                                <div className="grid gap-2">
                                    <Label htmlFor="timezone">Timezone</Label>
                                    <Select
                                        value={data.timezone}
                                        onValueChange={(val) =>
                                            setData('timezone', val)
                                        }
                                    >
                                        <SelectTrigger id="timezone">
                                            <SelectValue placeholder="Select timezone" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {timezones.map((tz) => (
                                                <SelectItem
                                                    key={tz.value}
                                                    value={tz.value}
                                                >
                                                    {tz.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.timezone} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="date_format">
                                        Date Format
                                    </Label>
                                    <Select
                                        value={data.date_format}
                                        onValueChange={(val) =>
                                            setData('date_format', val)
                                        }
                                    >
                                        <SelectTrigger id="date_format">
                                            <SelectValue placeholder="Select date format" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {dateFormats.map((df) => (
                                                <SelectItem
                                                    key={df.value}
                                                    value={df.value}
                                                >
                                                    {df.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.date_format} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="currency">Currency</Label>
                                    <Select
                                        value={data.currency}
                                        onValueChange={(val) =>
                                            setData('currency', val)
                                        }
                                    >
                                        <SelectTrigger id="currency">
                                            <SelectValue placeholder="Select currency" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {currencies.map((c) => (
                                                <SelectItem
                                                    key={c.value}
                                                    value={c.value}
                                                >
                                                    {c.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.currency} />
                                </div>
                            </div>
                        </section>

                        <div className="flex items-center gap-4 pt-4">
                            <Button
                                disabled={processing}
                                data-test="update-profile-button"
                                size="lg"
                                className="px-8 shadow-lg shadow-primary/20"
                            >
                                Save All Settings
                            </Button>

                            <Transition
                                show={recentlySuccessful}
                                enter="transition ease-in-out"
                                enterFrom="opacity-0"
                                leave="transition ease-in-out"
                                leaveTo="opacity-0"
                            >
                                <p className="text-sm font-medium text-green-600 dark:text-green-400">
                                    Settings saved successfully!
                                </p>
                            </Transition>
                        </div>
                    </form>
                </div>

                <div className="mt-12">
                    <hr className="mb-12 border-border" />
                    <DeleteUser />
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
