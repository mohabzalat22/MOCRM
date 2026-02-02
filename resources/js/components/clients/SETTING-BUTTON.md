# Setting Button Component Documentation

## Overview

Dropdown menu for client settings, providing edit mode toggle and delete functionality with confirmation dialog.

## File Location

`resources/js/components/clients/setting-button.tsx`

## Props

None - uses `useClientStore`

## State Management

### Store State

```typescript
const { editMode, deleting, client, setEditMode, setDeleting } =
    useClientStore();
```

### Confirmation Dialog

```typescript
const { confirm, ConfirmDialog } = useConfirmDialog();
```

## Menu Actions

### 1. Edit Toggle

**Label**:

- "Editing..." (when editMode = true)
- "Edit" (when editMode = false)

**Action**:

```typescript
onClick: () => setEditMode(!editMode);
```

**Styling**: Active (bold, highlighted background) when in edit mode

### 2. Delete Client

**Label**:

- "Deleting..." (when deleting = true)
- "Delete" (when deleting = false)

**Action**:

```typescript
handleDelete() {
    confirm(
        () => {
            setDeleting(true);
            router.delete(`/clients/${client.id}`, {
                onSuccess: () => {
                    setEditMode(false);
                    toast.success('Client has been deleted.');
                },
                onError: () => {
                    setDeleting(false);
                    toast.error('Failed to delete client.');
                },
            });
        },
        {
            title: 'Confirm Delete',
            message: 'Are you sure you want to delete this client? This action cannot be undone.',
        }
    );
}
```

**Styling**: Red text, red focus background

**Disabled**: When `deleting = true`

## Data Flow

### Edit Mode Flow

```
User clicks Edit → setEditMode(true) → Store updates
  → Components react to editMode change
  → Form fields become editable
```

### Delete Flow

```
User clicks Delete → confirm() → Confirmation dialog
  → User confirms → setDeleting(true) → router.delete()
    Success → setEditMode(false) → toast.success() → Redirect
    Error → setDeleting(false) → toast.error()
```

## Menu Structure

```
DropdownMenu
  ├─ DropdownMenuTrigger (Settings button)
  └─ DropdownMenuContent
      ├─ DropdownMenuGroup (Client Actions)
      │   ├─ DropdownMenuLabel "Client Actions"
      │   └─ DropdownMenuItem "Edit/Editing..."
      ├─ DropdownMenuSeparator
      └─ DropdownMenuGroup
          └─ DropdownMenuItem "Delete/Deleting..." (red)
```

## Trigger Button

```tsx
<Button variant="outline">
    <Settings icon />
    settings
</Button>
```

## Confirmation Dialog

### Delete Confirmation

- **Title**: "Confirm Delete"
- **Message**: "Are you sure you want to delete this client? This action cannot be undone."
- **Actions**: Cancel / Confirm

Rendered via `<ConfirmDialog />` component.

## Edit Mode Visual Feedback

```css
/* When editMode = true */
bg-zinc-100 font-bold dark:bg-zinc-800
```

Provides visual indication that edit mode is active.

## Error Handling

### Delete Errors

```typescript
onError: () => {
    setDeleting(false); // Re-enable button
    toast.error('Failed to delete client.');
};
```

User can retry after error.

## Disable States

### Delete Button

```typescript
disabled = { deleting };
```

Prevents multiple delete requests.

### Event Prevention

```typescript
onSelect={(e) => {
    e.preventDefault();  // Prevents dropdown from closing
    handleAction();
}}
```

## Navigation After Delete

```typescript
router.delete(`/clients/${client.id}`, {
    onSuccess: () => {
        // Inertia automatically redirects to clients list
        toast.success('Client has been deleted.');
    },
});
```

## Components Used

- Button
- DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
- ConfirmDialog (from useConfirmDialog hook)

## Icons Used

- Settings (lucide-react)

## Dependencies

- Inertia: router
- Store: useClientStore
- Hooks: useConfirmDialog
- Toast: sonner
- UI: Button, DropdownMenu components

## Usage Example

```typescript
import SettingButton from '@/components/clients/setting-button';

<SettingButton />
```

## Related

- [client-header.tsx](./CLIENT-HEADER.md)
- [show.tsx](../pages/clients/SHOW.md)
