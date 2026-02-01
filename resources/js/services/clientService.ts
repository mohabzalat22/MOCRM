import { router } from '@inertiajs/react';
import type { TagChange } from '@/components/clients/tag-input';
import type { CustomField } from '@/types';

interface UpdateClientDataOptions {
    clientId: number;
    formData: FormData;
    onSuccess?: () => void;
    onError?: (errors: Record<string, string | string[]>) => void;
}

interface UpdateCustomFieldsOptions {
    clientId: number;
    customFields: CustomField[];
    onSuccess?: () => void;
    onError?: (errors: Record<string, string | string[]>) => void;
}

interface HandleTagChangesOptions {
    clientId: number;
    tagChanges: TagChange;
    onSuccess?: () => void;
    onError?: (errors: Record<string, string | string[]>) => void;
}

export const clientService = {
    /**
     * Build FormData from changed fields, excluding custom fields
     */
    buildFormData(
        changedFields: Record<string, string | File | CustomField[] | null>,
        excludeCustomFields = false,
    ): FormData {
        const formData = new FormData();

        Object.entries(changedFields).forEach(([key, value]) => {
            if (key === 'custom_fields' && excludeCustomFields) {
                return;
            }

            if (key === 'image') {
                formData.append('image', value === '' ? '' : (value as File));
            } else if (key === 'custom_fields') {
                if (Array.isArray(value)) {
                    value.forEach((field, idx) => {
                        if (field && typeof field === 'object') {
                            if ('key' in field) {
                                formData.append(
                                    `custom_fields[${idx}][key]`,
                                    field.key ?? '',
                                );
                            }
                            if ('value' in field) {
                                formData.append(
                                    `custom_fields[${idx}][value]`,
                                    field.value ?? '',
                                );
                            }
                        }
                    });
                    if (value.length === 0) {
                        formData.append('custom_fields', '');
                    }
                }
            } else {
                formData.append(key, value as string);
            }
        });

        formData.append('_method', 'PATCH');
        return formData;
    },

    /**
     * Update client basic data
     */
    updateClientData({
        clientId,
        formData,
        onSuccess,
        onError,
    }: UpdateClientDataOptions): void {
        router.post(`/clients/${clientId}`, formData, {
            preserveScroll: true,
            preserveState: true,
            onSuccess,
            onError,
        });
    },

    /**
     * Update client custom fields
     */
    updateCustomFields({
        clientId,
        customFields,
        onSuccess,
        onError,
    }: UpdateCustomFieldsOptions): void {
        const formData = new FormData();

        const fieldsToSend = customFields.filter(
            (field) => field && field.key && field.key.trim() !== '',
        );

        fieldsToSend.forEach((field, idx) => {
            formData.append(`custom_fields[${idx}][key]`, field.key);
            formData.append(`custom_fields[${idx}][value]`, field.value ?? '');
        });

        if (fieldsToSend.length === 0) {
            formData.append('custom_fields', '');
        }

        router.post(`/clients/${clientId}/custom-fields`, formData, {
            preserveScroll: true,
            preserveState: true,
            onSuccess,
            onError,
        });
    },

    /**
     * Handle tag additions and removals sequentially
     */
    handleTagChanges({
        clientId,
        tagChanges,
        onSuccess,
        onError,
    }: HandleTagChangesOptions): void {
        const operations: Array<() => void> = [];

        // Queue tag additions
        tagChanges.tagsToAdd.forEach((tag) => {
            operations.push(() => {
                router.post(
                    '/tags',
                    {
                        name: tag.name,
                        color: tag.color,
                        taggable_id: clientId,
                        taggable_type: 'App\\Models\\Client',
                    },
                    {
                        preserveScroll: true,
                        preserveState: true,
                        onSuccess: processNext,
                        onError: (err) => {
                            console.error('Tag add failed', err);
                            onError?.(err);
                            processNext();
                        },
                    },
                );
            });
        });

        // Queue tag removals
        tagChanges.tagsToRemove.forEach((tagId) => {
            operations.push(() => {
                router.delete(`/client/${clientId}/tags/${tagId}`, {
                    preserveScroll: true,
                    preserveState: true,
                    onSuccess: processNext,
                    onError: (err) => {
                        console.error('Tag remove failed', err);
                        onError?.(err);
                        processNext();
                    },
                });
            });
        });

        // Handle empty operations
        if (operations.length === 0) {
            onSuccess?.();
            return;
        }

        let currentOpIndex = 0;

        const processNext = () => {
            if (currentOpIndex < operations.length) {
                const op = operations[currentOpIndex];
                currentOpIndex++;
                op();
            } else {
                onSuccess?.();
            }
        };

        processNext();
    },
};
