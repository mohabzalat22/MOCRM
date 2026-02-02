# Client Show/Detail Page Documentation

## Overview
The client detail page displays comprehensive information about a single client, including contact information, custom fields, tags, and activity history. It supports inline editing with optimistic UI updates.

## File Location
`resources/js/pages/clients/show.tsx`

## Component Structure

```typescript
interface ClientPageProps {
    client: Client;
    allTags?: Tag[];
    activities?: Activity[];
}
```

## Props

### `client` (Client)
The main client object containing all client information.

### `allTags` (Tag[], optional)
Array of all available tags in the system for tag selection. Defaults to empty array.

### `activities` (Activity[], optional)
Array of activity records associated with this client. Defaults to empty array.

## Data Flow

### 1. Server to Client (Initial Load)
```
Backend → Inertia Response → Page Props → Initialize Store
```

### 2. Store Initialization
```
useEffect → initialize(client, allTags) → useClientStore state updated
```

### 3. Edit Mode Flow
```
User clicks "Edit" → setEditMode(true) → Components show edit UI
User modifies fields → updateFormData() → Store tracks changes
User clicks "Save" → confirm() → submitClient() → API calls
```

### 4. Activity Management
```
User clicks "Add Activity" → setActivityDialogOpen(true) → ActivityForm
Form submission → addActivityChange() → Store tracks pending changes
Main save → Activities submitted to API
```

## State Management

### Global State (Zustand Store)
The component uses `useClientStore` for centralized state management:

```typescript
const {
    initialize,        // Initialize store with client data
    editMode,         // Boolean: is editing active
    resetForm,        // Reset form to original values
    isSaving,         // Boolean: is save in progress
    activityDialogOpen, // Boolean: activity dialog visibility
    activityType,     // ActivityType: current activity type
    setActivityDialogOpen, // Function to control dialog
} = useClientStore();
```

### Local State
```typescript
const { confirm, ConfirmDialog } = useConfirmDialog(); // Confirmation dialogs
const { submitClient } = useClientSubmit(); // Submission handler
```

## Hooks Used

### 1. useClientStore (Zustand)
**Purpose**: Centralized client data and UI state management

**State Properties**:
- `client`: Current client object
- `allTags`: Available tags
- `formData`: Editable form data
- `editMode`: Edit mode flag
- `isSaving`: Save in progress flag
- `changedFields`: Tracks field changes
- `tagChanges`: Tracks tag additions/removals
- `activityChanges`: Tracks activity changes
- `image`: Image preview URL
- `activityDialogOpen`: Activity dialog state
- `activityType`: Current activity type

**Actions**:
- `initialize(client, allTags)`: Set up initial state
- `resetForm()`: Discard changes and reset to original
- `updateFormData(key, value)`: Update a form field
- `setEditMode(bool)`: Toggle edit mode
- `setActivityDialogOpen(bool)`: Control activity dialog
- `setActivityType(type)`: Set activity type

### 2. useClientSubmit (Custom Hook)
**Purpose**: Handle complex client update logic

**Returns**:
- `submitClient()`: Function to submit all pending changes

**Internal Flow**:
```typescript
submitClient() {
    1. Validate changes exist
    2. Submit client field changes (if any)
    3. Submit custom field changes (if any)
    4. Submit tag changes (add/remove)
    5. Submit activity changes (create/update/delete)
    6. Reset store state on success
}
```

### 3. useConfirmDialog (Custom Hook)
**Purpose**: Show confirmation dialogs before destructive actions

**Returns**:
- `confirm(callback, options)`: Show dialog and execute callback
- `ConfirmDialog`: Dialog component to render

### 4. useEffect (React)
**Purpose**: Initialize store when client/tags props change

```typescript
useEffect(() => {
    initialize(client, allTags);
}, [client, allTags, initialize]);
```

## Components Used

### Layout Components
- **AppLayout**: Main page layout with breadcrumbs
- **Head**: Document head management (title)

### Client Information Components
- **ClientHeader**: Profile image, name, status, quick actions
- **ClientOverviewTab**: Contact info, custom fields, tags
- **ClientActivityTab**: Activity timeline

### Form Components
- **SaveButtonFooter**: Sticky footer with save/cancel buttons (shows only in edit mode)
- **ActivityForm**: Form for creating/editing activities

### UI Components
- **Tabs/TabsContent/TabsList/TabsTrigger**: Tab navigation
- **Dialog**: Activity creation/editing modal
- **ConfirmDialog**: Confirmation dialogs

