import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, EyeOff } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SortableWidgetProps {
    id: string;
    children: ReactNode;
    className?: string;
    onHide?: (id: string) => void;
    isEditMode?: boolean;
}

export function SortableWidget({
    id,
    children,
    className,
    onHide,
    isEditMode,
}: SortableWidgetProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 'auto',
    };

    return (
        <div
            id={`widget-${id}`}
            ref={setNodeRef}
            style={style}
            className={cn(
                'group relative h-full transition-shadow duration-200',
                isDragging &&
                    'rounded-lg bg-muted/10 ring-2 ring-muted ring-inset',
                className,
            )}
        >
            {isEditMode && (
                <div
                    className={cn(
                        'absolute top-2 right-2 z-10 flex gap-1 rounded-md border bg-background/80 p-1 opacity-0 shadow-sm backdrop-blur-sm transition-opacity group-hover:opacity-100',
                        isDragging && 'hidden',
                    )}
                >
                    {/* Drag Handle */}
                    <div
                        className="cursor-grab rounded p-1 hover:bg-muted active:cursor-grabbing"
                        {...attributes}
                        {...listeners}
                    >
                        <GripVertical className="h-4 w-4" />
                    </div>
                    {/* Hide Button */}
                    <div
                        className="cursor-pointer rounded p-1 text-muted-foreground hover:bg-muted hover:text-destructive"
                        onClick={(e) => {
                            e.stopPropagation();
                            onHide?.(id);
                        }}
                    >
                        <EyeOff className="h-4 w-4" />
                    </div>
                </div>
            )}
            <div className={cn('h-full', isDragging && 'invisible')}>
                {children}
            </div>
        </div>
    );
}
