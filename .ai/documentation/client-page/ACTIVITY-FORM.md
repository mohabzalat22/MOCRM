# Activity Form Component Documentation

## Overview
Comprehensive form for creating and editing client activities (notes, calls, emails, meetings, transactions). Supports type-specific fields, action items, and optimistic updates.

## File Location
`resources/js/components/clients/activity-form.tsx`

## Props
```typescript
interface AddActivityFormProps {
    clientId?: number | string;
    activity?: Activity;
    initialType?: ActivityType;
    onSuccess?: () => void;
}
```

## State Management

### Local State
```typescript
const [data, setData] = useState<ActivityFormData>({
    type: initialType || activity?.type || 'note',
    summary: activity?.summary || '',
    data: activity?.data || {},
});
const [processing, setProcessing] = useState(false);
const [actionItems, setActionItems] = useState<ActionItem[]>(
    activity?.data?.action_items || []
);
const [newActionItem, setNewActionItem] = useState('');
```

### Store Integration
```typescript
const { addActivityChange } = useClientStore();
```

## Activity Types

```typescript
type ActivityType = 'note' | 'call' | 'email' | 'meeting' | 'transaction';
```

### Type-Specific Fields

#### Call
- Duration (e.g., "15m")
- Outcome (Connected/Voicemail/No answer/Busy)
- Notes

#### Email
- Notes

#### Meeting
- Meeting Type (In-person/Video/Phone)
- Duration (e.g., "1h")
- Attendees (comma-separated names)
- Action Items (checklist)
- Notes

#### Transaction
- Transaction Type (Invoice Sent/Payment Received/Refund Issued)
- Amount (e.g., "$100.00")
- Notes

#### Note
- Notes (main content)

## Data Flow

### Type Selection
```
User clicks type button → handleTypeChange(type)
  → Update data.type
  → Reset summary and data if not editing same type
  → Reset action items
```

### Form Submission
```
User submits → submit(e)
  → e.preventDefault() / e.stopPropagation()
  → If activity exists: addActivityChange({ type: 'update', ... })
  → Else: addActivityChange({ type: 'create', ... })
  → Reset form (for new activities)
  → onSuccess()
```

### Data Update Helper
```typescript
updateData<K>(key: K, value: ActivityData[K]) {
    setData(prev => ({
        ...prev,
        data: { ...prev.data, [key]: value }
    }));
}
```

## Action Items Management

### Add Action Item
```typescript
const addActionItem = () => {
    const updated = [...actionItems, { text: newActionItem, completed: false }];
    setActionItems(updated);
    updateData('action_items', updated);
    setNewActionItem('');
};
```

### Toggle Action Item
```typescript
const toggleActionItem = (index: number) => {
    const updated = actionItems.map((item, i) =>
        i === index ? { ...item, completed: !item.completed } : item
    );
    setActionItems(updated);
    updateData('action_items', updated);
};
```

## Component Structure

### Type Selector
```typescript
{activityTypes.map(({ type, label, icon: Icon }) => (
    <Button
        variant={data.type === type ? 'default' : 'outline'}
        onClick={() => handleTypeChange(type)}
    >
        <Icon /> {label}
    </Button>
))}
```

### Universal Fields
- **Summary**: Subject/Title (required)
  - Placeholder changes based on type
  
- **Notes**: Additional details (optional)

### Type-Specific Sections
Conditional rendering based on `data.type`

## Form Layout

```
Card
  └─ CardContent
      └─ form (onSubmit=submit)
          ├─ Type selector buttons (5 types)
          ├─ Summary input (required)
          ├─ Type-specific fields
          │   ├─ Call: Duration, Outcome
          │   ├─ Meeting: Type, Duration, Attendees, Action Items
          │   └─ Transaction: Type, Amount
          ├─ Notes textarea (all types)
          └─ Submit button
```

## Icons by Type
- **Note**: FileText
- **Call**: Phone  
- **Email**: Mail
- **Meeting**: Users
- **Transaction**: CreditCard

## Data Transformations

### Form State to Activity Change
```typescript
{
    type: 'create' | 'update',
    activityId?: number,
    activityData: {
        type: ActivityType,
        summary: string,
        data: ActivityData
    }
}
```

### ActivityData Structure
```typescript
{
    duration?: string,
    outcome?: string,
    meeting_type?: string,
    attendees?: string,
    action_items?: ActionItem[],
    transaction_type?: string,
    amount?: string,
    notes?: string,
}
```

## Validation

### Required Fields
- Summary (all types)

### Conditional Required
- None enforced, but certain fields expected for types

### Input Validation
- No format validation (handled by backend)
- Action items must have text to add

## Event Handling

### Form Submission
```typescript
submit(e) {
    e.preventDefault();
    e.stopPropagation();  // Prevent bubbling to parent form
    setProcessing(true);
    
    addActivityChange({ ... });
    
    if (!activity) reset();  // Clear for new
    setProcessing(false);
    onSuccess?.();
}
```

### Enter Key on Action Items
```typescript
onKeyDown={(e) =>
    e.key === 'Enter' && (
        e.preventDefault(),
        addActionItem()
    )
}
```

## Optimistic Updates

Activity changes are queued in store, not submitted immediately:
```typescript
addActivityChange({
    type: 'create',
    activityData: { type, summary, data }
});
```

Actual submission happens when parent form is saved.

## Styling

### Type Buttons
- Active: `variant="default"` (filled)
- Inactive: `variant="outline"`
- Icon + label

### Form Fields
- Grid layouts for multi-field sections
- Responsive column counts
- Consistent spacing (gap-4)

### Action Items
- Checkbox + label layout
- Strike-through for completed
- Border container

## Components Used
- Card, CardContent
- Button
- Input
- Label
- Select
- Textarea
- Checkbox

## Dependencies
- Store: useClientStore
- UI: shadcn/ui components
- Icons: lucide-react
- Types: Activity, ActivityType, ActivityData, ActionItem

## Usage Example

```typescript
// Create new activity
<ActivityForm
    clientId={client.id}
    initialType="meeting"
    onSuccess={() => setDialogOpen(false)}
/>

// Edit existing activity
<ActivityForm
    activity={activity}
    onSuccess={() => setIsEditing(false)}
/>
```

## Related
- [activity-item.tsx](./ACTIVITY-ITEM.md)
- [client-activity-tab.tsx](./CLIENT-ACTIVITY-TAB.md)
- [show.tsx](../pages/clients/SHOW.md)
