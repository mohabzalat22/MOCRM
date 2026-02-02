# Client Management Frontend Documentation

Complete documentation for all client-related frontend components in the MOCRM application.

## Documentation Index

### Pages

#### [Clients Index Page](./pages/clients/INDEX.md)
Main listing page for all clients with data table, filtering, and pagination.

**Key Features**:
- Client data table with sorting
- Status and tag filtering
- Global search
- Add new client dialog
- Navigation to client details

#### [Client Detail/Show Page](./pages/clients/SHOW.md)
Comprehensive client detail page with inline editing and activity management.

**Key Features**:
- Tabbed interface (Overview, Activity)
- Inline editing with optimistic UI
- Activity management
- Tag and custom field management
- Confirmation dialogs

---

## Components

### Data Table Components

#### [DataTable](./components/clients/DATATABLE.md)
Highly customizable table component with TanStack Table.

**Features**:
- Sorting, filtering, pagination
- Column visibility toggle
- Row selection
- Global search
- Custom tag filtering

#### [Columns](./components/clients/COLUMNS.md)
Column definitions for the client data table.

**Features**:
- Sortable columns
- Custom rendering (badges, tags)
- Multi-select tag filter
- Status badge styling

#### [Client Dialog](./components/clients/DIALOG.md)
Modal dialog for creating new clients.

**Features**:
- Form validation
- Image upload with preview
- Error handling
- Inertia.js integration

---

### Client Detail Components

#### [Client Header](./components/clients/CLIENT-HEADER.md)
Header section with profile image, name, status, and quick actions.

**Features**:
- Responsive design
- Gradient background
- Quick action buttons
- Settings menu

#### [Client Form](./components/clients/CLIENT-FORM.md)
Contact information form with view/edit modes.

**Features**:
- Six contact fields
- Icon indicators
- Auto-reset on mode change
- Empty state display

#### [Client Image Upload](./components/clients/CLIENT-IMAGE.md)
Profile image upload with preview and removal.

**Features**:
- Drag-free upload (click-based)
- Base64 preview
- Remove functionality
- Hover effects

#### [Client Overview Tab](./components/clients/CLIENT-OVERVIEW-TAB.md)
Main overview tab with contact info, custom fields, and tags.

**Features**:
- Responsive grid layout
- Three main sections
- System information display

---

### Tag & Custom Fields

#### [Tag Input](./components/clients/TAG-INPUT.md)
Advanced tag management with autocomplete and color selection.

**Features**:
- Autocomplete from existing tags
- Color picker (24 colors)
- Optimistic UI updates
- Keyboard shortcuts
- Focus management

#### [Custom Fields View](./components/clients/CUSTOM-FIELDS-VIEW.md)
Sheet-based custom field management.

**Features**:
- Add/edit/delete fields
- Sheet modal interface
- Key-value pairs
- Whitespace preservation

#### [Custom Fields (Legacy)](./components/clients/CUSTOM-FIELDS.md)
Alternative inline custom fields implementation.

**Note**: This appears to be an older implementation. Use CustomFieldsView instead.

---

### Activity Components

#### [Activity Form](./components/clients/ACTIVITY-FORM.md)
Comprehensive form for creating/editing activities.

**Features**:
- 5 activity types (note, call, email, meeting, transaction)
- Type-specific fields
- Action item checklist
- Optimistic updates

**Activity Types**:
- **Note**: Basic note with content
- **Call**: Duration, outcome
- **Email**: Notes
- **Meeting**: Type, duration, attendees, action items
- **Transaction**: Type, amount

#### [Activity Item](./components/clients/ACTIVITY-ITEM.md)
Single activity display in timeline format.

**Features**:
- Timeline styling
- Type-specific rendering
- Edit/delete actions (edit mode)
- Action item display

#### [Activity Timeline](./components/clients/ACTIVITY-TIMELINE.md)
Container for activity items with timeline display.

**Features**:
- Vertical timeline
- Empty state
- Timeline header

