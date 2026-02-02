# Tag Input Component Documentation

## Overview
Advanced tag management component with autocomplete, color selection, and optimistic UI updates. Supports adding tags from existing pool or creating new ones.

## File Location
`resources/js/components/clients/tag-input.tsx`

## Props
```typescript
interface TagInputProps {
    className?: string;
}
```

## State Management

### Store State
```typescript
const { 
    allTags,        // All available tags in system
    client,         // Current client
    editMode,       // Edit mode flag
    tagChanges,     // {tagsToAdd, tagsToRemove}
    setTagChanges   // Update tag changes
} = useClientStore();
```

### Local State
```typescript
const [inputValue, setInputValue] = useRemember('');  // Persists across Inertia visits
const [selectedColor, setSelectedColor] = useRemember(TAG_COLORS[0]);
const [open, setOpen] = useState(false);  // Popover visibility
```

### Refs
```typescript
const inputRef = useRef<HTMLInputElement>(null);
const popoverContentRef = useRef<HTMLDivElement>(null);
```

## Hooks Used

### useClientStore
Global state for tags and client data.

### useRemember (Inertia)
Persists input value and color across page navigation.

### useEffect
1. Reset tag changes when edit mode disabled
2. Auto-focus input in edit mode
3. Handle outside clicks to close popover

## Data Flow

### Display Tags
```typescript
displayTags = [
    ...existingTags.filter(not in tagsToRemove),
    ...tagsToAdd.map(to pending tag objects)
]
```

### Add Tag Flow
```
User types → setInputValue → setOpen(true)
User selects existing tag OR presses Enter
  → handleAddTag(name, color)
  → setTagChanges(prev => [...prev.tagsToAdd, {name, color}])
  → Clear input → Focus input
```

### Remove Tag Flow
```
User clicks X on tag
  If pending → Remove from tagsToAdd
  If existing → Add to tagsToRemove
→ setTagChanges updated → Focus input
```

### Tag Filtering
```typescript
filteredSuggestions = allTags.filter(tag =>
    tag.name includes inputValue &&
    not in existingTags &&
    not in tagsToAdd
)
```

## Components Structure

### Current Tags Display
```typescript
{displayTags.map(tag => (
    <Badge 
        style={{ backgroundColor: tag.color }}
        className={tag.isPending ? "ring-2" : ""}
    >
        {tag.name}
        {tag.isPending && "(pending)"}
        {editMode && <X button />}
    </Badge>
))}
```

### Add Tag Input (Edit Mode Only)
```typescript
<Input
    ref={inputRef}
    value={inputValue}
    onChange={handleInputChange}
    onKeyDown={handleKeyDown}
    placeholder="Type to add or search tags..."
/>
```

### Autocomplete Popover
```typescript
{open && inputValue.length > 0 && (
    <Command>
        {filteredSuggestions.length === 0 ? (
            <CommandEmpty>Press Enter to create "{inputValue}"</CommandEmpty>
        ) : (
            <CommandGroup>
                {filteredSuggestions.map(tag => (
                    <CommandItem onClick={handleExistingTagSelect}>
                        <ColorDot /> {tag.name} <Badge>{usage_count}</Badge>
                    </CommandItem>
                ))}
            </CommandGroup>
        )}
    </Command>
)}
```

### Color Picker
```typescript
<Popover>
    <PopoverTrigger>
        <Button><ColorCircle color={selectedColor} /></Button>
    </PopoverTrigger>
    <PopoverContent>
        {TAG_COLORS.map(color => (
            <button onClick={() => setSelectedColor(color)} />
        ))}
    </PopoverContent>
</Popover>
```

## Event Handlers

### handleInputChange
```typescript
setInputValue(value);
setOpen(value.length > 0);  // Show popover if typing
```

### handleKeyDown
```typescript
if (key === 'Enter') {
    e.preventDefault();
    handleAddTag(inputValue, selectedColor);
}
if (key === 'Escape') {
    setOpen(false);
    // Keep focus on input
}
```

### handleAddTag
```typescript
setTagChanges(prev => ({
    ...prev,
    tagsToAdd: [...prev.tagsToAdd, { name, color }]
}));
setInputValue('');
setOpen(false);
inputRef.current?.focus();
```

### handleRemoveTag
```typescript
setTagChanges(prev => ({
    ...prev,
    tagsToRemove: [...prev.tagsToRemove, tagId]
}));
```

## Focus Management

### Auto-Focus
Input automatically focuses when:
- Component mounts in edit mode
- Tag is added
- Tag is removed
- Popover closes
- Color is selected

### Prevent Focus Loss
```typescript
onMouseDown={(e) => e.preventDefault()}  // On buttons and popover items
```

This prevents focus from leaving the input when interacting with UI elements.

## Optimistic UI

### Pending Tags
```typescript
{
    id: -idx - 1,  // Temporary negative ID
    name: tag.name,
    color: tag.color,
    isPending: true,  // Visual indicator
    ...
}
```

Pending tags shown with:
- Ring effect (ring-2 ring-white/50)
- "(pending)" text
- Can be removed before saving

## Data Transformations

### Tag to Display Object
```typescript
existingTag → { ...tag }  // Pass through
newTag → {
    id: -idx - 1,  // Temp ID
    name,
    color,
    isPending: true,
    usage_count: 0,
    created_at: '',
    updated_at: ''
}
```

### Submission Format
```typescript
tagChanges = {
    tagsToAdd: [{ name: string, color: string }],
    tagsToRemove: [number]  // Tag IDs
}
```

## Styling

### Tag Badges
```css
/* Normal tag */
style={{ backgroundColor: tag.color }}
className="text-white"

/* Pending tag */
className="ring-2 ring-white/50 ring-offset-2"
```

### Input
- Icon on right (TagIcon)
- Full width
- Auto-focus in edit mode

### Popover
- Positioned below input
- Max height with scroll
- White background
- Shadow and border

### Color Picker
- 6-column grid
- Circular buttons
- Selected: ring-2 ring-gray-900
- Hover: scale-110

## Keyboard Shortcuts
- **Enter**: Add current input as tag
- **Escape**: Close popover (keep focus)
- **Tab**: Navigate between input and buttons

## TAG_COLORS Constant
Array of predefined colors for tags (from utils).

## Dependencies
- Store: useClientStore
- Inertia: useRemember
- UI: Badge, Button, Input, Label, Popover, Command
- Icons: X, Plus, TagIcon
- Utils: cn, TAG_COLORS

## Related
- [client-overview-tab.tsx](./CLIENT-OVERVIEW-TAB.md)
- [show.tsx](../pages/clients/SHOW.md)
