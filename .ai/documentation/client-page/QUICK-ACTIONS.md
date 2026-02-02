# Quick Actions Component Documentation

## Overview
Displays action buttons for quick interactions with a client (call, email, add activity, schedule meeting). Each button triggers appropriate actions.

## File Location
`resources/js/components/clients/quick-actions.tsx`

## Props
```typescript
interface QuickActionsProps {
    client: Client;
}
```

## State Management

### Store State
```typescript
const { setActivityDialogOpen, setActivityType } = useClientStore();
```

## Actions

### 1. Call
**Condition**: Only visible if `client.phone` exists

```typescript
const handlePhoneClick = () => {
    if (client.phone) {
        const cleanPhone = client.phone.replace(/[\s()-]/g, '');
        window.open(`tel:${cleanPhone}`);
    }
};
```

**Transformation**: `"(123) 456-7890"` → `"tel:1234567890"`

### 2. Email
**Condition**: Only visible if `client.email` exists

```typescript
const handleEmailClick = () => {
    if (client.email) {
        window.open(`mailto:${client.email}`);
    }
};
```

**Opens**: Default email client with recipient pre-filled

### 3. Add Activity
**Always visible**

```typescript
const openActivity = (type: ActivityType) => {
    setActivityType(type);
    setActivityDialogOpen(true);
};

onClick={() => openActivity('note')}
```

**Flow**: Sets activity type → Opens activity dialog

### 4. Schedule Meeting
**Always visible**

```typescript
onClick={() => openActivity('meeting')}
```

## Button Layout

```
div.flex.flex-wrap.gap-3
  ├─ Call button (if phone exists)
  ├─ Email button (if email exists)
  ├─ Add Activity button
  └─ Schedule Meeting button
```

## Styling

### Common Button Styles
- Variant: outline
- Size: sm
- Height: h-10
- Gap: gap-2
- Rounded: rounded-full
- Transition: duration-200

### Button-Specific Colors

#### Call Button
- Hover: Green theme
- Border: border-green-300
- Background: bg-green-50
- Text: text-green-700
- Dark: hover:border-green-800, bg-green-950/30, text-green-400

#### Email Button
- Hover: Blue theme
- Border: border-blue-300
- Background: bg-blue-50
- Text: text-blue-700
- Dark: Similar blue adjustments

#### Add Activity Button
- Hover: Purple theme
- Border: border-purple-300
- Background: bg-purple-50
- Text: text-purple-700
- Dark: Similar purple adjustments

#### Schedule Meeting Button
- Hover: Orange theme
- Border: border-orange-300
- Background: bg-orange-50
- Text: text-orange-700
- Dark: Similar orange adjustments

## Icons

- **Phone** (Call)
- **Mail** (Email)
- **Plus** (Add Activity)
- **Calendar** (Schedule Meeting)

All icons: h-4 w-4

## Responsive Behavior

```css
flex-wrap gap-3
```

Buttons wrap to new line on smaller screens while maintaining consistent spacing.

## Data Flow

### Call/Email
```
User clicks → Extract phone/email → window.open() → OS handles
```

### Activity Dialog
```
User clicks → setActivityType() → setActivityDialogOpen(true)
  → Dialog opens in parent (show.tsx)
  → ActivityForm renders with type pre-selected
```

## Accessibility

### Button Labels
- Descriptive text: "Call", "Email", "Add Activity", "Schedule Meeting"
- Icons provide visual reinforcement

### Keyboard Navigation
- All buttons keyboard accessible
- Focus styles via default button behavior

## Components Used
- Button (shadcn/ui)

## Icons Used
- Phone, Mail, Plus, Calendar (lucide-react)

## Dependencies
- Store: useClientStore
- UI: Button
- Icons: lucide-react
- Types: Client, ActivityType

## Usage Example

```typescript
import QuickActions from '@/components/clients/quick-actions';

<QuickActions client={client} />
```

## Related
- [client-header.tsx](./CLIENT-HEADER.md)
- [show.tsx](../pages/clients/SHOW.md)
- [activity-form.tsx](./ACTIVITY-FORM.md)
