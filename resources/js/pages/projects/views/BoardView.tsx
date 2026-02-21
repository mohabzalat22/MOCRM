import type {
    DragStartEvent,
    DragEndEvent,
    DragOverEvent,
} from '@dnd-kit/core';
import {
    DndContext,
    DragOverlay,
    useSensor,
    useSensors,
    PointerSensor,
    TouchSensor,
    closestCorners,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { taskService } from '@/services/taskService';
import type { Task } from '@/types/project';
import { Column } from './Column';
import { TaskCard } from './TaskCard';

interface BoardViewProps {
    tasks: Task[];
    onEditTask: (task: Task) => void;
}

const COLUMNS = [
    { id: 'todo', title: 'To Do' },
    { id: 'in_progress', title: 'In Progress' },
    { id: 'review', title: 'Review' },
    { id: 'done', title: 'Done' },
];

export function BoardView({ tasks: initialTasks, onEditTask }: BoardViewProps) {
    const [tasks, setTasks] = useState(initialTasks);
    const [activeTask, setActiveTask] = useState<Task | null>(null);

    // Keep tasks state in sync with props
    useEffect(() => {
        setTasks(initialTasks);
    }, [initialTasks]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 10,
            },
        }),
        useSensor(TouchSensor),
    );

    const columns = useMemo(() => {
        return COLUMNS.map((col) => ({
            ...col,
            tasks: tasks
                .filter((task) => task.status === col.id)
                .sort((a, b) => a.order - b.order),
        }));
    }, [tasks]);

    function onDragStart(event: DragStartEvent) {
        if (event.active.data.current?.type === 'Task') {
            setActiveTask(event.active.data.current.task);
        }
    }

    function onDragOver(event: DragOverEvent) {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;

        const isActiveATask = active.data.current?.type === 'Task';
        const isOverATask = over.data.current?.type === 'Task';

        if (!isActiveATask) return;

        // Find the containers
        const activeContainer =
            active.data.current?.sortable?.containerId ||
            tasks.find((t) => t.id === activeId)?.status;
        const overContainer = isOverATask
            ? over.data.current?.sortable?.containerId ||
              tasks.find((t) => t.id === overId)?.status
            : over.id;

        if (
            !activeContainer ||
            !overContainer ||
            activeContainer === overContainer
        ) {
            return;
        }

        setTasks((prev) => {
            const activeIndex = prev.findIndex((t) => t.id === activeId);
            const overIndex = isOverATask
                ? prev.findIndex((t) => t.id === overId)
                : -1;

            let newIndex;
            if (isOverATask) {
                newIndex = overIndex;
            } else {
                newIndex = prev.length;
            }

            const newTasks = [...prev];
            newTasks[activeIndex] = {
                ...newTasks[activeIndex],
                status: overContainer as Task['status'],
            };

            return arrayMove(newTasks, activeIndex, newIndex);
        });
    }

    function onDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        setActiveTask(null);

        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        const activeTask = tasks.find((t) => t.id === activeId);
        if (!activeTask) return;

        const initialTask = initialTasks.find((t) => t.id === activeId);
        const statusChanged = activeTask.status !== initialTask?.status;

        // Final sorting/ordering
        const columnTasks = tasks
            .filter((t) => t.status === activeTask.status)
            .sort((a, b) => a.order - b.order);
        const activeIndex = columnTasks.findIndex((t) => t.id === activeId);
        const overIndex = COLUMNS.some((col) => col.id === overId)
            ? columnTasks.length - 1
            : columnTasks.findIndex((t) => t.id === overId);

        if (
            activeIndex !== -1 &&
            overIndex !== -1 &&
            (activeIndex !== overIndex || statusChanged)
        ) {
            const movedTasks = arrayMove(columnTasks, activeIndex, overIndex);
            const reorderedTasks = movedTasks.map((t, idx) => ({
                ...t,
                order: idx + 1,
            }));

            // Update local state for final orders
            setTasks((prev) =>
                prev.map((t) => {
                    const found = reorderedTasks.find((rt) => rt.id === t.id);
                    return found ? found : t;
                }),
            );

            // Persist status if changed
            if (statusChanged) {
                taskService.updateTask(activeId as number, {
                    status: activeTask.status,
                });
            }

            // Persist reorder
            taskService.reorderTasks(
                reorderedTasks.map((t) => ({ id: t.id, order: t.order })),
            );
        }
    }

    return (
        <div className="flex h-full gap-4 overflow-x-auto p-4">
            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={onDragStart}
                onDragOver={onDragOver}
                onDragEnd={onDragEnd}
            >
                {columns.map((col) => {
                    const { id, title } = col;
                    return (
                        <Column
                            key={id}
                            column={{ id, title }}
                            tasks={tasks.filter((t) => t.status === id)}
                            onEditTask={onEditTask}
                        />
                    );
                })}
                {createPortal(
                    <DragOverlay>
                        {activeTask && <TaskCard task={activeTask} isOverlay />}
                    </DragOverlay>,
                    document.body,
                )}
            </DndContext>
        </div>
    );
}
