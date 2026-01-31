import { Trash } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useClientStore } from '@/stores/useClientStore';
import type { CustomField } from './custom-fields';

export default function CustomFieldsView() {
    const { formData, updateFormData, editMode } = useClientStore();
    const fields = formData.custom_fields;

    const [adding, setAdding] = useState(false);
    const [newField, setNewField] = useState<CustomField>({
        key: '',
        value: '',
    });

    const onFieldsChange = (newFields: CustomField[]) => {
        updateFormData('custom_fields', newFields);
    };

    // Handler to add a new custom field
    const handleAddCustomField = () => {
        setAdding(true);
        setNewField({ key: '', value: '' });
    };

    // Handler to save the new custom field
    const handleSaveNewField = () => {
        if (newField.key.trim() !== '') {
            onFieldsChange([...fields, { ...newField }]);
            setAdding(false);
            setNewField({ key: '', value: '' });
        }
    };

    // Handler to cancel adding
    const handleCancelAdd = () => {
        setAdding(false);
        setNewField({ key: '', value: '' });
    };

    // Handler to update a custom field (key or value)
    const handleCustomFieldChange = (
        idx: number,
        fieldKey: 'key' | 'value',
        value: string,
    ) => {
        const updated = fields.map((f, i) =>
            i === idx ? { ...f, [fieldKey]: value } : f,
        );
        onFieldsChange(updated);
    };

    // Handler to remove a custom field by index
    const handleRemoveCustomField = (idx: number) => {
        const updated = fields.filter((_, i) => i !== idx);
        onFieldsChange(updated);
    };

    return (
        <div>
            <label className="mb-2 block font-semibold">Custom Fields</label>
            <div className="space-y-2">
                {(!fields || fields.length === 0) && !adding && (
                    <div className="text-sm text-gray-500">
                        No custom fields added.
                    </div>
                )}
                {fields &&
                    fields.map((customField, idx) => (
                        <div key={idx} className="my-1 flex items-center gap-2">
                            {editMode ? (
                                <>
                                    <input
                                        className="w-1/3 rounded border px-2 py-1 dark:bg-zinc-800 dark:text-white"
                                        type="text"
                                        placeholder="Key"
                                        value={customField.key}
                                        onChange={(e) =>
                                            handleCustomFieldChange(
                                                idx,
                                                'key',
                                                e.target.value,
                                            )
                                        }
                                    />
                                    <input
                                        className="w-1/2 rounded border px-2 py-1 dark:bg-zinc-800 dark:text-white"
                                        type="text"
                                        placeholder="Value"
                                        value={customField.value}
                                        onChange={(e) =>
                                            handleCustomFieldChange(
                                                idx,
                                                'value',
                                                e.target.value,
                                            )
                                        }
                                    />
                                    <button
                                        type="button"
                                        className="ml-2 rounded p-1 text-red-500 transition-colors duration-150 hover:bg-red-500 hover:text-white focus:ring-2 focus:ring-red-400 focus:outline-none"
                                        aria-label="Remove field"
                                        onClick={() =>
                                            handleRemoveCustomField(idx)
                                        }
                                    >
                                        <Trash
                                            size={20}
                                            strokeWidth={2.2}
                                            className="pointer-events-none"
                                        />
                                    </button>
                                </>
                            ) : (
                                <div className="w-full">
                                    <p className="my-1 text-sm font-medium capitalize">
                                        {customField.key}
                                    </p>
                                    <div className="w-full rounded bg-zinc-100 px-3 py-2 text-black dark:bg-zinc-800 dark:text-white">
                                        {customField.value}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                {editMode && adding && (
                    <div className="my-1 flex items-center gap-2">
                        <input
                            className="w-1/3 rounded border px-2 py-1 dark:bg-zinc-800 dark:text-white"
                            type="text"
                            placeholder="Key"
                            value={newField.key}
                            onChange={(e) =>
                                setNewField((prev) => ({
                                    ...prev,
                                    key: e.target.value,
                                }))
                            }
                        />
                        <input
                            className="w-1/2 rounded border px-2 py-1 dark:bg-zinc-800 dark:text-white"
                            type="text"
                            placeholder="Value"
                            value={newField.value}
                            onChange={(e) =>
                                setNewField((prev) => ({
                                    ...prev,
                                    value: e.target.value,
                                }))
                            }
                        />
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleSaveNewField}
                        >
                            Save
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={handleCancelAdd}
                        >
                            Cancel
                        </Button>
                    </div>
                )}
            </div>
            {editMode && !adding && (
                <Button variant="outline" onClick={handleAddCustomField}>
                    + Add New Field
                </Button>
            )}
        </div>
    );
}
