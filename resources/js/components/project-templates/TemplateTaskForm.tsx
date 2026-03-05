import { useForm } from '@inertiajs/react';
import { Diamond, GitBranch } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import { cn } from '@/lib/utils';
import { templateTaskService } from '@/services/templateTaskService';
import type { ProjectTemplateTask } from '@/types';

interface TemplateTaskFormProps {
    templateId: number;
    task?: ProjectTemplateTask | null;
    templateTasks?: ProjectTemplateTask[];
    onSuccess: () => void;
    onCancel: () => void;
    initialParentId?: number | null;
}

export function TemplateTaskForm({
    templateId,
    task,
    templateTasks = [],
    onSuccess,
    onCancel,
    initialParentId,
}: TemplateTaskFormProps) {
    const isEditing = !!task;

    const { data, setData, processing, errors, reset } = useForm({
        project_template_id: templateId,
        title: task?.title || '',
        description: task?.description || '',
        priority: task?.priority || 'low',
        is_milestone: task?.is_milestone || false,
        parent_id: task?.parent_id
            ? task.parent_id
            : initialParentId
              ? initialParentId
              : null,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEditing) {
            templateTaskService.updateTask(task.id, data, {
                onSuccess: () => {
                    onSuccess();
                    reset();
                },
            });
        } else {
            templateTaskService.createTask(data, {
                onSuccess: () => {
                    onSuccess();
                    reset();
                },
            });
        }
    };

    const parentOptions = templateTasks.filter((t) => t.id !== task?.id);

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-3">
                <div className="space-y-1">
                    <Label className="ml-1 text-xs font-semibold text-muted-foreground">
                        Task Title
                    </Label>
                    <Input
                        value={data.title}
                        onChange={(e) => setData('title', e.target.value)}
                        placeholder="e.g. Design mockups"
                        required
                        disabled={processing}
                        className={cn(
                            'h-9 text-sm font-medium',
                            errors.title &&
                                'border-destructive focus-visible:ring-destructive',
                        )}
                    />
                    {errors.title && (
                        <p className="ml-1 text-[11px] font-medium text-destructive">
                            {errors.title}
                        </p>
                    )}
                </div>

                <div className="space-y-1">
                    <Label className="ml-1 text-xs font-semibold text-muted-foreground">
                        Description
                    </Label>
                    <Textarea
                        value={data.description}
                        onChange={(e) => setData('description', e.target.value)}
                        placeholder="Provide some details..."
                        disabled={processing}
                        className={cn(
                            'min-h-[80px] resize-none text-sm',
                            errors.description &&
                                'border-destructive focus-visible:ring-destructive',
                        )}
                    />
                    {errors.description && (
                        <p className="ml-1 text-[11px] font-medium text-destructive">
                            {errors.description}
                        </p>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <Label className="ml-1 text-[11px] font-semibold text-muted-foreground">
                        Parent Task
                    </Label>
                    <Select
                        value={data.parent_id?.toString() || 'none'}
                        onValueChange={(value) =>
                            setData(
                                'parent_id',
                                value === 'none' ? null : Number(value),
                            )
                        }
                    >
                        <SelectTrigger className="h-9 w-full bg-muted/20 text-xs font-medium">
                            <SelectValue placeholder="No parent" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">None (Root)</SelectItem>
                            {parentOptions.map((t) => (
                                <SelectItem key={t.id} value={t.id.toString()}>
                                    <div className="flex items-center gap-2">
                                        {t.is_milestone ? (
                                            <Diamond className="h-3.5 w-3.5 fill-warning/20 text-warning" />
                                        ) : (
                                            <GitBranch className="h-3.5 w-3.5 text-muted-foreground" />
                                        )}
                                        <span className="max-w-[120px] truncate font-medium">
                                            {t.title}
                                        </span>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-1.5">
                    <Label className="ml-1 text-[11px] font-semibold text-muted-foreground">
                        Priority
                    </Label>
                    <Select
                        value={data.priority}
                        onValueChange={(value) => setData('priority', value)}
                    >
                        <SelectTrigger className="h-9 w-full bg-muted/20 text-xs font-medium">
                            <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="flex items-center justify-between pt-2">
                <div className="group flex items-center gap-3 rounded-md px-3 py-1.5 transition-colors hover:bg-muted/50">
                    <Checkbox
                        id="is_milestone_template"
                        checked={data.is_milestone}
                        onCheckedChange={(checked: boolean) =>
                            setData('is_milestone', checked)
                        }
                        className="h-4 w-4"
                    />
                    <Label
                        htmlFor="is_milestone_template"
                        className="flex flex-1 cursor-pointer items-center gap-2 py-1 text-xs font-medium"
                    >
                        <Diamond
                            className={cn(
                                'h-3.5 w-3.5 transition-colors',
                                data.is_milestone
                                    ? 'fill-amber-500/20 text-amber-500'
                                    : 'text-muted-foreground/40',
                            )}
                        />
                        <span>Milestone Task</span>
                    </Label>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-9 px-4 text-xs font-semibold"
                        onClick={onCancel}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={processing || !data.title.trim()}
                        size="sm"
                        className="h-9 px-6 text-xs font-bold"
                    >
                        {isEditing ? 'Update Task' : 'Save Task'}
                    </Button>
                </div>
            </div>
        </form>
    );
}
