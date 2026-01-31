import { create } from 'zustand';
import type { Client } from '@/components/clients/Columns';
import type { CustomField } from '@/components/clients/custom-fields';
import type { TagChange } from '@/components/clients/tag-input';
import type { Tag } from '@/types';

interface ClientFormData {
    name: string;
    company_name: string;
    email: string;
    phone: string;
    website: string;
    address: string;
    image: File | null;
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
    changedFields: Record<string, string | File | CustomField[] | null>;
    tagChanges: TagChange;

    // Actions
    initialize: (client: Client, allTags: Tag[]) => void;
    setAllTags: (tags: Tag[]) => void;
    setImage: (image: string | null) => void;
    setDeleting: (deleting: boolean) => void;
    setEditMode: (editMode: boolean) => void;
    setIsSaving: (isSaving: boolean) => void;
    
    setFormData: (data: ClientFormData) => void;
    updateFormData: (key: keyof ClientFormData, value: string | File | CustomField[] | null) => void;
    handleFieldChange: (key: keyof ClientFormData, value: string | File | CustomField[] | null) => void;

    setChangedFields: (fields: Record<string, string | File | CustomField[] | null> | ((prev: Record<string, string | File | CustomField[] | null>) => Record<string, string | File | CustomField[] | null>)) => void;
    
    setTagChanges: (changes: TagChange | ((prev: TagChange) => TagChange)) => void;
    
    reset: () => void;
    resetForm: () => void;
}

const STORAGE_BASE_URL = 'http://localhost:8000/storage/';

const getImageUrl = (imagePath: string | null): string | null => {
    return imagePath ? `${STORAGE_BASE_URL}/${imagePath}` : null;
};

const defaultFormData: ClientFormData = {
    name: '',
    company_name: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    image: null,
    custom_fields: [],
    status: '',
};

// Helper functions
const customFieldsChanged = (
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

export const useClientStore = create<ClientState>((set, get) => ({
    client: null,
    allTags: [],
    image: null,
    deleting: false,
    editMode: false,
    isSaving: false,
    formData: defaultFormData,
    changedFields: {},
    tagChanges: { tagsToAdd: [], tagsToRemove: [] },

    initialize: (client, allTags) => {
        set({
            client,
            allTags,
            image: getImageUrl(client.image ?? null),
            formData: {
                name: client.name ?? '',
                company_name: client.company_name ?? '',
                email: client.email ?? '',
                phone: client.phone ?? '',
                website: client.website ?? '',
                address: client.address ?? '',
                image: null,
                custom_fields: (client.custom_fields || []) as CustomField[],
                status: client.status ?? '',
            },
            // Reset other states
            deleting: false,
            editMode: false,
            changedFields: {},
            tagChanges: { tagsToAdd: [], tagsToRemove: [] },
        });
    },

    setAllTags: (allTags) => set({ allTags }),
    setImage: (image) => set({ image }),
    setDeleting: (deleting) => set({ deleting }),
    setEditMode: (editMode) => set({ editMode }),
    setIsSaving: (isSaving) => set({ isSaving }),
    
    setFormData: (data) => set({ formData: data }),
    
    updateFormData: (key, value) => {
        set((state) => ({ formData: { ...state.formData, [key]: value } }));
        get().handleFieldChange(key, value);
    },
    
    setChangedFields: (updater) => set((state) => ({ 
        changedFields: typeof updater === 'function' ? updater(state.changedFields) : updater 
    })),
    
    setTagChanges: (updater) => set((state) => ({
        tagChanges: typeof updater === 'function' ? updater(state.tagChanges) : updater
    })),

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
            custom_fields: (client.custom_fields || []) as CustomField[],
            status: client.status ?? '',
        };

        if (key === 'image') {
            if (value === null || value === '') {
                state.setChangedFields((prev) => ({ ...prev, image: '' }));
            } else {
                state.setChangedFields((prev) => ({ ...prev, image: value as File }));
            }
        } else if (key === 'custom_fields') {
            const fieldsArray = (value as CustomField[]) || [];
            const nonEmptyFields = fieldsArray.filter(
                (field) =>
                    (field.key && field.key.trim() !== '') ||
                    (field.value && field.value.trim() !== ''),
            );

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
    
    reset: () => set({
        client: null,
        allTags: [],
        image: null,
        deleting: false,
        editMode: false,
        isSaving: false,
        formData: defaultFormData,
        changedFields: {},
        tagChanges: { tagsToAdd: [], tagsToRemove: [] },
    }),

    resetForm: () => {
        const { client } = get();
        if (!client) return;
        
        set({
            editMode: false,
            changedFields: {},
            tagChanges: { tagsToAdd: [], tagsToRemove: [] },
            image: getImageUrl(client.image ?? null),
            formData: {
                name: client.name ?? '',
                company_name: client.company_name ?? '',
                email: client.email ?? '',
                phone: client.phone ?? '',
                website: client.website ?? '',
                address: client.address ?? '',
                image: null,
                custom_fields: (client.custom_fields || []) as CustomField[],
                status: client.status ?? '',
            }
        });
    }
}));
