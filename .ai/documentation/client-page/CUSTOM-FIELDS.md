# Custom Fields Form Component Documentation

## Overview
Alternative implementation of custom fields management using an inline form approach. This component appears to be an older or alternative version compared to CustomFieldsView.

## File Location
`resources/js/components/clients/custom-fields.tsx`

## Props

```typescript
type Props = {
    initialFields?: CustomField[];
    onSubmit: (fields: CustomField[]) => void;
};
```

### `initialFields` (CustomField[], optional)
Array of initial custom field values. Defaults to empty array.

### `onSubmit` (function)
Callback function called when user clicks Save. Receives cleaned field array (empty fields filtered out).

## State Management

### Local State
```typescript
const [fields, setFields] = useState<CustomField[]>(initialFields);
const [saveButtonSatus, setSaveButtonStatus] = useState<boolean>(false);
```

**Note**: `saveButtonSatus` appears to be a typo for "saveButtonStatus"

## Data Flow

### Initialize
```
initialFields prop → useState → fields state
```

### Add Field
```
User clicks "Add field" → addField()
  → setFields([...prev, { key: '', value: '' }])
```

### Update Field
```
User types → updateField(index, 'key'|'value', value)
  → setFields(map with update at index)
  → setSaveButtonStatus(true)  // Show save button
```

### Remove Field
```
User clicks ✕ → removeField(index)
  → setFields(filter out index)
```

### Submit
```
User clicks Save → handleSubmit()
  → Filter empty fields (where key.trim() !== '')
  → setSaveButtonStatus(false)
  → onSubmit(cleanedFields)
```

## Functions

### addField
```typescript
const addField = () => {
    setFields((prev) => [...prev, { key: '', value: '' }]);
};
```

Appends empty field to array.

### updateField
```typescript
const updateField = (
    index: number,
    field: keyof CustomField,  // 'key' or 'value'
    value: string,
) => {
    setFields((prev) =>
        prev.map((item, i) =>
            i === index ? { ...item, [field]: value } : item
        )
    );
    setSaveButtonStatus(true);
};
```

Updates specific field at index and shows save button.

### removeField
```typescript
const removeField = (index: number) => {
    setFields((prev) => prev.filter((_, i) => i !== index));
};
```

Removes field at index.

### handleSubmit
```typescript
const handleSubmit = () => {
    const cleaned = fields.filter((f) => f.key.trim() !== '');
    setSaveButtonStatus(false);
    onSubmit(cleaned);
};
```

Filters out empty fields before submitting.

## Layout Structure

```
div.space-y-4
  ├─ h3 "Custom Fields"
  ├─ Empty state (if no fields)
  ├─ Field rows[] (map over fields)
  │   ├─ Input (field name)
  │   ├─ Input (value)
  │   └─ Button (remove ✕)
  └─ Actions
      ├─ Button "+ Add field"
      └─ Button "Save" (conditional)
```

## Field Row

```tsx
<div className="flex items-center gap-2 rounded border p-2">
    <input
        type="text"
        placeholder="Field name"
        value={field.key}
        onChange={(e) => updateField(index, 'key', e.target.value)}
        className="w-1/3 rounded border px-2 py-1"
    />
    <input
        type="text"
        placeholder="Value"
        value={field.value}
        onChange={(e) => updateField(index, 'value', e.target.value)}
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
```

## Empty State

```tsx
{fields.length === 0 && (
    <p className="text-sm text-gray-500">
        No custom fields added yet.
    </p>
)}
```

## Action Buttons

### Add Field Button
```tsx
<button
    type="button"
    onClick={addField}
    className="rounded bg-gray-200 px-3 py-1 text-sm hover:bg-gray-300"
>
    + Add field
</button>
```

Always visible.

### Save Button
```tsx
{saveButtonSatus && (
    <button
        type="button"
        onClick={handleSubmit}
        className="rounded bg-gray-600 px-4 py-1 text-sm text-white hover:bg-gray-700"
    >
        Save
    </button>
)}
```

Only visible after field changes.

## Data Transformations

### Cleaning on Submit
```typescript
fields.filter((f) => f.key.trim() !== '')
```

Removes fields where key is empty or whitespace.

**Example**:
```
Input: [
    { key: 'Notes', value: 'Some text' },
    { key: '', value: 'Orphaned value' },
    { key: '  ', value: 'Whitespace key' },
    { key: 'Valid', value: '' }  // Empty value is OK
]

Output: [
    { key: 'Notes', value: 'Some text' },
    { key: 'Valid', value: '' }
]
```

## Styling

### Field Row
- Flex layout with gap
- Rounded border
- Padding

### Name Input
- Width: 1/3
- Rounded border
- Padding

### Value Input
- Flex: 1 (takes remaining space)
- Rounded border
- Padding

### Remove Button
- Red text
- Hover: darker red
- No border/background

### Add Button
- Gray background
- Small text
- Hover: darker gray

### Save Button
- Dark gray background
- White text
- Hover: darker

## Differences from CustomFieldsView

### CustomFieldsView (Recommended)
- Uses Sheet for add/edit
- Better UX (modal interface)
- Edit mode awareness
- Store integration
- Better styled (shadcn/ui)

### CustomFields (This Component)
- Inline editing
- Simpler implementation
- Prop-based (no store)
- Basic styling
- Immediate save button

## Usage Notes

This component appears to be an earlier or alternative implementation. The codebase primarily uses **CustomFieldsView** component instead.

## Dependencies
- Types: CustomField

## Usage Example

```typescript
import CustomFieldsForm from '@/components/clients/custom-fields';

<CustomFieldsForm
    initialFields={client.custom_fields}
    onSubmit={(fields) => {
        // Handle save
        updateClientCustomFields(fields);
    }}
/>
```

## Related
- [custom-fields-view.tsx](./CUSTOM-FIELDS-VIEW.md) - Preferred implementation
- Types: CustomField
