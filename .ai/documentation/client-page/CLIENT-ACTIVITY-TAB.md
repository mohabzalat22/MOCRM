# Client Activity Tab Component Documentation

## Overview
Manages the activity tab display with optimistic UI updates. Merges server activities with pending changes for immediate visual feedback.

## File Location
`resources/js/components/clients/client-activity-tab.tsx`

## Props
```typescript
interface ClientActivityTabProps {
    activities: Activity[];
}
```

## State Management

### Store State
```typescript
const activityChanges = useClientStore((state) => state.activityChanges);
```

### Derived State
```typescript
const displayActivities = useMemo(
    () => mergeActivitiesWithChanges(activities, activityChanges),
    [activities, activityChanges]
);
```

## Data Flow

### Optimistic UI Updates
```
Server activities + Store changes → mergeActivitiesWithChanges() → displayActivities
  → ActivityTimeline → ActivityItem components
```

## Core Functions

### generateTempId()
```typescript
function generateTempId(): number {
    return Date.now() + Math.random();
}
```
Creates unique temporary IDs for pending activities.

### mergeActivitiesWithChanges()

**Purpose**: Merge server activities with pending changes

**Process**:
1. Collect IDs marked for deletion
2. Filter out deleted activities
3. Apply updates to existing activities
4. Create pending activity objects for new activities
5. Return merged array (new first, then updated/existing)

```typescript
function mergeActivitiesWithChanges(
    activities: Activity[],
    activityChanges: ActivityChange[]
): DisplayActivity[]
```

**Steps**:

#### 1. Track Deletions
```typescript
const deletedIds = new Set(
    activityChanges
        .filter(change => change.type === 'delete')
        .map(change => change.activityId)
);
```

#### 2. Apply Updates & Filter Deletions
```typescript
const updatedActivities = activities
    .filter(activity => !deletedIds.has(activity.id))
    .map(activity => {
        const updateChange = activityChanges.find(
            change => change.type === 'update' && 
                     change.activityId === activity.id
        );
        
        if (updateChange?.activityData) {
            return {
                ...activity,
                type: updateChange.activityData.type,
                summary: updateChange.activityData.summary,
                data: updateChange.activityData.data,
                isPending: true  // Mark as pending
            };
        }
        
        return activity;
    });
```

#### 3. Create Pending New Activities
```typescript
const newActivities = activityChanges
    .filter(change => change.type === 'create')
    .map(change => ({
        id: generateTempId(),  // Temporary ID
        client_id: clientId,
        type: change.activityData.type,
        summary: change.activityData.summary,
        data: change.activityData.data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        isPending: true  // Mark as pending
    }));
```

#### 4. Merge Arrays
```typescript
return [...newActivities, ...updatedActivities];
```
New activities appear first (most recent).

## Types

### DisplayActivity
```typescript
type DisplayActivity = Activity & { isPending?: boolean };
```

Activities with optional `isPending` flag for UI indication.

### ActivityChange
```typescript
interface ActivityChange {
    type: 'create' | 'update' | 'delete';
    activityId?: number;
    activityData?: {
        type: ActivityType;
        summary: string;
        data: ActivityData;
    };
}
```

## Optimistic Update Examples

### Scenario 1: Create New Activity
```
Before: activities = [A1, A2]
Change: { type: 'create', activityData: {...} }
After: displayActivities = [NEW_PENDING, A1, A2]
```

### Scenario 2: Update Existing
```
Before: activities = [A1, A2]
Change: { type: 'update', activityId: A1.id, activityData: {...} }
After: displayActivities = [A1_UPDATED (isPending: true), A2]
```

### Scenario 3: Delete Activity
```
Before: activities = [A1, A2, A3]
Change: { type: 'delete', activityId: A2.id }
After: displayActivities = [A1, A3]
```

### Scenario 4: Multiple Changes
```
Before: activities = [A1, A2, A3]
Changes:
  - Create NEW
  - Update A1
  - Delete A2
After: displayActivities = [NEW_PENDING, A1_UPDATED (isPending), A3]
```

## Memoization

```typescript
const displayActivities = useMemo(
    () => mergeActivitiesWithChanges(activities, activityChanges),
    [activities, activityChanges]
);
```

Only recalculates when `activities` or `activityChanges` change.

## Layout

```
div.mx-auto.max-w-3xl
  └─ ActivityTimeline (activities=displayActivities)
```

Maximum width container for better readability.

## Data Transformations

### Server Activity → Display Activity
```typescript
{
    id: number,
    client_id: string | number,
    type: ActivityType,
    summary: string,
    data: ActivityData,
    created_at: string,
    updated_at: string,
    user?: { name: string }
}
```

### Pending New Activity
```typescript
{
    id: generateTempId(),  // Negative or large number
    client_id: clientId,
    type: ActivityType,
    summary: string,
    data: ActivityData,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    isPending: true  // Visual indicator
}
```

## Client ID Extraction
```typescript
const clientId = activities[0]?.client_id;
```
Assumes all activities belong to same client.

## Components Used
- ActivityTimeline

## Dependencies
- Store: useClientStore
- React: useMemo
- Types: Activity, ActivityChange, ActivityData, ActivityType

## Usage Example

```typescript
<ClientActivityTab activities={activities} />
```

## Related
- [activity-timeline.tsx](./ACTIVITY-TIMELINE.md)
- [activity-form.tsx](./ACTIVITY-FORM.md)
- [show.tsx](../pages/clients/SHOW.md)
