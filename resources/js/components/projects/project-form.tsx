import { format } from 'date-fns';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { projectService } from '@/services/projectService';
import type { Project, ProjectStatus } from '@/types';

interface ProjectFormProps {
    project?: Project;
    clients: { id: number; name: string }[];
    defaultClientId?: number;
    onSuccess?: () => void;
}

export function ProjectForm({
    project,
    clients,
    defaultClientId,
    onSuccess,
}: ProjectFormProps) {
    const [processing, setProcessing] = useState(false);
    
    const [data, setData] = useState({
        client_id: project?.client_id?.toString() || defaultClientId?.toString() || '',
        name: project?.name || '',
        description: project?.description || '',
        start_date: project?.start_date 
            ? format(new Date(project.start_date), 'yyyy-MM-dd')
            : '',
        end_date: project?.end_date 
            ? format(new Date(project.end_date), 'yyyy-MM-dd')
            : '',
        status: (project?.status || 'not_started') as ProjectStatus,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setProcessing(true);

        const options = {
            onSuccess: () => {
                setProcessing(false);
                toast.success(project ? 'Project updated successfully' : 'Project created successfully');
                onSuccess?.();
            },
            onError: (errors: Record<string, string>) => {
                setProcessing(false);
                Object.values(errors).forEach((error) => toast.error(error as string));
            },
        };

        if (project) {
            projectService.updateProject(project.id, data, options);
        } else {
            projectService.createProject(data, options);
        }
    };

    return (
        <form onSubmit={submit} className="space-y-4">
            {!defaultClientId && (
                <div className="space-y-2">
                    <Label htmlFor="client_id">Client *</Label>
                    <Select
                        value={data.client_id}
                        onValueChange={(val) => setData({ ...data, client_id: val })}
                        required
                    >
                        <SelectTrigger id="client_id">
                            <SelectValue placeholder="Select client" />
                        </SelectTrigger>
                        <SelectContent>
                            {clients.map((client) => (
                                <SelectItem key={client.id} value={client.id.toString()}>
                                    {client.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}

            <div className="space-y-2">
                <Label htmlFor="name">Project Name *</Label>
                <Input
                    id="name"
                    placeholder="e.g. Website Redesign"
                    value={data.name}
                    onChange={(e) => setData({ ...data, name: e.target.value })}
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                    id="description"
                    placeholder="Project details..."
                    value={data.description}
                    onChange={(e) => setData({ ...data, description: e.target.value })}
                    rows={3}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="start_date">Start Date *</Label>
                    <Input
                        id="start_date"
                        type="date"
                        value={data.start_date}
                        onChange={(e) => setData({ ...data, start_date: e.target.value })}
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="end_date">Due Date</Label>
                    <Input
                        id="end_date"
                        type="date"
                        value={data.end_date}
                        onChange={(e) => setData({ ...data, end_date: e.target.value })}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select
                    value={data.status}
                    onValueChange={(val) => setData({ ...data, status: val as ProjectStatus })}
                >
                    <SelectTrigger id="status">
                        <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="not_started">Not Started</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="on_hold">On Hold</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
                <Button type="submit" disabled={processing}>
                    {processing ? 'Saving...' : project ? 'Update Project' : 'Create Project'}
                </Button>
            </div>
        </form>
    );
}
