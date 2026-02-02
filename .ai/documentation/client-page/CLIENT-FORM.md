# Client Form Component Documentation

## Overview
Displays and manages the client's basic contact information fields. Supports both view and edit modes with automatic reset on mode changes.

## File Location
`resources/js/components/clients/client-form.tsx`

## Props
None - accesses state from `useClientStore`

## State Management

### Store State (useClientStore)
```typescript
const { formData, editMode, updateFormData, resetForm } = useClientStore();
```

- **formData**: Current form values
- **editMode**: Boolean indicating edit mode
- **updateFormData(key, value)**: Update field
- **resetForm()**: Reset to original values

### Local State
```typescript
const prevEditModeRef = useRef(editMode);
```
Tracks previous edit mode to detect changes.

## Hooks Used

### useClientStore
Global state management for client data.

### useRef
Tracks previous editMode value to trigger reset.

### useEffect
Resets form when exiting edit mode:
```typescript
useEffect(() => {
    if (prevEditModeRef.current && !editMode) {
        resetForm();
    }
    prevEditModeRef.current = editMode;
}, [editMode, resetForm]);
```

## Form Fields

All fields follow the same pattern via `FormField` component:

1. **Name** - Client's full name
2. **Company Name** - Associated company
3. **Email** - Email address
4. **Phone** - Phone number
5. **Website** - Website URL
6. **Address** - Physical address

### Field Configuration
```typescript
{
    id: 'name',
    label: 'Client Name',
    key: 'name' as const,
    placeholder: 'name',
    icon: User,
}
```

## FormField Component

### Props
```typescript
interface FormFieldProps {
    id: string;
    label: string;
    value: string;
    placeholder: string;
    editMode: boolean;
    onChange: (value: string) => void;
    icon?: LucideIcon;
}
```

### Rendering Logic

#### Edit Mode
```typescript
<Input
    id={id}
    placeholder={placeholder}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="pl-9"  // If icon present
/>
```

#### View Mode
```typescript
<div className="rounded bg-zinc-100 px-3 py-2">
    {Icon && <Icon />}
    <span>{value || "Empty"}</span>
</div>
```

## Data Flow

### Update Flow
```
User types → onChange(value) → updateFormData(key, value) → Store updates
→ Store tracks change → Component re-renders
```

### Reset Flow
```
editMode changes false → useEffect triggers → resetForm()
→ formData reset to original → changedFields cleared
```

## Icons

Each field has a corresponding icon:
- **User**: Name
- **Building2**: Company Name
- **Mail**: Email
- **Phone**: Phone
- **Globe**: Website
- **MapPin**: Address

## Styling

### Edit Mode Input
- White background with border
- Icon on left (pl-9 padding)
- Dark mode support

### View Mode Display
- Gray background (zinc-100/zinc-800)
- Read-only appearance
- Icon on left
- "Empty" text for null values (italic, muted)

## Layout
```
div.grid.gap-4
  └─ FormField[] (6 fields)
      ├─ Label
      └─ Input (edit) / Display (view)
```

## Dependencies
- Zustand store: `useClientStore`
- UI: Input, Label
- Icons: lucide-react

## Related
- [client-overview-tab.tsx](./CLIENT-OVERVIEW-TAB.md)
- [show.tsx](../pages/clients/SHOW.md)
