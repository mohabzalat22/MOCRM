# Client Dialog Component Documentation

## Overview
A modal dialog component for creating new clients. Handles form input, image upload, and submission to the backend via Inertia.js.

## File Location
`resources/js/components/clients/dialog.tsx`

## Component Structure

```typescript
export function ClientDialog()
```

No props - component manages its own state.

## State Management

### Local State

```typescript
const [image, setImage] = useState<string | null>(null);
const [isDialogOpen, setDialogOpen] = useState(false);
```

**`image`**: Base64 preview of uploaded image
**`isDialogOpen`**: Controls dialog visibility

### Form State (useForm from Inertia)

```typescript
const { data, setData, post, processing, reset } = useForm({
    name: '',
    company_name: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    image: null as File | null,
});
```

## Hooks Used

### 1. useForm (Inertia.js)
**Purpose**: Manage form data and submission

**Returns**:
- `data`: Current form values
- `setData(key, value)`: Update a form field
- `post(url, options)`: Submit form via POST
- `processing`: Boolean indicating submission in progress
- `reset()`: Clear form to initial values

### 2. useState (React)
**Purpose**: Local component state for image preview and dialog visibility

### 3. useRef (React)
**Purpose**: Reference to file input element for programmatic clicks

```typescript
const inputRef = useRef<HTMLInputElement | null>(null);
```

## Data Flow

### 1. User Opens Dialog
```
User clicks "Add New Client" → setDialogOpen(true) → Dialog opens
```

### 2. Form Input
```
User types → setData(key, value) → Update form state
```

### 3. Image Upload
```
User clicks camera icon → inputRef.current.click() → File dialog
User selects file → handleFileChange()
  → setData('image', file) (for submission)
  → FileReader.readAsDataURL() → setImage(base64) (for preview)
```

### 4. Form Submission
```
User clicks "Save" → handleSubmit() → e.preventDefault()
→ post('/clients', { forceFormData: true })
  Success → toast.success() → reset() → setImage(null) → setDialogOpen(false)
  Error → toast.error(message) → Dialog stays open
```

## Form Fields

### Required Fields
1. **Name** (required)
   - Type: text
   - Validation: Required (marked with red asterisk)

2. **Email** (required)
   - Type: email
   - Validation: Required (marked with red asterisk)

### Optional Fields
3. **Company Name**
   - Type: text

4. **Phone**
   - Type: text

5. **Website**
   - Type: text

6. **Address**
   - Type: text

7. **Image**
   - Type: file
   - Accepts: image/png, image/jpg, image/jpeg, image/webp

## Data Transformations

### Image Processing
```typescript
handleFileChange(e) {
    const file = e.target.files?.[0];
    
    // Store file for submission
    setData('image', file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
        setImage(reader.result as string); // base64 string
    };
    reader.readAsDataURL(file);
}
```

**Transformation**:
```
File object → FileReader → Base64 string → Preview image
File object → FormData → Backend
```

### Form Data Submission
```typescript
post('/clients', {
    forceFormData: true, // Ensures multipart/form-data encoding
    onSuccess: () => { /* ... */ },
    onError: (errors) => { /* ... */ },
});
```

**Data Format**:
```
FormData {
    name: string,
    company_name: string,
    email: string,
    phone: string,
    website: string,
    address: string,
    image: File | null
}
```

## Event Handlers

### handleSubmit
```typescript
const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    post('/clients', {
        forceFormData: true,
        onSuccess: () => {
            toast.success('Client has been created.');
            reset();
            setImage(null);
            setDialogOpen(false);
        },
        onError: (errors) => {
            // Display all validation errors
            if (errors && Object.keys(errors).length > 0) {
                Object.values(errors).forEach((message) => {
                    if (typeof message === 'string') {
                        toast.error(message);
                    }
                });
            } else {
                toast.error('An error occurred while creating the client.');
            }
        },
    });
};
```

### handleFileChange
```typescript
const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        setData('image', file);
        const reader = new FileReader();
        reader.onload = () => {
            setImage(reader.result as string);
        };
        reader.readAsDataURL(file);
    }
};
```

## Components Used

