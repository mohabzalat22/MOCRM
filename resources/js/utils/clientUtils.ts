import type { Client, CustomField } from '@/types';

const STORAGE_BASE_URL =
    import.meta.env.VITE_STORAGE_URL || 'http://localhost:8000/storage/';

/**
 * Get full image URL from relative path
 */
export const getImageUrl = (imagePath: string | null): string | null => {
    if (!imagePath) return null;

    // Normalize slashes to prevent double slashes
    const baseUrl = STORAGE_BASE_URL.endsWith('/')
        ? STORAGE_BASE_URL.slice(0, -1)
        : STORAGE_BASE_URL;
    const path = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;

    return `${baseUrl}${path}`;
};

/**
 * Check if custom fields have changed
 */
export const customFieldsChanged = (
    current: CustomField[],
    initial: CustomField[],
): boolean => {
    if (current.length !== initial.length) return true;

    return current.some((field, idx) => {
        const initialField = initial[idx];
        if (!initialField) return true;
        return (
            field.key !== initialField.key || field.value !== initialField.value
        );
    });
};

/**
 * Filter out empty custom fields
 */
export const filterEmptyCustomFields = (
    fields: CustomField[],
): CustomField[] => {
    return fields.filter(
        (field) =>
            (field.key && field.key.trim() !== '') ||
            (field.value && field.value.trim() !== ''),
    );
};

/**
 * Convert client to form data format
 */
export const clientToFormData = (client: Client) => {
    return {
        name: client.name ?? '',
        company_name: client.company_name ?? '',
        email: client.email ?? '',
        phone: client.phone ?? '',
        website: client.website ?? '',
        address: client.address ?? '',
        image: null,
        custom_fields: (client.custom_fields || []) as CustomField[],
        status: client.status ?? '',
    };
};

/**
 * Validate if there are actual changes to save
 */
export const hasValidChanges = (
    changedFields: Record<string, string | File | CustomField[] | null>,
    client: Client,
): {
    hasClientChanges: boolean;
    hasCustomFieldChanges: boolean;
} => {
    const hasCustomFieldChanges = 'custom_fields' in changedFields;
    const customFieldsValue = changedFields.custom_fields as
        | CustomField[]
        | undefined;

    const validCustomFields = Array.isArray(customFieldsValue)
        ? customFieldsValue.filter(
              (field) => field && field.key && field.key.trim() !== '',
          )
        : [];

    const initialCustomFields = client.custom_fields || [];

    const hasRealCustomFieldChanges =
        hasCustomFieldChanges &&
        ((validCustomFields.length === 0 && initialCustomFields.length > 0) ||
            validCustomFields.length > 0);

    const clientDataChanges = Object.entries(changedFields).filter(
        ([key]) => key !== 'custom_fields',
    );

    return {
        hasClientChanges: clientDataChanges.length > 0,
        hasCustomFieldChanges: hasRealCustomFieldChanges,
    };
};
