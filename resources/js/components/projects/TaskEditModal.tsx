import { Diamond } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useTaskForm } from '@/hooks/use-task-form';
import type { Task } from '@/types/project';
import {
    TaskBasicFields,
    TaskStatusPriorityFields,
    TaskDateFields,
    TaskParentMilestoneFields,
} from './TaskFormFields';

interface TaskEditModalProps {
    task: Task;
    projectTasks: Task[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function TaskEditModal({
    task,
    projectTasks,
    open,
    onOpenChange,
}: TaskEditModalProps) {
    const {
        title,
        setTitle,
        description,
        setDescription,
        status,
        setStatus,
        priority,
        setPriority,
        startDate,
        setStartDate,
        dueDate,
        setDueDate,
        isMilestone,
        setIsMilestone,
        parentId,
        setParentId,
        saving,
        handleSave,
    } = useTaskForm({
        task,
        onSuccess: () => onOpenChange(false),
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex max-h-[90vh] w-full max-w-lg flex-col p-0">
                <div className="hide-scrollbar flex flex-1 flex-col overflow-y-auto p-6">
                    <DialogHeader className="pb-4">
                        <DialogTitle className="flex items-center gap-2 text-base">
                            {isMilestone ? (
                                <Diamond className="h-4 w-4 fill-warning/20 text-warning" />
                            ) : null}
                            Edit Task
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-5 py-2">
                        <TaskBasicFields
                            title={title}
                            setTitle={setTitle}
                            description={description}
                            setDescription={setDescription}
                        />

                        <Separator />

                        <TaskStatusPriorityFields
                            status={status}
                            setStatus={setStatus}
                            priority={priority}
                            setPriority={setPriority}
                        />

                        <TaskDateFields
                            startDate={startDate}
                            setStartDate={setStartDate}
                            dueDate={dueDate}
                            setDueDate={setDueDate}
                        />

                        <Separator />

                        <TaskParentMilestoneFields
                            parentId={parentId}
                            setParentId={setParentId}
                            isMilestone={isMilestone}
                            setIsMilestone={setIsMilestone}
                            projectTasks={projectTasks}
                            taskId={task.id}
                        />
                    </div>
                </div>

                <DialogFooter className="bg-muted/30 px-6 py-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onOpenChange(false)}
                        disabled={saving}
                    >
                        Cancel
                    </Button>
                    <Button
                        size="sm"
                        onClick={handleSave}
                        disabled={saving || !title.trim()}
                        className="min-w-[90px]"
                    >
                        {saving ? 'Saving…' : 'Save Changes'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
