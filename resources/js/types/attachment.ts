export interface Attachment {
    id: number;
    attachable_id: number;
    attachable_type: string;
    file_path: string;
    file_name: string;
    file_size: number;
    mime_type: string;
    user_id: number;
    created_at: string;
}
