import { useState } from 'react';

export type CustomField = {
    key: string;
    value: string;
};

type Props = {
    initialFields?: CustomField[];
    onSubmit: (fields: CustomField[]) => void;
};

export default function CustomFieldsForm({
    initialFields = [],
    onSubmit,
}: Props) {
    const [fields, setFields] = useState<CustomField[]>(initialFields);
    const [saveButtonSatus, setSaveButtonStatus] = useState<boolean>(false);

    // Add new empty field
    const addField = () => {
        setFields((prev) => [...prev, { key: '', value: '' }]);
    };

    // Update field
    const updateField = (
        index: number,
        field: keyof CustomField,
        value: string,
    ) => {
        setFields((prev) =>
            prev.map((item, i) =>
                i === index ? { ...item, [field]: value } : item,
            ),
        );
        setSaveButtonStatus(true);
    };

    // Remove field
    const removeField = (index: number) => {
        setFields((prev) => prev.filter((_, i) => i !== index));
    };

    // Submit
    const handleSubmit = () => {
        const cleaned = fields.filter((f) => f.key.trim() !== '');
        setSaveButtonStatus(false);
        onSubmit(cleaned);
    };

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">Custom Fields</h3>

            {fields.length === 0 && (
                <p className="text-sm text-gray-500">
                    No custom fields added yet.
                </p>
            )}

            {fields.map((field, index) => (
                <div
                    key={index}
                    className="flex items-center gap-2 rounded border p-2"
                >
                    <input
                        type="text"
                        placeholder="Field name"
                        value={field.key}
                        onChange={(e) =>
                            updateField(index, 'key', e.target.value)
                        }
                        className="w-1/3 rounded border px-2 py-1"
                    />

                    <input
                        type="text"
                        placeholder="Value"
                        value={field.value}
                        onChange={(e) =>
                            updateField(index, 'value', e.target.value)
                        }
                        className="flex-1 rounded border px-2 py-1"
                    />

                    <button
                        type="button"
                        onClick={() => removeField(index)}
                        className="text-red-500 hover:text-red-700"
                    >
                        ✕
                    </button>
                </div>
            ))}

            <div className="flex gap-2">
                <button
                    type="button"
                    onClick={addField}
                    className="rounded bg-gray-200 px-3 py-1 text-sm hover:bg-gray-300"
                >
                    + Add field
                </button>

                {saveButtonSatus && (
                    <button
                        type="button"
                        onClick={handleSubmit}
                        className="rounded bg-gray-600 px-4 py-1 text-sm text-white hover:bg-gray-700"
                    >
                        Save
                    </button>
                )}
            </div>
        </div>
    );
}