#### [Client Activity Tab](./components/clients/CLIENT-ACTIVITY-TAB.md)
Activity tab with optimistic UI updates.

**Features**:
- Merges server data with pending changes
- Optimistic create/update/delete
- Temporary IDs for pending items

---

### Utility Components

#### [Quick Actions](./components/clients/QUICK-ACTIONS.md)
Quick action buttons for common tasks.

**Features**:
- Call client (tel: link)
- Email client (mailto: link)
- Add activity
- Schedule meeting

**Styling**: Color-coded hover states (green, blue, purple, orange)

#### [Status Button](./components/clients/STATUS-BUTTON.md)
Status display and selector.

**Features**:
- View mode: Badge display
- Edit mode: Dropdown selector
- Color-coded statuses
- 4 status options

**Statuses**:
- Active (green)
- Lead (yellow)
- At Risk (red)
- In Active (gray)

#### [Setting Button](./components/clients/SETTING-BUTTON.md)
Settings dropdown menu.

**Features**:
- Edit mode toggle
- Delete client (with confirmation)
- Loading states
- Error handling

#### [Save Button Footer](./components/clients/SAVE-BUTTON-FOOTER.md)
Sticky footer with save/cancel actions.

**Features**:
- Fixed positioning
- Save/cancel buttons
- Loading indicator
- Only visible in edit mode

---

## Architecture Overview

### State Management

The application uses **Zustand** for global state management with Immer middleware for immutability.

**Store**: `useClientStore`

**Key State**:
- `client`: Current client data
- `formData`: Editable form data
- `editMode`: Edit mode flag
- `changedFields`: Tracks modified fields
- `tagChanges`: Tag additions/removals
- `activityChanges`: Activity create/update/delete queue
- `image`: Image preview URL

### Data Flow Patterns

#### 1. Server-Side Rendering (Inertia.js)
```
Backend → Inertia Response → Page Props → Initialize Store → Render
```

#### 2. Optimistic UI Updates
```
User Action → Update Store → UI Updates Immediately → Submit to Server
  Success → Keep changes
  Error → Revert or show error
```

#### 3. Form Editing
```
User Enters Edit Mode → Store Tracks Changes → User Modifies → Store Tracks Each Change
→ User Saves → Submit All Changes → Reset Store
```

#### 4. Activity Management
```
User Creates/Edits Activity → Queue in Store → Display Pending → Parent Form Save
→ Submit All Queued Changes → Update Server → Refresh Data
```

### Key Hooks

#### useClientStore (Zustand)
Global state for client data and UI state.

#### useClientSubmit (Custom)
Handles complex client update logic with sequential API calls.

#### useConfirmDialog (Custom)
Provides confirmation dialogs for destructive actions.

#### useForm (Inertia)
Form state and submission for new clients.

#### useRemember (Inertia)
Persists state across Inertia page visits.

### Technology Stack

- **React 18**: UI framework
- **TypeScript**: Type safety
- **Inertia.js**: Server-side rendering
- **Zustand**: State management
- **TanStack Table v8**: Data tables
- **shadcn/ui**: Component library
- **Tailwind CSS**: Styling
- **Lucide React**: Icons
- **Sonner**: Toast notifications

### Type System

#### Core Types

**Client**:
```typescript
{
    id: string | number;
    name: string;
    company_name?: string;
    email: string;
    phone?: string;
    website?: string;
    address?: string;
    image?: string;
    status: string;
    tags: Tag[];
    custom_fields: CustomField[];
    created_at: string;
    updated_at: string;
}
```

**Tag**:
```typescript
{
    id: number;
    name: string;
    color: string;
    usage_count: number;
    created_at: string;
    updated_at: string;
}
```

**Activity**:
```typescript
{
    id: number;
    client_id: string | number;
    type: ActivityType;
    summary: string;
    data: ActivityData;
    created_at: string;
    user?: { name: string };
}
```

**CustomField**:
```typescript
{
    key: string;
    value: string;
}
```

