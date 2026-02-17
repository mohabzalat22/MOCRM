import {
    DndContext,
    DragOverlay,
    MouseSensor,
    TouchSensor,
    useSensor,
    useSensors,
    closestCenter,
    defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import type {
    DragEndEvent,
    DragStartEvent} from '@dnd-kit/core';
import type { DropAnimation } from '@dnd-kit/core';
import {
    SortableContext,
    rectSortingStrategy,
} from '@dnd-kit/sortable';
import type { ReactNode} from 'react';
import { useState } from 'react';
import type { WidgetConfig } from '@/types';
import { SortableWidget } from './sortable-widget';

// Map specific widgets to their grid spans
const WIDGET_SPANS: Record<string, string> = {
    weeklySummary: 'col-span-1 lg:col-span-3',
    metrics: 'col-span-1 lg:col-span-3',
    quickActions: 'col-span-1',
    dueTodayTasks: 'col-span-1',
    todayReminders: 'col-span-1',
    activeProjects: 'col-span-1 lg:col-span-2',
    clientHealth: 'col-span-1',
    activityFeed: 'col-span-1',
};

interface DashboardLayoutProps {
    widgets: Record<string, ReactNode>;
    layout: WidgetConfig[];
    onDragEnd: (event: DragEndEvent) => void;
    isEditMode: boolean;
    onHideWidget: (id: string) => void;
}

export function DashboardLayout({
    widgets,
    layout,
    onDragEnd,
    isEditMode,
    onHideWidget,
}: DashboardLayoutProps) {
    const [activeId, setActiveId] = useState<string | null>(null);
    const [activeRect, setActiveRect] = useState<{ width: number; height: number } | null>(null);

    const sensors = useSensors(
        useSensor(MouseSensor, {
            activationConstraint: {
                distance: 10,
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 250,
                tolerance: 5,
            },
        })
    );

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        setActiveId(active.id as string);
        
        // Use direct DOM measurement for precision
        const element = document.getElementById(`widget-${active.id}`);
        if (element) {
            const rect = element.getBoundingClientRect();
            setActiveRect({
                width: rect.width,
                height: rect.height,
            });
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        setActiveId(null);
        setActiveRect(null);
        onDragEnd(event);
    };

    const dropAnimation: DropAnimation = {
        sideEffects: defaultDropAnimationSideEffects({
            styles: {
                active: {
                    opacity: '0.5',
                },
            },
        }),
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <SortableContext
                items={layout.map((w) => w.id)}
                strategy={rectSortingStrategy}
            >
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 auto-rows-min">
                    {layout
                        .filter((widget) => widget.visible)
                        .map((widget) => (
                            <SortableWidget
                                key={widget.id}
                                id={widget.id}
                                className={WIDGET_SPANS[widget.id] || 'col-span-1'}
                                isEditMode={isEditMode}
                                onHide={onHideWidget}
                            >
                                {widgets[widget.id]}
                            </SortableWidget>
                        ))}
                </div>
            </SortableContext>

            <DragOverlay dropAnimation={dropAnimation}>
                {activeId && activeRect ? (
                    <div 
                        className="pointer-events-none"
                        style={{
                            width: activeRect.width,
                            height: activeRect.height,
                        }}
                    >
                        <div className="rounded-lg border bg-background shadow-2xl ring-2 ring-primary/10 h-full overflow-hidden outline-none">
                            {widgets[activeId]}
                        </div>
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}
