import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { TagChange } from '@/components/clients/tag-input';
import type {
    Client,
    CustomField,
    Tag,
    ActivityType,
    ActivityData,
    ChangedFields,
} from '@/types';
import {
    getImageUrl,
    customFieldsChanged,
    filterEmptyCustomFields,
    clientToFormData,
} from '@/utils/clientUtils';

export interface ActivityChange {
    type: 'create' | 'update' | 'delete';
    activityId?: number; // For update and delete
    activityData?: {
        type: ActivityType;
        summary: string;
        data: ActivityData;
        occurred_at?: string;
        tags?: { name: string; color: string; id?: number }[];
        files?: File[];
        removed_attachment_ids?: number[];
    };
}

interface ClientFormData {
    name: string;
    company_name: string;
    email: string;
    phone: string;
    website: string;
    address: string;
    image: File | null;
    monthly_value: number;
    custom_fields: CustomField[];
    status: string;
}

interface ClientState {
    client: Client | null;
    allTags: Tag[];

    // UI State
    image: string | null;
    deleting: boolean;
    editMode: boolean;
    isSaving: boolean;

    // Form State
    formData: ClientFormData;
    changedFields: ChangedFields;
    tagChanges: TagChange;
    activityChanges: ActivityChange[];

    // Activity State
    activityDialogOpen: boolean;
    activityType: ActivityType;

    // Actions
    initialize: (client: Client, allTags: Tag[]) => void;
    setAllTags: (tags: Tag[]) => void;
    setImage: (image: string | null) => void;
    setDeleting: (deleting: boolean) => void;
    setEditMode: (editMode: boolean) => void;
    setIsSaving: (isSaving: boolean) => void;

    setFormData: (data: ClientFormData) => void;
    updateFormData: (
        key: keyof ClientFormData,
        value: string | File | CustomField[] | number | null,
    ) => void;
    handleFieldChange: (
        key: keyof ClientFormData,
        value: string | File | CustomField[] | number | null,
    ) => void;

    setChangedFields: (
        fields: ChangedFields | ((prev: ChangedFields) => ChangedFields),
    ) => void;

    setTagChanges: (
        changes: TagChange | ((prev: TagChange) => TagChange),
    ) => void;

    setActivityChanges: (
        changes:
            | ActivityChange[]
            | ((prev: ActivityChange[]) => ActivityChange[]),
    ) => void;
    addActivityChange: (change: ActivityChange) => void;

    setActivityDialogOpen: (open: boolean) => void;
    setActivityType: (type: ActivityType) => void;

    reset: () => void;
    resetForm: () => void;
}

const defaultFormData: ClientFormData = {
    name: '',
    company_name: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    image: null,
    monthly_value: 0,
    custom_fields: [],
    status: '',
};

