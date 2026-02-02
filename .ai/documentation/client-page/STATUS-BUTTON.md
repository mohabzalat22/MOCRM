# Status Button Component Documentation

## Overview
Displays and manages the client's status with a dropdown selector in edit mode. Shows status badge in view mode.

## File Location
`resources/js/components/clients/status-button.tsx`

## Props
```typescript
interface StatusButtonProps {
    className?: string;
}
```

## State Management

### Store State
```typescript
const { editMode, formData, updateFormData } = useClientStore();
const status = formData.status;
```

## Status Enum

```typescript
enum Status {
    ACTIVE = 'Active',
    LEAD = 'Lead',
    AT_RISK = 'At Risk',
    IN_ACTIVE = 'In Active',
}
```

## Rendering Modes

### View Mode (editMode = false)

```tsx
<div className="flex items-center gap-2 rounded-full border bg-muted/50 px-3 py-1">
    <StatusDot color={getColorByStatus(status)} />
    {status}
</div>
```

**Appearance**: Badge-like display with colored dot and status text

### Edit Mode (editMode = true)

```tsx
<DropdownMenu>
    <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
            <StatusDot color={getColorByStatus(status)} />
            {status}
        </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent>
        {Object.values(Status).map(status => (
            <DropdownMenuItem onClick={() => handleSelect(status)}>
                <StatusDot color={getColorByStatus(status)} />
                {status}
            </DropdownMenuItem>
        ))}
    </DropdownMenuContent>
</DropdownMenu>
```

**Appearance**: Clickable button that opens dropdown

## Status Colors

```typescript
Status.ACTIVE → Green (bg-green-500)
Status.LEAD → Yellow (bg-yellow-500)
Status.AT_RISK → Red (bg-red-500)
Status.IN_ACTIVE → Slate (bg-slate-500)
```

### Status Dot
```css
h-2 w-2 rounded-full bg-{color}-500
```

## Data Flow

### Display
```
formData.status → Component renders → Color + text
```

### Update
```
User selects status → handleSelect(newStatus)
  → updateFormData('status', newStatus)
  → Store updates → Component re-renders
```

## Event Handlers

### handleSelect
```typescript
const handleSelect = (newStatus: string) => {
    updateFormData('status', newStatus);
};
```

Updates store which tracks the change.

## Styling

### View Mode Badge
```css
flex items-center gap-2
rounded-full
border
bg-muted/50
px-3 py-1
text-xs font-medium
```

### Edit Mode Button
```css
h-8
gap-2
rounded-full
variant: outline
size: sm
```

### Dropdown Items
```css
gap-2  (between dot and text)
```

## Status Meanings

1. **Active**: Currently engaged client
2. **Lead**: Potential client, not yet converted
3. **At Risk**: Client showing warning signs
4. **In Active**: Not currently active

## Components Used
- Button
- DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem

## Utilities Used
- `cn()`: Class name utility

## Dependencies
- Store: useClientStore
- UI: Button, DropdownMenu components
- Utils: cn (class names)

## Usage Example

```typescript
import StatusButton from '@/components/clients/status-button';

<StatusButton />

// Or with custom className
<StatusButton className="custom-class" />
```

## Related
- [client-header.tsx](./CLIENT-HEADER.md)
- [show.tsx](../pages/clients/SHOW.md)
