export interface ProjectTemplate {
    id: number;
    name: string;
    description: string | null;
    tasks_count?: number;
    tasks?: ProjectTemplateTask[];
    created_at: string;
    updated_at: string;
}

export interface ProjectTemplateTask {
    id: number;
    project_template_id: number;
    title: string;
    description: string | null;
    priority: string;
    is_milestone: boolean;
    order: number;
    parent_id: number | null;
    children?: ProjectTemplateTask[];
    created_at: string;
    updated_at: string;
}
