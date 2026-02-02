import { toast } from 'sonner';
import { clientService } from '@/services/clientService';
import { useClientStore } from '@/stores/useClientStore';
import type { CustomField } from '@/types';
import { hasValidChanges } from '@/utils/clientUtils';

/**
 * Custom hook to handle client submission logic
 * Separates business logic from the store
 */
export const useClientSubmit = () => {
    const store = useClientStore();

    const submitClient = () => {
        const {
            client,
            changedFields,
            tagChanges,
            activityChanges,
            setIsSaving,
        } = store;

        if (!client) {
            toast.error('Client not found');
            return;
        }

        const hasTagChanges =
            tagChanges.tagsToAdd.length > 0 ||
            tagChanges.tagsToRemove.length > 0;
        const hasFieldChanges = Object.keys(changedFields).length > 0;
        const hasActivityChanges = activityChanges.length > 0;

        if (!hasFieldChanges && !hasTagChanges && !hasActivityChanges) {
            toast.info('No changes to save.');
            return;
        }

        const { hasClientChanges, hasCustomFieldChanges } = hasValidChanges(
            changedFields,
            client,
        );

        if (
            !hasClientChanges &&
            !hasCustomFieldChanges &&
            !hasTagChanges &&
            !hasActivityChanges
        ) {
            toast.info('No changes to save.');
            return;
        }

        // Track errors across all operations
        let hasErrors = false;
        setIsSaving(true);

        // Helper to show error toasts
        const showErrorToasts = (errors: Record<string, string | string[]>) => {
            if (errors && Object.keys(errors).length > 0) {
                Object.values(errors).forEach((message) => {
                    if (typeof message === 'string') {
                        toast.error(message);
                    }
                });
            } else {
                toast.error('An unexpected error occurred.');
            }
        };

        // Step 4: Submit activities
        const submitActivities = () => {
            if (hasActivityChanges) {
                let processedCount = 0;
                const totalChanges = activityChanges.length;

                const processNextActivity = () => {
                    if (processedCount >= totalChanges) {
                        if (!hasErrors) {
                            toast.success('Client has been updated.');
                        }
                        finishSubmission();
                        return;
                    }

                    const change = activityChanges[processedCount];
                    processedCount++;

                    if (change.type === 'create') {
                        clientService.createActivity({
                            clientId: Number(client.id),
                            activityData: change.activityData!,
                            onSuccess: processNextActivity,
                            onError: (errors) => {
                                hasErrors = true;
                                showErrorToasts(errors);
                                processNextActivity();
                            },
                        });
                    } else if (change.type === 'update') {
                        clientService.updateActivity({
                            activityId: change.activityId!,
                            activityData: change.activityData!,
                            onSuccess: processNextActivity,
                            onError: (errors) => {
                                hasErrors = true;
                                showErrorToasts(errors);
                                processNextActivity();
                            },
                        });
                    } else if (change.type === 'delete') {
                        clientService.deleteActivity({
                            activityId: change.activityId!,
                            onSuccess: processNextActivity,
                            onError: (errors) => {
                                hasErrors = true;
                                showErrorToasts(errors);
                                processNextActivity();
                            },
                        });
                    }
                };

                processNextActivity();
            } else {
                if (!hasErrors) {
                    toast.success('Client has been updated.');
                }
                finishSubmission();
            }
        };

        // Step 3: Submit tags
        const submitTags = () => {
            if (hasTagChanges) {
                clientService.handleTagChanges({
                    clientId: Number(client.id),
                    tagChanges,
                    onSuccess: () => {
                        submitActivities();
                    },
                    onError: () => {
                        hasErrors = true;
                        submitActivities();
                    },
                });
            } else {
                submitActivities();
            }
        };

        // Step 2: Submit custom fields
        const submitCustomFields = () => {
            if (hasCustomFieldChanges) {
                const customFieldsValue = changedFields.custom_fields as
                    | CustomField[]
                    | undefined;

                const customFields = Array.isArray(customFieldsValue)
                    ? customFieldsValue
                    : [];

                clientService.updateCustomFields({
                    clientId: Number(client.id),
                    customFields,
                    onSuccess: () => {
                        submitTags();
                    },
                    onError: (errors) => {
                        hasErrors = true;
                        showErrorToasts(errors);
                        submitTags();
                    },
                });
            } else {
                submitTags();
            }
        };

        // Step 1: Submit client data
        const submitClientData = () => {
            if (hasClientChanges) {
                const formData = clientService.buildFormData(
                    changedFields,
                    true,
                );

                clientService.updateClientData({
                    clientId: Number(client.id),
                    formData,
                    onSuccess: () => {
                        submitCustomFields();
                    },
                    onError: (errors) => {
                        console.error('Client data failed', errors);
                        hasErrors = true;
                        showErrorToasts(errors);
                        submitCustomFields();
                    },
                });
            } else {
                submitCustomFields();
            }
        };

        // Finish and reset state
        const finishSubmission = () => {
            store.setIsSaving(false);
            store.setEditMode(false);
            store.setChangedFields({});
            store.setTagChanges({ tagsToAdd: [], tagsToRemove: [] });
            store.setActivityChanges([]);
        };

        // Start the submission chain
        submitClientData();
    };

    return { submitClient };
};
