import { Plus, Trash, Pencil} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { useClientStore } from '@/stores/useClientStore';
import type { CustomField } from './custom-fields';

export default function CustomFieldsView() {
    const { formData, updateFormData, editMode } = useClientStore();
    const fields = formData.custom_fields || [];

    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [currentField, setCurrentField] = useState<CustomField>({
        key: '',
        value: '',
    });

    const onFieldsChange = (newFields: CustomField[]) => {
        updateFormData('custom_fields', newFields);
    };

    const handleOpenAdd = () => {
        setEditingIndex(null);
        setCurrentField({ key: '', value: '' });
        setIsSheetOpen(true);
    };

    const handleOpenEdit = (index: number, field: CustomField) => {
        setEditingIndex(index);
        setCurrentField({ ...field });
        setIsSheetOpen(true);
    };

    const handleSave = () => {
        if (!currentField.key.trim()) return;

        if (editingIndex !== null) {
            // Edit existing
            const updated = fields.map((f, i) =>
                i === editingIndex ? currentField : f
            );
            onFieldsChange(updated);
        } else {
            // Add new
            onFieldsChange([...fields, currentField]);
        }
        setIsSheetOpen(false);
    };

    const handleRemove = (index: number) => {
        const updated = fields.filter((_, i) => i !== index);
        onFieldsChange(updated);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Custom Fields</Label>
                {editMode && (
                    <Button variant="outline" size="sm" onClick={handleOpenAdd} type="button">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Field
                    </Button>
                )}
            </div>

            <div className="space-y-3">
                {fields.length === 0 ? (
                    <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
                        No custom fields added.
                    </div>
                ) : (
                    fields.map((field, idx) => (
                        <div
                            key={idx}
                            className="flex flex-col gap-2 rounded-lg border bg-card p-3 shadow-sm transition-all hover:shadow-md"
                        >
                            <div className="flex items-start justify-between">
                                <span className="font-semibold">{field.key}</span>
                                {editMode && (
                                    <div className="flex gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleOpenEdit(idx, field)}
                                            type="button"
                                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                        >
                                            <Pencil className="h-4 w-4" />
                                            <span className="sr-only">Edit</span>
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleRemove(idx)}
                                            type="button"
                                            className="h-8 w-8 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                                        >
                                            <Trash className="h-4 w-4" />
                                            <span className="sr-only">Delete</span>
                                        </Button>
                                    </div>
                                )}
                            </div>
                            <div className="rounded-md bg-muted/50 p-2 text-sm text-muted-foreground whitespace-pre-wrap break-words">
                                {field.value}
                            </div>
                        </div>
                    ))
                )}
            </div>

            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent className="w-full sm:max-w-md p-2">
                    <SheetHeader>
                        <SheetTitle>
                            {editingIndex !== null ? 'Edit Custom Field' : 'Add Custom Field'}
                        </SheetTitle>
                        <SheetDescription>
                            {editingIndex !== null
                                ? 'Make changes to your custom field here.'
                                : 'Add a new custom field to this record.'}
                        </SheetDescription>
                    </SheetHeader>
                    <div className="grid gap-6 py-6">
                        <div className="grid gap-2">
                            <Label htmlFor="field-key">Field Name (Key)</Label>
                            <Input
                                id="field-key"
                                placeholder="e.g. Notes, Project ID"
                                value={currentField.key}
                                onChange={(e) =>
                                    setCurrentField({ ...currentField, key: e.target.value })
                                }
                                className="bg-background"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="field-value">Content (Value)</Label>
                            <Textarea
                                id="field-value"
                                placeholder="Enter the field content..."
                                value={currentField.value}
                                onChange={(e) =>
                                    setCurrentField({ ...currentField, value: e.target.value })
                                }
                                className="min-h-[200px] resize-none bg-background text-base md:text-sm"
                            />
                        </div>
                    </div>
                    <SheetFooter className="flex-col gap-2 sm:flex-row sm:justify-end">
                        <Button
                            variant="outline"
                            onClick={() => setIsSheetOpen(false)}
                            type="button"
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleSave} type="button">
                            Save Changes
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </div>
    );
}
