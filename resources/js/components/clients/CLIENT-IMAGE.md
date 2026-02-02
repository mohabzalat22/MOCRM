# Client Image Upload Component Documentation

## Overview

Handles client profile image display, upload, preview, and removal with support for edit mode.

## File Location

`resources/js/components/clients/client-image.tsx`

## Props

None - uses `useClientStore`

## State Management

### Store State

```typescript
const { image, editMode, setImage, updateFormData } = useClientStore();
```

### Local State

```typescript
const inputRef = useRef<HTMLInputElement>(null);
const [isHovered, setIsHovered] = useState(false);
```

## Hooks Used

### useClientStore

- `image`: Image preview URL (base64 or server URL)
- `editMode`: Edit mode flag
- `setImage()`: Update preview
- `updateFormData()`: Track changes

### useEffect

Resets file input when edit mode disabled:

```typescript
useEffect(() => {
    if (!editMode && inputRef.current) {
        inputRef.current.value = '';
    }
}, [editMode]);
```

## Data Flow

### Upload Flow

```
User selects file → handleFileSelect()
  → updateFormData('image', file)  // Track change
  → FileReader.readAsDataURL(file)
  → setImage(base64)  // Preview
```

### Remove Flow

```
User clicks X → handleRemoveImage()
  → setImage(null)
  → updateFormData('image', '')  // Signal removal
  → Clear input
```

## States & Rendering

### 1. Image Exists

#### View Mode

- Display image (circular, 192x192 lg:224x224)
- No interaction

#### Edit Mode

- Display image with hover overlay
- Upload icon on hover
- Remove button (X) in top-right
- Click image to change

### 2. No Image

#### View Mode

- Gray dashed circle
- Camera icon
- No interaction

#### Edit Mode

- Gray dashed circle
- Camera icon
- Hover effects (border-primary, scale)
- "Upload" text
- Click to upload

## Event Handlers

### handleFileSelect

```typescript
const file = e.target.files?.[0];
updateFormData('image', file); // File for upload
const reader = new FileReader();
reader.onload = () => setImage(result); // Preview
reader.readAsDataURL(file);
```

### handleRemoveImage

```typescript
setImage(null);
updateFormData('image', ''); // Empty string signals deletion
inputRef.current.value = '';
```

### handleClick

```typescript
if (editMode) {
    inputRef.current?.click();
}
```

## Styling

### Dimensions

- Default: h-48 w-48
- Large: lg:h-56 lg:w-56

### Image Styling

- Circular (rounded-full)
- Border (border-4 border-background)
- Shadow (shadow-xl)
- Ring (ring-2 ring-border)
- Object-fit: cover

### Hover Effects (Edit Mode)

- Ring changes to primary/50
- Dark overlay with upload icon
- Scale animation on remove button

### Placeholder Styling

- Dashed border (border-dashed)
- Muted background (bg-muted/50)
- Camera icon (h-12 w-12)
- Hover: border-primary, bg-muted

## Accepted File Types

```
image/png, image/jpg, image/jpeg, image/webp
```

## Data Transformations

### File to Preview

```
File object → FileReader → Base64 string → Image src
```

### File for Upload

```
File object → Store changedFields → FormData → Backend
```

### Removal Signal

```
null → '' (empty string) → Backend interprets as delete
```

## Accessibility

- Proper ARIA labels
- Keyboard navigable (tabIndex when editMode)
- Role="button" on clickable areas
- SR-only text for remove button

## Dependencies

- Icons: Camera, Upload, X (lucide-react)
- UI: Button
- Utils: cn (class names)
- Store: useClientStore

## Related

- [client-header.tsx](./CLIENT-HEADER.md)
- [show.tsx](../pages/clients/SHOW.md)