export const useClientStore = create<ClientState>()(
    immer((set, get) => ({
        client: null,
        allTags: [],
        image: null,
        deleting: false,
        editMode: false,
        isSaving: false,
        formData: defaultFormData,
        changedFields: {} as ChangedFields,
        tagChanges: { tagsToAdd: [], tagsToRemove: [] },
        activityChanges: [],
        activityDialogOpen: false,
        activityType: 'note',

        initialize: (client, allTags) => {
            set((state) => {
                state.client = client;
                state.allTags = allTags;
                state.image = getImageUrl(client.image ?? null);
                state.formData = clientToFormData(client);
                state.deleting = false;
                state.editMode = false;
                state.changedFields = {};
                state.tagChanges = { tagsToAdd: [], tagsToRemove: [] };
                state.activityChanges = [];
                state.activityDialogOpen = false;
                state.activityType = 'note';
            });
        },

        setAllTags: (allTags) => set({ allTags }),
        setImage: (image) => set({ image }),
        setDeleting: (deleting) => set({ deleting }),
        setEditMode: (editMode) => set({ editMode }),
        setIsSaving: (isSaving) => set({ isSaving }),

        setFormData: (data) => set({ formData: data }),

        updateFormData: (key, value) => {
            set((state) => {
                // Use unknown cast to Record to avoid 'any' while allowing dynamic assignment
                (state.formData as unknown as Record<string, unknown>)[key] =
                    value;
            });
            get().handleFieldChange(key, value);
        },

        setChangedFields: (updater) =>
            set((state) => {
                if (typeof updater === 'function') {
                    const result = updater(state.changedFields);
                    state.changedFields = result;
                } else {
                    state.changedFields = updater;
                }
            }),

        setTagChanges: (updater) =>
            set((state) => {
                if (typeof updater === 'function') {
                    const result = updater(state.tagChanges);
                    state.tagChanges = result;
                } else {
                    state.tagChanges = updater;
                }
            }),

        setActivityChanges: (updater) =>
            set((state) => {
                if (typeof updater === 'function') {
                    const result = updater(state.activityChanges);
                    state.activityChanges = result;
                } else {
                    state.activityChanges = updater;
                }
            }),

        addActivityChange: (change) =>
            set((state) => {
                state.activityChanges.push(change);
            }),

        setActivityDialogOpen: (open) => set({ activityDialogOpen: open }),
        setActivityType: (type) => set({ activityType: type }),

        handleFieldChange: (key, value) => {
            const state = get();
            const client = state.client;
            if (!client) return;

            // Reconstruct initialData equivalent for comparison
            const initialData: ClientFormData = {
                name: client.name ?? '',
                company_name: client.company_name ?? '',
                email: client.email ?? '',
                phone: client.phone ?? '',
                website: client.website ?? '',
                address: client.address ?? '',
                image: null,
                monthly_value: client.monthly_value ?? 0,
                custom_fields: (client.custom_fields || []) as CustomField[],
                status: client.status ?? '',
            };

            if (key === 'image') {
                if (value === null || value === '') {
                    state.setChangedFields((prev) => ({ ...prev, image: '' }));
                } else {
                    state.setChangedFields((prev) => ({
                        ...prev,
                        image: value as File,
                    }));
                }
            } else if (key === 'custom_fields') {
                const fieldsArray = (value as CustomField[]) || [];
                const nonEmptyFields = filterEmptyCustomFields(fieldsArray);

                const hasChanges = customFieldsChanged(
                    nonEmptyFields,
                    initialData.custom_fields,
                );

                if (hasChanges && nonEmptyFields.length > 0) {
                    state.setChangedFields((prev) => ({
                        ...prev,
                        custom_fields: fieldsArray,
                    }));
                } else if (
                    nonEmptyFields.length === 0 &&
                    initialData.custom_fields.length > 0
                ) {
                    state.setChangedFields((prev) => ({
                        ...prev,
                        custom_fields: [],
                    }));
                } else {
                    state.setChangedFields((prev) => {
                        const updated = { ...prev };
                        delete updated.custom_fields;
                        return updated;
                    });
                }
            } else if (value !== initialData[key]) {
                state.setChangedFields((prev) => ({
                    ...prev,
                    [key]: value as string,
                }));
            } else {
                state.setChangedFields((prev) => {
                    const updated = { ...prev };
                    delete updated[key];
                    return updated;
                });
            }
        },

        reset: () =>
            set({
                client: null,
                allTags: [],
                image: null,
                deleting: false,
                editMode: false,
                isSaving: false,
                formData: defaultFormData,
                changedFields: {},
                tagChanges: { tagsToAdd: [], tagsToRemove: [] },
                activityChanges: [],
                activityDialogOpen: false,
                activityType: 'note',
            }),

        resetForm: () => {
            const { client } = get();
            if (!client) return;

            set((state) => {
                state.editMode = false;
                state.changedFields = {};
                state.tagChanges = { tagsToAdd: [], tagsToRemove: [] };
                state.activityChanges = [];
                state.image = getImageUrl(client.image ?? null);
                state.formData = clientToFormData(client);
            });
        },
    })),
);
