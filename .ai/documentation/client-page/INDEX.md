# Clients Index Page Documentation

## Overview
The clients index page is the main listing page for all clients in the CRM system. It displays a data table with filtering, sorting, and pagination capabilities.

## File Location
`resources/js/pages/clients/index.tsx`

## Component Structure

```typescript
interface ClientsPageProps {
    clients: Client[];
}
```

## Props

### `clients` (Client[])
An array of client objects passed from the backend via Inertia.js. Each client contains:
- `id`: Unique identifier
- `name`: Client name
- `company_name`: Company name (optional)
- `email`: Email address
- `phone`: Phone number (optional)
- `website`: Website URL (optional)
- `address`: Physical address (optional)
- `image`: Profile image URL (optional)
- `status`: Current status (`Active`, `Lead`, `At Risk`, `In Active`)
- `tags`: Array of associated tags
- `custom_fields`: Array of custom field key-value pairs
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

## Data Flow

### 1. Server to Client
```
Backend Controller → Inertia Response → Page Props → clients prop
```

### 2. Props to Components
```
clients prop → DataTable component → TanStack Table → Rendered rows
```

### 3. User Interactions
```
User clicks row → Inertia router.visit() → Navigate to /clients/{id}
User clicks "Add New Client" → ClientDialog opens → Form submission → POST /clients
```

## Components Used

### Primary Components
- **AppLayout**: Provides the main page layout with breadcrumbs
- **Head**: Sets the page title (from @inertiajs/react)
- **DataTable**: Table component with sorting, filtering, and pagination
- **ClientDialog**: Modal dialog for creating new clients
- **columns**: Column definitions for the table

## Hooks Used

### From @inertiajs/react
- **Head**: For setting document head (title, meta tags)

## Layout Structure

```
AppLayout (breadcrumbs)
  └─ Head (title="Clients")
  └─ div.p-4
      ├─ div.mb-1 (Header bar)
      │   ├─ h2 "My Clients"
      │   └─ ClientDialog (Add button)
      └─ DataTable (columns, data=clients)
```

## Breadcrumbs Configuration

```typescript
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Clients',
        href: '/clients',
    },
];
```

## State Management
This component is **stateless**. All data is received via props from the server and managed by child components.

## Data Transformations
No direct data transformations occur in this component. Data is passed as-is to child components.

## Navigation
- Clicking a table row navigates to `/clients/{id}` (handled in DataTable)
- Breadcrumbs provide navigation context

## Dependencies
- `@inertiajs/react`: For SSR and routing
- Custom components: `DataTable`, `ClientDialog`, `columns`
- Layout: `AppLayout`
- Types: `Client`, `BreadcrumbItem`

## Usage Example

```typescript
// Server-side (Laravel Controller)
return Inertia::render('clients/index', [
    'clients' => Client::with('tags')->get(),
]);

// Client renders automatically with props
```

## Key Features
1. **List View**: Display all clients in a table format
2. **Add Client**: Quick access to create new clients
3. **Navigation**: Easy navigation to client details
4. **Breadcrumbs**: Clear page hierarchy

## Related Components
- [show.tsx](./SHOW.md) - Client detail page
- [DataTable](../components/clients/DATATABLE.md) - Table implementation
- [ClientDialog](../components/clients/DIALOG.md) - Create client form
