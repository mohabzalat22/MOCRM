# Activity Item Component Documentation

## Overview
Displays a single activity in timeline format with type-specific rendering, edit/delete actions, and metadata. Part of the activity timeline.

## File Location
`resources/js/components/clients/activity-item.tsx`

## Props
```typescript
interface ActivityItemProps {
    activity: Activity;
}
```

## State Management

### Store State
```typescript
const { addActivityChange, editMode } = useClientStore();
```

### Local State
```typescript
const [isEditing, setIsEditing] = useState(false);
```

## Activity Display by Type

### Icon Mapping
```typescript
'call' → Phone (blue)
'email' → Mail (green)
'meeting' → Users (purple)
'transaction' → CreditCard (amber)
'note' → FileText (gray)
```

### Call
- Duration (Clock icon)
- Outcome (CheckCircle2 icon)

### Meeting
- Meeting Type (Video/MapPin icon)
- Duration (Clock icon)
- Attendees (Users icon)
- Action Items (checklist with completion status)

### Transaction
- Transaction Type (badge)
- Amount (emphasized)

### Note
- No special fields (just summary + notes)

## Data Flow

### Delete Flow
```
User clicks Delete → handleDelete()
  → addActivityChange({ type: 'delete', activityId })
  → Store marks for deletion
  → Optimistic removal from UI
```

### Edit Flow
```
User clicks Edit → setIsEditing(true) → Dialog opens
  → ActivityForm with activity prop
  → On submit → addActivityChange({ type: 'update', ... })
  → On success → setIsEditing(false) → Dialog closes
```

## Layout Structure

```
Dialog (for editing)
  ├─ div.relative (timeline item)
  │   ├─ Timeline line (vertical, connects to next item)
  │   ├─ Timeline node (circular icon badge)
  │   └─ div.group (activity content)
  │       ├─ Header
  │       │   ├─ Summary (bold)
  │       │   ├─ Timestamp
  │       │   ├─ User name
  │       │   └─ Actions dropdown (edit mode only)
  │       ├─ formatData() (type-specific display)
  │       └─ Notes (if present)
  └─ DialogContent (edit form)
```

## Timeline Styling

### Timeline Line
```css
position: absolute
left: 15px
width: 1px
background: border color
top: 24px to bottom
hidden on last item
```

### Timeline Node
```css
position: absolute
left: 0
top: 4px
8x8 circle
contains type icon
background: white
border + shadow
```

### Item Container
```css
padding-left: 32px (space for timeline)
padding-bottom: 32px (space between items)
last item: no bottom padding
```

## Type-Specific Rendering

### formatData() Function

Returns JSX based on activity.type:

#### Call
```tsx
<div className="flex gap-4">
    {data.duration && <Clock /> {data.duration}}
    {data.outcome && <CheckCircle2 /> {data.outcome}}
</div>
```

#### Meeting
```tsx
<div className="space-y-2">
    <div className="flex gap-3">
        {data.meeting_type && <Video|MapPin /> {data.meeting_type}}
        {data.duration && <Clock /> {data.duration}}
        {data.attendees && <Users /> {data.attendees}}
    </div>
    {data.action_items?.length > 0 && (
        <div className="border-l-2 pl-2">
            <p className="text-xs uppercase">Action Items</p>
            {data.action_items.map(item => (
                <div>
                    {item.completed ? <CheckCircle2 /> : <Circle />}
                    <span className={item.completed ? 'line-through' : ''}>
                        {item.text}
                    </span>
                </div>
            ))}
        </div>
    )}
</div>
```

#### Transaction
```tsx
<div className="flex gap-4">
    {data.transaction_type && (
        <Badge variant="amber">{data.transaction_type}</Badge>
    )}
    {data.amount && <span className="font-semibold">{data.amount}</span>}
</div>
```

## Date Formatting

```typescript
new Date(activity.created_at).toLocaleString([], {
    dateStyle: 'medium',
    timeStyle: 'short',
})
```

**Example**: "Jan 15, 2024, 2:30 PM"

## Actions Dropdown (Edit Mode Only)

```tsx
{editMode && (
    <DropdownMenu>
        <DropdownMenuTrigger>
            <MoreVertical /> {/* Visible on hover */}
        </DropdownMenuTrigger>
        <DropdownMenuContent>
            <DropdownMenuItem onClick={openEdit}>
                <Edit2 /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                <Trash2 /> Delete
            </DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>
)}
```

### Visibility
- Opacity 0 by default
- Opacity 100 on group hover
- Smooth transition

## Notes Display

If `activity.data?.notes` exists:

```tsx
<p className="mt-2 rounded-md border border-dashed bg-muted/30 p-2 whitespace-pre-wrap">
    {activity.data.notes}
</p>
```

## Edit Dialog

```tsx
<DialogContent className="sm:max-w-[500px]">
    <DialogHeader>
        <DialogTitle>Edit Activity</DialogTitle>
        <DialogDescription>Make changes...</DialogDescription>
    </DialogHeader>
    <ActivityForm
        clientId={activity.client_id}
        activity={activity}
        onSuccess={() => setIsEditing(false)}
    />
</DialogContent>
```

## Styling

### Typography
- Summary: text-sm, font-semibold
- Timestamp: text-xs, muted
- User: text-xs, muted
- Type-specific data: text-sm, muted (mostly)

### Spacing
- Main container: pb-8 (between items)
- Type data: mt-1 or mt-2
- Notes: mt-2

### Colors by Type
- Call: Blue (text-blue-500)
- Email: Green (text-green-500)
- Meeting: Purple (text-purple-500)
- Transaction: Amber (text-amber-500)
- Note: Gray (text-gray-500)

### Action Items
- Completed: CheckCircle2 (green)
- Incomplete: Circle (muted)
- Completed text: line-through, muted

## Accessibility
- Proper button roles
- Descriptive labels
- Keyboard accessible dropdowns

## Components Used
- Dialog, DialogContent, DialogHeader, etc.
- DropdownMenu, DropdownMenuItem
- Button
- ActivityForm

## Icons
- Type icons: Phone, Mail, Users, FileText, CreditCard
- Data icons: Clock, MapPin, Video, CheckCircle2, Circle
- Action icons: MoreVertical, Edit2, Trash2

## Dependencies
- Store: useClientStore
- UI: shadcn/ui components
- Icons: lucide-react
- Components: ActivityForm

## Related
- [activity-timeline.tsx](./ACTIVITY-TIMELINE.md)
- [activity-form.tsx](./ACTIVITY-FORM.md)
- [client-activity-tab.tsx](./CLIENT-ACTIVITY-TAB.md)