## Tabs Structure

### Overview Tab
```
ClientOverviewTab
  ├─ ClientForm (contact information)
  ├─ CustomFieldsView (custom fields)
  └─ TagInput (tags management)
```

### Activity Tab
```
ClientActivityTab
  └─ ActivityTimeline
      └─ ActivityItem[] (activity records)
```

## Form Submission Flow

### 1. User Initiates Save
```typescript
onSubmit(e) {
    e.preventDefault();
    confirm(() => submitClient(), {
        title: 'Confirm Update',
        message: 'Are you sure...?'
    });
}
```

### 2. Confirmation Dialog
User sees confirmation dialog. On confirm:

### 3. Submit Process
```typescript
submitClient() {
    // Check for changes
    if (hasFieldChanges) → POST /clients/{id}
    if (hasCustomFieldChanges) → POST /clients/{id}/custom-fields
    if (hasTagChanges) {
        tagsToAdd → POST /clients/{id}/tags/attach
        tagsToRemove → POST /clients/{id}/tags/detach
    }
    if (hasActivityChanges) {
        creates → POST /clients/{id}/activities
        updates → PUT /clients/{id}/activities/{id}
        deletes → DELETE /clients/{id}/activities/{id}
    }
}
```

### 4. Post-Submission
```
Success → Reset store → Exit edit mode → Show success toast
Error → Keep edit mode → Show error toast
```

## Data Transformations

### Client to Form Data
```typescript
initialize(client, allTags) {
    formData = {
        name: client.name ?? '',
        company_name: client.company_name ?? '',
        email: client.email ?? '',
        phone: client.phone ?? '',
        website: client.website ?? '',
        address: client.address ?? '',
        image: null,
        custom_fields: client.custom_fields || [],
        status: client.status ?? '',
    }
}
```

### Change Tracking
```typescript
updateFormData(key, value) {
    // Update form data
    formData[key] = value;
    
    // Track change if different from original
    if (value !== client[key]) {
        changedFields[key] = value;
    } else {
        delete changedFields[key];
    }
}
```

### Optimistic UI Updates
Activities show pending changes immediately:
```typescript
// In ClientActivityTab
displayActivities = [
    ...newActivities (isPending: true),
    ...updatedActivities (isPending: true),
    ...existingActivities (filtered by deletions)
]
```

## Breadcrumbs Configuration

```typescript
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Clients',
        href: '/clients',
    },
    {
        title: client.name,
        href: `/clients/${client.id}`,
    },
];
```

## Activity Dialog Flow

### Opening Dialog
```typescript
// From QuickActions component
setActivityType('meeting');
setActivityDialogOpen(true);
```

### Form Submission
```typescript
// In ActivityForm
submit() {
    addActivityChange({
        type: 'create',
        activityData: { type, summary, data }
    });
    setActivityDialogOpen(false);
}
```

### Saving to Server
Changes are queued until main form save.

## Key Features

1. **Tabbed Interface**: Overview and Activity tabs
2. **Inline Editing**: Edit mode with change tracking
3. **Optimistic UI**: Immediate feedback on changes
4. **Confirmation Dialogs**: Prevent accidental changes
5. **Activity Management**: Add/edit/delete activities
6. **Tag Management**: Add/remove tags with autocomplete
7. **Custom Fields**: Dynamic key-value pairs
8. **Image Upload**: Profile image with preview

## Error Handling

```typescript
// In useClientSubmit
onError: (errors) => {
    toast.error('Failed to update client');
    // Keep edit mode active
    // Allow user to retry or cancel
}
```

## Performance Optimizations

1. **Memoization**: useMemo in child components
2. **Lazy Evaluation**: Changes only tracked when in edit mode
3. **Batched Updates**: All changes submitted together
4. **Optimistic UI**: Immediate feedback without waiting

## Dependencies

- **@inertiajs/react**: SSR and routing
- **zustand**: Global state management
- **lucide-react**: Icons
- **Custom hooks**: `useClientStore`, `useClientSubmit`, `useConfirmDialog`
- **UI components**: shadcn/ui components
- **Types**: Client, Activity, Tag, BreadcrumbItem

## Related Components
- [index.tsx](./INDEX.md) - Client list page
- [ClientHeader](../components/clients/CLIENT-HEADER.md) - Header section
- [ClientOverviewTab](../components/clients/CLIENT-OVERVIEW-TAB.md) - Overview tab
- [ClientActivityTab](../components/clients/CLIENT-ACTIVITY-TAB.md) - Activity tab
