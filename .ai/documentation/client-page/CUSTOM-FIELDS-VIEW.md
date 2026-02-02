# Custom Fields View Component Documentation

## Overview
Manages display and editing of dynamic custom fields (key-value pairs) with a sheet-based add/edit interface.

## File Location
`resources/js/components/clients/custom-fields-view.tsx`

## Props
None - uses `useClientStore`

## State Management

### Store State
```typescript
const { formData, updateFormData, editMode } = useClientStore();
const fields = formData.custom_fields || [];
```

### Local State
```typescript
const [isSheetOpen, setIsSheetOpen] = useState(false);
const [editingIndex, setEditingIndex] = useState<number | null>(null);
const [currentField, setCurrentField] = useState<CustomField>({
    key: '',
    value: '',
});
```

## Data Flow

### Display Fields
```
formData.custom_fields → fields array → Map to display cards
```

### Add Field
```
User clicks "Add Field" → handleOpenAdd()
  → setEditingIndex(null)
  → setCurrentField({ key: '', value: '' })
  → setIsSheetOpen(true)
→ User enters data → handleSave()
  → onFieldsChange([...fields, currentField])
  → updateFormData('custom_fields', newFields)
  → setIsSheetOpen(false)
```

### Edit Field
```
User clicks Edit → handleOpenEdit(index, field)
  → setEditingIndex(index)
  → setCurrentField({ ...field })
  → setIsSheetOpen(true)
→ User modifies → handleSave()
  → onFieldsChange(fields.map(...))
  → updateFormData('custom_fields', newFields)
```

### Delete Field
```
User clicks Delete → handleRemove(index)
  → onFieldsChange(fields.filter(...))
  → updateFormData('custom_fields', newFields)
```

## Event Handlers

### handleOpenAdd
```typescript
const handleOpenAdd = () => {
    setEditingIndex(null);
    setCurrentField({ key: '', value: '' });
    setIsSheetOpen(true);
};
```

### handleOpenEdit
```typescript
const handleOpenEdit = (index: number, field: CustomField) => {
    setEditingIndex(index);
    setCurrentField({ ...field });  // Clone to avoid direct mutation
    setIsSheetOpen(true);
};
```

### handleSave
```typescript
const handleSave = () => {
    if (!currentField.key.trim()) return;  // Require key
    
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
```

### handleRemove
```typescript
const handleRemove = (index: number) => {
    const updated = fields.filter((_, i) => i !== index);
    onFieldsChange(updated);
};
```

## Layout Structure

```
div.space-y-4
  ├─ Header
  │   ├─ Label "Custom Fields"
  │   └─ Button "Add Field" (edit mode only)
  ├─ Fields Display
  │   ├─ Empty state (if no fields)
  │   └─ Field cards[] (if fields exist)
  │       ├─ Header
  │       │   ├─ Field key (bold)
  │       │   └─ Actions (edit mode only)
  │       │       ├─ Edit button
  │       │       └─ Delete button
  │       └─ Field value (pre-wrapped, muted background)
  └─ Sheet (add/edit form)
      ├─ SheetHeader
      ├─ Form fields
      │   ├─ Field Name input
      │   └─ Content textarea
      └─ SheetFooter
          ├─ Cancel button
          └─ Save button
```

## Empty State

```tsx
{fields.length === 0 ? (
    <div className="rounded-lg border border-dashed p-4 text-center">
        No custom fields added.
    </div>
) : (
    // Field cards
)}
```

## Field Card

```tsx
<div className="flex flex-col gap-2 rounded-lg border bg-card p-3 shadow-sm hover:shadow-md">
    <div className="flex items-start justify-between">
        <span className="font-semibold">{field.key}</span>
        {editMode && (
            <div className="flex gap-1">
                <Button onClick={handleEdit}>
                    <Pencil /> Edit
                </Button>
                <Button onClick={handleRemove} className="text-destructive">
                    <Trash /> Delete
                </Button>
            </div>
        )}
    </div>
    <div className="rounded-md bg-muted/50 p-2 whitespace-pre-wrap break-words">
        {field.value}
    </div>
</div>
```

## Sheet Form

### Field Name Input
```tsx
<Input
    id="field-key"
    placeholder="e.g. Notes, Project ID"
    value={currentField.key}
    onChange={(e) =>
        setCurrentField({ ...currentField, key: e.target.value })
    }
/>
```

### Content Textarea
```tsx
<Textarea
    id="field-value"
    placeholder="Enter the field content..."
    value={currentField.value}
    onChange={(e) =>
        setCurrentField({ ...currentField, value: e.target.value })
    }
    className="min-h-[200px] resize-none"
/>
```

## Validation

### Save Validation
```typescript
if (!currentField.key.trim()) return;  // Require non-empty key
```

No validation on value - can be empty.

## Styling

### Field Cards
- Border + shadow
- Hover: increased shadow
- Rounded corners
- Padding (p-3)
- Gap between elements (gap-2)

### Field Value Display
- Muted background (bg-muted/50)
- Padding (p-2)
- Pre-wrap text (preserves whitespace)
- Break words (prevents overflow)

### Sheet
- Full width on mobile
- Max width sm:max-w-md on desktop
- Custom padding (p-2)

### Textarea
- Min height: 200px
- No resize
- Text base on mobile, sm on desktop

## Components Used

### UI Components
- Button
- Input
- Label
- Textarea
- Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter

### Icons
- Plus (add)
- Pencil (edit)
- Trash (delete)

## Dependencies
- Store: useClientStore
- UI: shadcn/ui components
- Icons: lucide-react
- Types: CustomField

## Usage Example

```typescript
import CustomFieldsView from '@/components/clients/custom-fields-view';

<CustomFieldsView />
```

## Related
- [custom-fields.tsx](./CUSTOM-FIELDS.md) - Alternative implementation
- [client-overview-tab.tsx](./CLIENT-OVERVIEW-TAB.md)
- [show.tsx](../pages/clients/SHOW.md)
