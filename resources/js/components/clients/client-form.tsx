import type { LucideIcon } from 'lucide-react';
import { User, Building2, Mail, Phone, Globe, MapPin } from 'lucide-react';
import { useRef, useEffect } from 'react';
import { CurrencyInput } from '@/components/ui/currency-input';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useClientStore } from '@/stores/useClientStore';

interface FormFieldProps {
    id: string;
    label: string;
    value: string;
    placeholder: string;
    editMode: boolean;
    onChange: (value: string) => void;
    icon?: LucideIcon;
}

function FormField({
    id,
    label,
    value,
    placeholder,
    editMode,
    onChange,
    icon: Icon,
}: FormFieldProps) {
    return (
        <div className="grid gap-2">
            <Label htmlFor={id}>{label}</Label>
            {editMode ? (
                <div className="relative">
                    {Icon && (
                        <Icon className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
                    )}
                    <Input
                        id={id}
                        placeholder={placeholder}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        className={`bg-white text-black dark:border-zinc-700 dark:bg-zinc-800 dark:text-white ${Icon ? 'pl-9' : ''}`}
                    />
                </div>
            ) : (
                <div className="flex items-center gap-2 rounded bg-zinc-100 px-3 py-2 text-black dark:bg-zinc-800 dark:text-white">
                    {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
                    <span>
                        {value || (
                            <span className="text-muted-foreground italic opacity-50">
                                Empty
                            </span>
                        )}
                    </span>
                </div>
            )}
        </div>
    );
}

export default function ClientForm() {
    const { formData, editMode, updateFormData, resetForm } = useClientStore();

    // Track previous editMode to detect change
    const prevEditModeRef = useRef(editMode);
    useEffect(() => {
        if (prevEditModeRef.current && !editMode) {
            resetForm();
        }
        prevEditModeRef.current = editMode;
    }, [editMode, resetForm]);

    const fields = [
        {
            id: 'name',
            label: 'Client Name',
            key: 'name' as const,
            placeholder: 'name',
            icon: User,
        },
        {
            id: 'company-name',
            label: 'Company Name',
            key: 'company_name' as const,
            placeholder: "client's company name",
            icon: Building2,
        },
        {
            id: 'email',
            label: 'Email',
            key: 'email' as const,
            placeholder: 'client email',
            icon: Mail,
        },
        {
            id: 'phone',
            label: 'Phone',
            key: 'phone' as const,
            placeholder: 'client phone',
            icon: Phone,
        },
        {
            id: 'website',
            label: 'Website',
            key: 'website' as const,
            placeholder: 'client website',
            icon: Globe,
        },
        {
            id: 'address',
            label: 'Address',
            key: 'address' as const,
            placeholder: 'client address',
            icon: MapPin,
        },
    ];

    return (
        <div className="grid gap-4">
            {fields.map((field) => (
                <FormField
                    key={field.id}
                    id={field.id}
                    label={field.label}
                    value={formData[field.key] as string}
                    placeholder={field.placeholder}
                    editMode={editMode}
                    onChange={(value) => updateFormData(field.key, value)}
                    icon={field.icon}
                />
            ))}
            <div className="grid gap-2">
                <Label htmlFor="monthly-value">Monthly Value ($)</Label>
                {editMode ? (
                    <CurrencyInput
                        id="monthly-value"
                        placeholder="0.00"
                        value={formData.monthly_value}
                        onChange={(val) => updateFormData('monthly_value', val)}
                    />
                ) : (
                    <div className="flex items-center gap-2 rounded bg-zinc-100 px-3 py-2 text-black dark:bg-zinc-800 dark:text-white">
                        <span className="text-sm font-semibold">
                            {new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: 'USD',
                            }).format(formData.monthly_value)}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}
