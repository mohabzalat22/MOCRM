# Activity Timeline Component Documentation

## Overview
Container component that displays a vertical timeline of activities. Shows empty state when no activities exist.

## File Location
`resources/js/components/clients/activity-timeline.tsx`

## Props
```typescript
interface ActivityTimelineProps {
    activities: Activity[];
}
```

## Rendering Logic

### Empty State
```typescript
if (!activities || activities.length === 0) {
    return (
        <Card className="border-dashed">
            <CardContent>
                <History icon (opacity-20, large) />
                <p>No activity recorded yet.</p>
            </CardContent>
        </Card>
    );
}
```

### Activities Display
```typescript
<Card className="border-none shadow-none bg-transparent">
    <CardHeader>
        <CardTitle>
            <History icon /> Activity Timeline
        </CardTitle>
    </CardHeader>
    <CardContent>
        {activities.map(activity => (
            <ActivityItem key={activity.id} activity={activity} />
        ))}
    </CardContent>
</Card>
```

## Data Flow

```
activities prop → map → ActivityItem components
```

## Layout Structure

```
Card
  ├─ CardHeader
  │   └─ CardTitle (History icon + "Activity Timeline")
  └─ CardContent
      └─ div.flex-col
          └─ ActivityItem[] (timeline items)
```

## Styling

### Container
- No border (border-none)
- No shadow (shadow-none)
- Transparent background (bg-transparent)
- Zero horizontal padding (px-0)
- Zero top padding (pt-0)

### Empty State
- Dashed border
- Centered content (flex-col, items-center)
- Large History icon with low opacity
- Muted text

## Components Used
- Card, CardHeader, CardTitle, CardContent
- ActivityItem (for each activity)
- History icon (lucide-react)

## Dependencies
- UI: shadcn/ui Card components
- Icons: History (lucide-react)
- Components: ActivityItem
- Types: Activity

## Usage Example

```typescript
import ActivityTimeline from '@/components/clients/activity-timeline';

<ActivityTimeline activities={activities} />
```

## Related
- [activity-item.tsx](./ACTIVITY-ITEM.md)
- [client-activity-tab.tsx](./CLIENT-ACTIVITY-TAB.md)
