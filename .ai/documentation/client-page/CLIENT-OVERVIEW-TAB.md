# Client Overview Tab Component Documentation

## Overview
Main overview tab displaying client contact information, custom fields, tags, and system information in a responsive grid layout.

## File Location
`resources/js/components/clients/client-overview-tab.tsx`

## Props
```typescript
interface ClientOverviewTabProps {
    client: Client;
}
```

## Layout Structure

### Grid Layout
```
div.grid.grid-cols-1.lg:grid-cols-3.gap-6
  ├─ Main Content (lg:col-span-2)
  │   ├─ Contact Information Card
  │   │   └─ ClientForm
  │   └─ Additional Details Card
  │       └─ CustomFieldsView
  └─ Sidebar (col-span-1)
      └─ Organization Card
          ├─ Tags section
          │   └─ TagInput
          ├─ Separator
          └─ System Info section
              ├─ Client ID
              └─ Last Updated
```

### Responsive Behavior
- **Mobile/Tablet**: Single column
- **Desktop (lg)**: 3-column grid (2:1 ratio)

## Sections

### 1. Contact Information (Main)
```tsx
<Card>
    <CardHeader>
        <CardTitle>Contact Information</CardTitle>
    </CardHeader>
    <CardContent>
        <ClientForm />
    </CardContent>
</Card>
```

Displays:
- Name
- Company Name
- Email
- Phone
- Website
- Address

### 2. Additional Details (Main)
```tsx
<Card>
    <CardHeader>
        <CardTitle>Additional Details</CardTitle>
    </CardHeader>
    <CardContent>
        <CustomFieldsView />
    </CardContent>
</Card>
```

Displays dynamic custom fields.

### 3. Organization (Sidebar)

#### Tags
```tsx
<div className="space-y-2">
    <h3 className="text-sm font-medium text-muted-foreground">
        Tags
    </h3>
    <TagInput />
</div>
```

#### System Info
```tsx
<div className="space-y-3">
    <h3>System Info</h3>
    <div className="flex justify-between">
        <span>ID</span>
        <span className="font-mono">#{client.id}</span>
    </div>
    <div className="flex justify-between">
        <span>Updated</span>
        <span>{formattedDate}</span>
    </div>
</div>
```

## Data Transformations

### Date Formatting
```typescript
new Date(client.updated_at).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
})
```

**Example**: "Mon, Jan 15, 2024"

## Styling

### Card Styling
- Default card styles
- Consistent spacing (gap-6)

### Typography
- Section headers: text-sm, font-medium, muted
- Labels: text-sm, muted
- Values: Default or font-mono (ID)

### System Info Layout
- flex justify-between for label/value pairs
- Vertical spacing (space-y-3)

## Components Used

### Custom Components
- ClientForm
- CustomFieldsView
- TagInput

### UI Components
- Card, CardHeader, CardTitle, CardContent
- Separator

## Data Flow

```
client prop → Pass to components via context (store) or direct prop
```

## Accessibility
- Proper heading hierarchy
- Semantic HTML structure
- Clear labels for all sections

## Dependencies
- Components: ClientForm, CustomFieldsView, TagInput
- UI: shadcn/ui Card components
- Types: Client

## Usage Example

```typescript
import ClientOverviewTab from '@/components/clients/client-overview-tab';

<ClientOverviewTab client={client} />
```

## Related
- [client-form.tsx](./CLIENT-FORM.md)
- [custom-fields-view.tsx](./CUSTOM-FIELDS-VIEW.md)
- [tag-input.tsx](./TAG-INPUT.md)
- [show.tsx](../pages/clients/SHOW.md)
