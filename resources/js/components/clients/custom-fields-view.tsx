import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { CustomField } from './custom-fields';

interface CustomFieldsViewProps {
    fields: CustomField[];
    editMode?: boolean;
    onFieldChange?: (idx: number, value: string) => void;
}

export default function CustomFieldsView({
    fields,
    editMode = false,
    onFieldChange,
}: CustomFieldsViewProps) {
    if (!fields || fields.length === 0) {
        return (
            <div className="text-sm text-gray-500">No custom fields added.</div>
        );
    }
    return (
        <div className="mt-4 grid gap-4">
            <h3 className="text-lg font-semibold">Custom Fields</h3>
            {fields.map((field, idx) => (
                <div className="grid gap-2" key={field.key || idx}>
                    <Label htmlFor={`custom-field-${idx}`}>{field.key}</Label>
                    {editMode ? (
                        <Input
                            id={`custom-field-${idx}`}
                            placeholder={field.key}
                            value={field.value}
                            onChange={(e) =>
                                onFieldChange &&
                                onFieldChange(idx, e.target.value)
                            }
                            className="border bg-white text-black dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                        />
                    ) : (
                        <div className="rounded bg-zinc-100 px-3 py-2 text-black dark:bg-zinc-800 dark:text-white">
                            {field.value}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
