import { router } from '@inertiajs/react';
import { X, Plus, Tag as TagIcon } from 'lucide-react';
import { useState, useRef, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Command,
    CommandGroup,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn, TAG_COLORS } from '@/lib/utils';
import type { Tag } from '@/types';

interface ProjectTagInputProps {
    className?: string;
    projectId: number;
    currentTags: Tag[];
    allTags: Tag[];
}

export default function ProjectTagInput({
    className = '',
    projectId,
    currentTags,
    allTags,
}: ProjectTagInputProps) {
    const [inputValue, setInputValue] = useState('');
    const [selectedColor, setSelectedColor] = useState<string>(TAG_COLORS[0]);
    const [open, setOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const popoverContentRef = useRef<HTMLDivElement>(null);

    const handleAddTag = useCallback(
        (tagName: string, color: string) => {
            if (!tagName.trim()) return;

            // Check if already in current tags
            if (
                currentTags.some(
                    (t) =>
                        t.name.toLowerCase() === tagName.trim().toLowerCase(),
                )
            ) {
                setInputValue('');
                setOpen(false);
                return;
            }

            router.post(
                route('tags.store'),
                {
                    taggable_type: 'project',
                    taggable_id: projectId,
                    name: tagName.trim(),
                    color: color || selectedColor,
                },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        setInputValue('');
                        setOpen(false);
                    },
                },
            );
        },
        [selectedColor, projectId, currentTags],
    );

    const handleRemoveTag = useCallback(
        (tagId: number) => {
            router.delete(
                route('tags.destroy', {
                    taggableType: 'project',
                    taggableId: projectId,
                    tag: tagId,
                }),
                {
                    preserveScroll: true,
                },
            );
        },
        [projectId],
    );

    const filteredSuggestions = allTags.filter(
        (tag: Tag) =>
            tag.name.toLowerCase().includes(inputValue.toLowerCase()) &&
            !currentTags.find((t) => t.id === tag.id),
    );

    const handleInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;
            setInputValue(value);
            setOpen(value.length > 0);
        },
        [],
    );

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleAddTag(inputValue, selectedColor);
            }
            if (e.key === 'Escape') {
                setOpen(false);
                setTimeout(() => {
                    inputRef.current?.focus();
                }, 10);
            }
        },
        [inputValue, selectedColor, handleAddTag],
    );

    return (
        <div className={cn('space-y-4', className)}>
            <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                    {currentTags.length > 0 ? (
                        currentTags.map((tag) => (
                            <Badge
                                key={tag.id}
                                className="gap-1 px-2 py-1 text-xs text-white transition-opacity hover:opacity-90"
                                style={{ backgroundColor: tag.color }}
                            >
                                {tag.name}
                                <button
                                    type="button"
                                    className="ml-1 rounded-sm hover:bg-white/20"
                                    onClick={() => handleRemoveTag(tag.id)}
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </Badge>
                        ))
                    ) : (
                        <p className="text-sm text-muted-foreground italic">
                            No tags selected.
                        </p>
                    )}
                </div>
            </div>

            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Input
                        ref={inputRef}
                        type="text"
                        placeholder="Add tags..."
                        value={inputValue}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        className="h-9 pr-10 text-sm"
                    />
                    <TagIcon className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                    {open && inputValue.length > 0 && (
                        <div
                            ref={popoverContentRef}
                            className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md"
                            style={{ top: '100%', left: 0 }}
                            onMouseDown={(e) => e.preventDefault()}
                        >
                            <Command>
                                <CommandList>
                                    <CommandGroup heading="Suggestions">
                                        {filteredSuggestions.map((tag) => (
                                            <CommandItem
                                                key={tag.id}
                                                onSelect={() =>
                                                    handleAddTag(
                                                        tag.name,
                                                        tag.color,
                                                    )
                                                }
                                                className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm"
                                            >
                                                <div
                                                    className="h-3 w-3 rounded-full"
                                                    style={{
                                                        backgroundColor:
                                                            tag.color,
                                                    }}
                                                />
                                                {tag.name}
                                            </CommandItem>
                                        ))}
                                        {filteredSuggestions.length === 0 && (
                                            <div className="px-3 py-2 text-xs text-muted-foreground">
                                                Press Enter to create "
                                                {inputValue}"
                                            </div>
                                        )}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </div>
                    )}
                </div>

                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            type="button"
                            variant="outline"
                            className="h-9 w-10 p-0"
                        >
                            <div
                                className="h-5 w-5 rounded-full"
                                style={{ backgroundColor: selectedColor }}
                            />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-2" align="end">
                        <div className="grid grid-cols-5 gap-1">
                            {TAG_COLORS.map((color) => (
                                <button
                                    key={color}
                                    type="button"
                                    onClick={() => {
                                        setSelectedColor(color);
                                        inputRef.current?.focus();
                                    }}
                                    className={cn(
                                        'h-6 w-6 rounded-full',
                                        selectedColor === color &&
                                            'ring-2 ring-primary ring-offset-1',
                                    )}
                                    style={{ backgroundColor: color }}
                                />
                            ))}
                        </div>
                    </PopoverContent>
                </Popover>

                <Button
                    type="button"
                    size="sm"
                    onClick={() => handleAddTag(inputValue, selectedColor)}
                    disabled={!inputValue.trim()}
                    className="h-9"
                >
                    <Plus className="mr-1 h-4 w-4" />
                    Add
                </Button>
            </div>
        </div>
    );
}