### Performance Optimizations

1. **Memoization**: `useMemo` for expensive calculations
2. **Optimistic UI**: Immediate feedback without waiting
3. **Batched Updates**: Multiple changes submitted together
4. **Lazy Evaluation**: Change tracking only in edit mode
5. **Debouncing**: (where applicable)

### Accessibility

- Semantic HTML
- ARIA labels
- Keyboard navigation
- Focus management
- Screen reader support
- Color contrast compliance

### Best Practices

1. **Type Safety**: Full TypeScript coverage
2. **Component Composition**: Small, focused components
3. **State Management**: Centralized with clear patterns
4. **Error Handling**: User-friendly error messages
5. **Loading States**: Clear feedback during async operations
6. **Validation**: Both client and server-side
7. **Responsive Design**: Mobile-first approach

---

## File Structure

```
resources/js/
├─ pages/clients/
│   ├─ index.tsx          (Client list page)
│   └─ show.tsx           (Client detail page)
└─ components/clients/
    ├─ activity-form.tsx
    ├─ activity-item.tsx
    ├─ activity-timeline.tsx
    ├─ client-activity-tab.tsx
    ├─ client-form.tsx
    ├─ client-header.tsx
    ├─ client-image.tsx
    ├─ client-overview-tab.tsx
    ├─ Columns.tsx
    ├─ custom-fields.tsx
    ├─ custom-fields-view.tsx
    ├─ DataTable.tsx
    ├─ dialog.tsx
    ├─ quick-actions.tsx
    ├─ save-button-footer.tsx
    ├─ setting-button.tsx
    ├─ status-button.tsx
    └─ tag-input.tsx
```

---

## Getting Started

### For New Developers

1. **Start with Pages**: Understand the two main pages (index, show)
2. **Learn State Management**: Study useClientStore
3. **Understand Data Flow**: Follow props and state updates
4. **Review Components**: Read component documentation in order
5. **Check Types**: Familiarize yourself with TypeScript interfaces

### For Contributing

1. **Follow Patterns**: Match existing code structure
2. **Type Everything**: Use TypeScript for all new code
3. **Document Changes**: Update this documentation
4. **Test Thoroughly**: Test all states and edge cases
5. **Responsive Design**: Ensure mobile compatibility

---

## Common Tasks

### Adding a New Field to Client
1. Update backend migration and model
2. Update TypeScript `Client` type
3. Add field to `ClientForm` component
4. Update store's `ClientFormData` interface
5. Test view and edit modes

### Adding a New Activity Type
1. Add type to `ActivityType` union
2. Update `ActivityForm` with type-specific fields
3. Update `ActivityItem` rendering logic
4. Update icon mapping
5. Test create/edit/display

### Modifying Table Columns
1. Update `Columns.tsx` configuration
2. Add custom rendering if needed
3. Add custom filter if needed
4. Test sorting and filtering

---

## Troubleshooting

### Common Issues

**Edit Mode Not Working**:
- Check `useClientStore` initialization
- Verify `editMode` state
- Check component edit mode conditionals

**Optimistic UI Not Showing**:
- Verify store changes are tracked
- Check merge logic in activity tab
- Ensure isPending flag is set

**Form Not Submitting**:
- Check `useClientSubmit` hook
- Verify changedFields tracking
- Check API endpoints

**Images Not Uploading**:
- Verify FormData usage
- Check file type restrictions
- Verify backend file handling

---

## Additional Resources

- **Inertia.js**: https://inertiajs.com/
- **Zustand**: https://zustand-demo.pmnd.rs/
- **TanStack Table**: https://tanstack.com/table/
- **shadcn/ui**: https://ui.shadcn.com/
- **Tailwind CSS**: https://tailwindcss.com/

---

## Changelog

**Created**: February 2, 2026
**Last Updated**: February 2, 2026
**Version**: 1.0.0

---

## Contributors

Documentation created for MOCRM frontend client management system.
