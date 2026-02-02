# Save Button Footer Component Documentation

## Overview
A sticky footer component that appears at the bottom of the screen in edit mode, providing save and cancel actions.

## File Location
`resources/js/components/clients/save-button-footer.tsx`

## Props

```typescript
interface SaveButtonFooterProps {
    isSaving: boolean;
    onCancel: () => void;
}
```

### `isSaving` (boolean)
Indicates whether a save operation is in progress. Disables buttons and shows "Saving..." text.

### `onCancel` (function)
Callback function executed when cancel button is clicked. Typically resets form to original values.

## Layout

```
div.fixed.bottom-6 (sticky positioning)
  └─ div.flex.w-full.max-w-2xl (container)
      ├─ Cancel button
      └─ div.flex (right side)
          ├─ "Saving..." text (conditional)
          └─ Save button
```

## Styling

### Container
```css
/* Outer container */
fixed right-0 bottom-6 left-0  /* Sticky at bottom */
z-50                            /* Above other content */
flex justify-center             /* Center horizontally */
px-4                            /* Horizontal padding */

/* Inner container */
w-full max-w-2xl               /* Max width constraint */
flex items-center justify-between
gap-4                           /* Space between elements */
rounded-lg border               /* Rounded with border */
bg-background                   /* Theme background */
p-4                            /* Padding */
shadow-lg                       /* Drop shadow */
```

### Positioning
- Fixed to bottom of viewport
- Bottom offset: 24px (bottom-6)
- Horizontally centered
- Maximum width: 672px (max-w-2xl)

## Buttons

### Cancel Button
```tsx
<Button
    variant="outline"
    type="button"
    onClick={onCancel}
    disabled={isSaving}
>
    Cancel
</Button>
```

**Behavior**:
- Calls `onCancel()` prop
- Disabled during save operation
- Type="button" (doesn't submit form)

### Save Button
```tsx
<Button 
    type="submit" 
    disabled={isSaving}
>
    Save Changes
</Button>
```

**Behavior**:
- Type="submit" (triggers form submission)
- Disabled during save operation
- Parent form handles actual submission

## Saving Indicator

```tsx
{isSaving && (
    <span className="text-sm text-muted-foreground">
        Saving...
    </span>
)}
```

Appears between Cancel and Save buttons when `isSaving = true`.

## Data Flow

### Cancel Flow
```
User clicks Cancel → onCancel() → Parent resets form
  → Edit mode may exit → Footer disappears
```

### Save Flow
```
User clicks Save → Form submit event
  → Parent handles submission (useClientSubmit)
  → isSaving becomes true → Buttons disabled + "Saving..." shown
  → On success: isSaving becomes false → Footer disappears (editMode exits)
  → On error: isSaving becomes false → Footer stays visible
```

## Visibility

This component is only rendered when:
```typescript
{editMode && <SaveButtonFooter ... />}
```

From parent (show.tsx).

## Responsive Behavior

### Mobile
- Full width minus padding (px-4)
- Buttons may stack if too narrow

### Desktop
- Constrained to max-w-2xl
- Buttons side-by-side
- Centered in viewport

## Accessibility

### Keyboard Navigation
- Tab order: Cancel → Save
- Enter on Save submits form
- Escape (handled by parent) cancels

### Screen Readers
- "Saving..." text announced when visible
- Button states (disabled) announced

## Z-Index

```css
z-50
```

Ensures footer stays above most other content but below modals (typically z-50+).

## Components Used
- Button (shadcn/ui)

## Dependencies
- UI: Button component

## Usage Example

```typescript
import SaveButtonFooter from '@/components/clients/save-button-footer';

{editMode && (
    <SaveButtonFooter
        isSaving={isSaving}
        onCancel={resetForm}
    />
)}
```

## Related
- [show.tsx](../pages/clients/SHOW.md) - Parent component
- [client-form.tsx](./CLIENT-FORM.md) - Form being saved
