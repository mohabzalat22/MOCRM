import { useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
interface ClientFormData {
    name: string;
    company_name: string;
    email: string;
    phone: string;
    website: string;
    address: string;
}

interface ClientFormProps {
    data: ClientFormData;
    editMode: boolean;
    onFieldChange: (key: keyof ClientFormData, value: string) => void;
    onReset?: () => void;
}

interface FormFieldProps {
    id: string;
    label: string;
    value: string;
    placeholder: string;
    editMode: boolean;
    onChange: (value: string) => void;
}
function FormField({
    id,
    label,
    value,
    placeholder,
    editMode,
    onChange,
}: FormFieldProps) {
    return (
        <div className="grid gap-2">
            <Label htmlFor={id}>{label}</Label>
            {editMode ? (
                <Input
                    id={id}
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="border bg-white text-black dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                />
            ) : (
                <div className="rounded bg-zinc-100 px-3 py-2 text-black dark:bg-zinc-800 dark:text-white">
                    {value}
                </div>
            )}
        </div>
    );
}
export default function ClientForm({
    data,
    editMode,
    onFieldChange,
    onReset,
}: ClientFormProps) {
    // Track previous editMode to detect change
    const prevEditModeRef = useRef(editMode);
    useEffect(() => {
        if (prevEditModeRef.current && !editMode && onReset) {
            onReset();
        }
        prevEditModeRef.current = editMode;
    }, [editMode, onReset]);
    const fields = [
        {
            id: 'name',
            label: 'Client Name',
            key: 'name' as const,
            placeholder: 'name',
        },
        {
            id: 'company-name',
            label: 'Company Name',
            key: 'company_name' as const,
            placeholder: "client's company name",
        },
        {
            id: 'email',
            label: 'Email',
            key: 'email' as const,
            placeholder: 'client email',
        },
        {
            id: 'phone',
            label: 'Phone',
            key: 'phone' as const,
            placeholder: 'client phone',
        },
        {
            id: 'website',
            label: 'Website',
            key: 'website' as const,
            placeholder: 'client website',
        },
        {
            id: 'address',
            label: 'Address',
            key: 'address' as const,
            placeholder: 'client address',
        },
    ];

    return (
        <div className="grid gap-4">
            {fields.map((field) => (
                <FormField
                    key={field.id}
                    id={field.id}
                    label={field.label}
                    value={data[field.key]}
                    placeholder={field.placeholder}
                    editMode={editMode}
                    onChange={(value) => onFieldChange(field.key, value)}
                />
            ))}
        </div>
    );
}
