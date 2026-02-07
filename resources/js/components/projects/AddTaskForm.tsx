import { Plus } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { taskService } from '@/services/taskService';

interface AddTaskFormProps {
    projectId: number;
}

export function AddTaskForm({ projectId }: AddTaskFormProps) {
    const [isAdding, setIsAdding] = useState(false);
    const { data, setData, processing, reset, errors } =
        taskService.useTaskForm(projectId);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        taskService.createTask(data, {
            onSuccess: () => {
                reset('description');
                setIsAdding(false);
            },
        });
    };

    if (!isAdding) {
        return (
            <Button
                variant="ghost"
                className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
                onClick={() => setIsAdding(true)}
            >
                <Plus className="h-4 w-4" /> Add Task
            </Button>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-2">
            <div className="flex gap-2">
                <Input
                    value={data.description}
                    onChange={(e) => setData('description', e.target.value)}
                    placeholder="Enter task description..."
                    autoFocus
                    disabled={processing}
                    className={errors.description ? 'border-destructive' : ''}
                />
                <Button
                    type="submit"
                    disabled={processing || !data.description}
                >
                    Add
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                        setIsAdding(false);
                        reset('description');
                    }}
                >
                    Cancel
                </Button>
            </div>
            {errors.description && (
                <p className="text-xs text-destructive">{errors.description}</p>
            )}
        </form>
    );
}
