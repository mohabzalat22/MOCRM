# Client Header Component Documentation

## Overview
Displays the client's header section with profile image, name, company, status, join date, quick actions, and settings button. Features a modern, responsive design with decorative elements.

## File Location
`resources/js/components/clients/client-header.tsx`

## Component Structure

```typescript
interface ClientHeaderProps {
    client: Client;
}

export default function ClientHeader({ client }: ClientHeaderProps)
```

## Props

### `client` (Client)
The client object containing all client information for display.

**Used Properties**:
- `name`: Client's full name
- `company_name`: Company name (optional)
- `created_at`: Account creation date

## Data Flow

```
client prop → Component renders → Child components receive context from store
```

## Components Used

### Custom Components
- **ClientImageUpload**: Profile image display and upload
- **QuickActions**: Action buttons (Call, Email, Add Activity, Schedule Meeting)
- **StatusButton**: Status dropdown/display
- **SettingButton**: Settings menu

### UI Components
- **Separator**: Visual divider between elements

## Layout Structure

```
div.relative (rounded container with gradient background)
  ├─ div.absolute (decorative background pattern)
  └─ div.relative (content container)
      ├─ ClientImageUpload (profile image)
      ├─ div.flex-1 (client information)
      │   ├─ div (Name and company)
      │   │   ├─ h1 (Client name)
      │   │   └─ p (Company name with bullet)
      │   ├─ div (Status and join date)
      │   │   ├─ StatusButton
      │   │   ├─ Separator
      │   │   └─ span (Join date)
      │   └─ QuickActions
      └─ SettingButton (absolute positioned)
```

## Data Transformations

### Date Formatting
```typescript
new Date(client.created_at).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
})
```

**Example**:
```
"2024-01-15T10:30:00Z" → "Mon, Jan 15, 2024"
```

## Styling Features

### 1. Gradient Background
```css
bg-linear-to-br from-card via-card to-muted/20
```
- Subtle gradient from card color to muted

### 2. Decorative Pattern
```css
bg-grid-pattern opacity-[0.02]
```
- Grid pattern overlay for texture
- Very low opacity for subtle effect

### 3. Responsive Layout
- **Mobile**: Centered, vertical stack
- **Tablet**: Horizontal layout (flex-row)
- **Desktop**: Larger spacing and text

```css
flex-col md:flex-row
items-center md:items-start
text-center md:text-left
gap-6 md:gap-8
```

### 4. Typography Scaling
```css
text-3xl md:text-4xl lg:text-5xl  // Client name
text-lg md:text-xl lg:text-2xl    // Company name
text-sm md:text-base              // Join date
```

### 5. Company Name Bullet
```css
h-1 w-1 md:h-1.5 md:w-1.5  // Responsive bullet size
bg-primary                   // Theme color
rounded-full                 // Circular shape
```

## Conditional Rendering

### Company Name Section
```typescript
{client.company_name && (
    <div className="flex items-center...">
        <div className="bullet" />
        <p>{client.company_name}</p>
    </div>
)}
```
Only displays if company_name exists.

### Separator
```css
className="hidden md:block"  // Only visible on medium+ screens
```

## Visual Hierarchy

### Primary
- **Client Name**: Largest (3xl-5xl), bold, high contrast

### Secondary  
- **Company Name**: Large (lg-2xl), semibold, muted color

### Tertiary
- **Status, Join Date**: Smaller (sm-base), muted color

## Responsive Behavior

### Mobile (< 768px)
- Vertical stack (flex-col)
- Centered alignment
- Centered text
- Smaller text sizes
- Smaller spacing (gap-6, p-6)

### Tablet (768px - 1024px)
- Horizontal layout (flex-row)
- Left-aligned text
- Medium text sizes
- Medium spacing (gap-8, p-8-10)

### Desktop (> 1024px)
- Larger text sizes
- Larger spacing
- Vertical separator visible

## Settings Button Position

```css
absolute top-4 right-4 md:relative md:top-0 md:right-0
```

- **Mobile**: Absolute positioned in top-right corner
- **Desktop**: Part of normal flow at the end

## Accessibility

### Semantic HTML
- `h1` for client name (main heading)
- `p` for company name
- Proper heading hierarchy

### Text Contrast
- High contrast for name
- Muted for secondary info
- Ensures readability

## Performance

### No State
Component is presentational - no local state management.

### Props Drilling
Relies on Zustand store accessed by child components (ClientImageUpload, StatusButton, etc.)

## Dependencies

- **Client Components**: ClientImageUpload, QuickActions, StatusButton, SettingButton
- **UI Components**: Separator
- **Types**: Client

## Usage Example

```typescript
import ClientHeader from '@/components/clients/client-header';

<ClientHeader client={client} />
```

## Related Components
- [client-image.tsx](./CLIENT-IMAGE.md) - Profile image
- [quick-actions.tsx](./QUICK-ACTIONS.md) - Action buttons
- [status-button.tsx](./STATUS-BUTTON.md) - Status control
- [setting-button.tsx](./SETTING-BUTTON.md) - Settings menu
- [show.tsx](../pages/clients/SHOW.md) - Parent page