### UI Components
- **Dialog/DialogTrigger/DialogContent**: Modal dialog
- **DialogHeader/DialogTitle/DialogDescription**: Dialog header
- **DialogFooter/DialogClose**: Dialog footer with actions
- **Button**: Submit and cancel buttons
- **Input**: Form input fields
- **Label**: Field labels

### Icons
- **Camera**: Image upload placeholder

## Layout Structure

```
Dialog
  ├─ DialogTrigger (Button "Add New Client")
  └─ DialogContent
      └─ form (onSubmit=handleSubmit)
          ├─ DialogHeader
          │   ├─ DialogTitle "Add New Client"
          │   └─ DialogDescription
          ├─ div.grid (Form fields)
          │   ├─ Image upload area
          │   │   ├─ If image: img (clickable to change)
          │   │   └─ Else: Camera icon placeholder
          │   ├─ Name input (required)
          │   ├─ Company Name input
          │   ├─ Email input (required)
          │   ├─ Phone input
          │   ├─ Website input
          │   └─ Address input
          └─ DialogFooter
              ├─ DialogClose (Cancel button)
              └─ Button (Submit, disabled while processing)
```

## Image Upload UI

### No Image State
```typescript
<div className="camera-placeholder" onClick={() => inputRef.current?.click()}>
    <Camera className="h-10 w-10 text-white" />
</div>
```
- Gray circular background
- Camera icon centered
- Click to open file dialog

### Image Selected State
```typescript
<img
    src={image}
    alt="client image"
    onClick={() => inputRef.current?.click()}
    className="h-60 w-60 cursor-pointer rounded-full object-cover"
/>
```
- Circular preview (60x60 on mobile, larger on desktop)
- Object-fit: cover (maintains aspect ratio)
- Click to change image

### Hidden File Input
```typescript
<input
    type="file"
    accept="image/png, image/jpg, image/jpeg, image/webp"
    onChange={handleFileChange}
    ref={inputRef}
    className="hidden"
/>
```

## Validation

### Client-Side
- Required fields marked with red asterisk (*)
- File type restrictions (images only)

### Server-Side
Error handling displays backend validation messages:
```typescript
onError: (errors) => {
    Object.values(errors).forEach((message) => {
        toast.error(message);
    });
}
```

## Success/Error Handling

### Success Flow
```typescript
onSuccess: () => {
    toast.success('Client has been created.');
    reset();              // Clear form
    setImage(null);       // Clear image preview
    setDialogOpen(false); // Close dialog
}
```

### Error Flow
```typescript
onError: (errors) => {
    // Show each error as a toast
    Object.values(errors).forEach((message) => {
        toast.error(message);
    });
    // Dialog stays open for corrections
}
```

## Styling

### Responsive Design
- **Mobile**: max-w-[425px]
- **Desktop**: max-w-[800px]
- Grid layout adjusts for screen size

### Form Container
- Scrollable content area (max-h-[50vh])
- Custom scrollbar hiding (no-scrollbar class)
- Padding for spacing

### Image Sizes
- Mobile: h-30 w-30 (camera), h-60 w-60 (preview)
- Desktop: h-50 w-50 (camera), h-60 w-60 (preview)

## Accessibility

### Form Labels
- All inputs have associated labels
- Required fields clearly marked

### File Input
- Hidden but programmatically accessible
- Visual trigger (camera icon) is clickable

### Keyboard Navigation
- Dialog supports Escape key to close
- Form supports Enter to submit
- Tab navigation through fields

## Dependencies

- **@inertiajs/react**: Form handling and submission
- **lucide-react**: Icons
- **sonner**: Toast notifications
- **shadcn/ui**: Dialog and form components

## Usage Example

```typescript
import { ClientDialog } from '@/components/clients/dialog';

// In parent component
<ClientDialog />
```

## Error Messages

Common validation errors from backend:
- "The name field is required."
- "The email field is required."
- "The email must be a valid email address."
- "The image must be an image file."
- "The image may not be greater than 2048 kilobytes."

## Performance Notes

### Image Preview
FileReader is asynchronous - preview updates after file is read.

### Form Submission
`forceFormData: true` ensures proper multipart encoding for file upload.

## Related Components
- [index.tsx](../pages/clients/INDEX.md) - Parent page that uses this dialog
- [DataTable.tsx](./DATATABLE.md) - Table that displays created clients
