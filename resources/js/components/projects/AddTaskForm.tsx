import { format } from 'date-fns';
import { Calendar as CalendarIcon, Milestone, Plus, GitBranch } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { taskService } from '@/services/taskService';
import type { Task } from '@/types/project';

interface AddTaskFormProps {
    projectId: number;
    projectTasks?: Task[];
}

const EMPTY_TASKS: Task[] = [];

export function AddTaskForm({ projectId, projectTasks = EMPTY_TASKS }: AddTaskFormProps) {
    const [isAdding, setIsAdding] = useState(false);
    const { data, setData, processing, reset, errors } =
        taskService.useTaskForm(projectId);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        taskService.createTask(data, {
            onSuccess: () => {
                reset();
                setIsAdding(false);
            },
        });
    };

    if (!isAdding) {
        return (
            <div className="px-1">
                <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-muted-foreground hover:text-primary transition-colors h-10 px-4"
                    onClick={() => setIsAdding(true)}
                >
                    <Plus className="h-4 w-4" />
                    <span className="font-medium text-sm">Add task</span>
                </Button>
            </div>
        );
    }

    return (
        <div className="px-1">
            <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg bg-card/50 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="space-y-2">
                    <Label className="text-xs font-semibold text-muted-foreground ml-1">Description</Label>
                    <Input
                        value={data.description}
                        onChange={(e) => setData('description', e.target.value)}
                        placeholder="What needs to be done?"
                        autoFocus
                        disabled={processing}
                        className={cn(
                            "h-9 text-sm font-medium",
                            errors.description && "border-destructive focus-visible:ring-destructive"
                        )}
                    />
                    {errors.description && (
                        <p className="text-[11px] font-medium text-destructive ml-1">{errors.description}</p>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                        <Label className="text-[11px] font-semibold text-muted-foreground ml-1">Start Date</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className={cn(
                                        "w-full h-9 justify-start text-left font-medium bg-muted/20",
                                        !data.start_date && "text-muted-foreground/60"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-3.5 w-3.5 opacity-50" />
                                    {data.start_date ? format(new Date(data.start_date), "MMM d, yyyy") : <span>Start</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 shadow-xl" align="start">
                                <Calendar
                                    mode="single"
                                    selected={data.start_date ? new Date(data.start_date) : undefined}
                                    onSelect={(date) => setData('start_date', date ? format(date, 'yyyy-MM-dd') : null)}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-[11px] font-semibold text-muted-foreground ml-1">Due Date</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className={cn(
                                        "w-full h-9 justify-start text-left font-medium bg-muted/20",
                                        !data.due_date && "text-muted-foreground/60"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-3.5 w-3.5 opacity-50" />
                                    {data.due_date ? format(new Date(data.due_date), "MMM d, yyyy") : <span>End</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 shadow-xl" align="start">
                                <Calendar
                                    mode="single"
                                    selected={data.due_date ? new Date(data.due_date) : undefined}
                                    onSelect={(date) => setData('due_date', date ? format(date, 'yyyy-MM-dd') : null)}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-[11px] font-semibold text-muted-foreground ml-1">Parent</Label>
                        <Select
                            value={data.parent_id?.toString() || "none"}
                            onValueChange={(value) => setData('parent_id', value === "none" ? null : parseInt(value))}
                        >
                            <SelectTrigger className="w-full h-9 text-xs font-medium bg-muted/20">
                                <SelectValue placeholder="Parent task" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">None (Root)</SelectItem>
                                {projectTasks.map((task) => (
                                    <SelectItem key={task.id} value={task.id.toString()}>
                                        <div className="flex items-center gap-2">
                                            {task.is_milestone ? (
                                                <Milestone className="h-3.5 w-3.5 text-warning" />
                                            ) : (
                                                <GitBranch className="h-3.5 w-3.5 text-muted-foreground" />
                                            )}
                                            <span className="truncate max-w-[150px] font-medium">{task.description}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-3 px-3 py-1.5 rounded-md hover:bg-muted/50 transition-colors group">
                        <Checkbox
                            id="is_milestone_add"
                            checked={data.is_milestone}
                            onCheckedChange={(checked) => setData('is_milestone', checked as boolean)}
                            className="h-4 w-4"
                        />
                        <Label 
                            htmlFor="is_milestone_add" 
                            className="text-xs font-medium cursor-pointer flex items-center gap-2 flex-1 py-1"
                        >
                            <Milestone className={cn(
                                "h-3.5 w-3.5 transition-colors", 
                                data.is_milestone ? "text-warning fill-warning/10" : "text-muted-foreground/40"
                            )} />
                            <span>Milestone Task</span>
                        </Label>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-9 px-4 text-xs font-semibold"
                            onClick={() => {
                                setIsAdding(false);
                                reset();
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing || !data.description.trim()}
                            size="sm"
                            className="h-9 px-6 text-xs font-bold"
                        >
                            Save Task
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}
