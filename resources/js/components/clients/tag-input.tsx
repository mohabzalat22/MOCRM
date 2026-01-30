import { router, useRemember } from '@inertiajs/react';
import { X, Plus, Tag as TagIcon } from 'lucide-react';
import { useState, useRef, useCallback, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn, TAG_COLORS, getModelClass } from '@/lib/utils';
import type { Tag, TaggableType } from '@/types';

import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';

interface TagInputProps {
    taggableId: number;
    taggableType?: TaggableType;
    existingTags?: Tag[];
    allTags?: Tag[];
    popularTags?: Tag[];
    className?: string;
    editMode?: boolean;
}

export default function TagInput({
    taggableId,
    taggableType = 'client',
    existingTags = [],
    allTags = [],
    popularTags = [],
    className = '',
    editMode = false,
}: TagInputProps) {
    // Use useRemember to persist state across Inertia visits
    const [inputValue, setInputValue] = useRemember('');
    const [selectedColor, setSelectedColor] = useRemember<
        (typeof TAG_COLORS)[number]
    >(TAG_COLORS[0]);
    const [open, setOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const popoverContentRef = useRef<HTMLDivElement>(null);

    // Focus the input when the component mounts and after interactions
    useEffect(() => {
        if (!editMode) return;
        const focusInput = () => {
            setTimeout(() => {
                inputRef.current?.focus();
            }, 10);
        };
        focusInput();
    }, [editMode]);

    // Handle outside clicks to close popover without losing focus
    useEffect(() => {
        if (!editMode) return;
        const handleClickOutside = (event: MouseEvent) => {
            if (
                popoverContentRef.current &&
                !popoverContentRef.current.contains(event.target as Node) &&
                inputRef.current &&
                !inputRef.current.contains(event.target as Node)
            ) {
                setOpen(false);
                // Return focus to input after closing popover
                setTimeout(() => {
                    inputRef.current?.focus();
                }, 10);
            }
        };
        if (open) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }
    }, [open, editMode]);

    const handleAddTag = useCallback(
        (tagName: string, color: string) => {
            if (!tagName.trim()) return;

            router.post(
                '/tags',
                {
                    name: tagName.trim(),
                    color: color || selectedColor,
                    taggable_id: taggableId,
                    taggable_type: getModelClass(taggableType),
                },
                {
                    preserveScroll: true,
                    preserveState: true,
                    onSuccess: () => {
                        setInputValue('');
                        setOpen(false);
                        // Return focus to input
                        setTimeout(() => {
                            inputRef.current?.focus();
                        }, 10);
                    },
                    onError: (errors) => {
                        console.error('Error adding tag:', errors);
                        // Keep focus on input even on error
                        inputRef.current?.focus();
                    },
                },
            );
        },
        [taggableId, taggableType, selectedColor, setInputValue],
    );

    const handleRemoveTag = useCallback(
        (tagId: number) => {
            router.delete(
                `/${taggableType.toLowerCase()}/${taggableId}/tags/${tagId}`,
                {
                    preserveScroll: true,
                    preserveState: true,
                    onSuccess: () => {
                        setTimeout(() => {
                            inputRef.current?.focus();
                        }, 10);
                    },
                },
            );
        },
        [taggableId, taggableType],
    );

    const filteredSuggestions = allTags.filter(
        (tag) =>
            tag.name.toLowerCase().includes(inputValue.toLowerCase()) &&
            !existingTags.find((t) => t.id === tag.id),
    );

    const handleInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;
            setInputValue(value);
            setOpen(value.length > 0);
        },
        [setInputValue],
    );

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleAddTag(inputValue, selectedColor);
            }
            if (e.key === 'Escape') {
                setOpen(false);
                // Keep focus on input after Escape
                setTimeout(() => {
                    inputRef.current?.focus();
                }, 10);
            }
        },
        [inputValue, selectedColor, handleAddTag],
    );

    const handleExistingTagSelect = useCallback(
        (tagName: string, tagColor: string) => {
            handleAddTag(tagName, tagColor);
        },
        [handleAddTag],
    );

    const handlePopularTagClick = useCallback(
        (tag: Tag) => {
            handleAddTag(tag.name, tag.color);
        },
        [handleAddTag],
    );

    const handleInputFocus = useCallback(() => {
        if (inputValue.length > 0) {
            setOpen(true);
        }
    }, [inputValue]);

    const handleInputBlur = useCallback(
        (e: React.FocusEvent<HTMLInputElement>) => {
            // Don't close popover if focus is moving to popover content
            if (popoverContentRef.current?.contains(e.relatedTarget as Node)) {
                return;
            }
            // Delay closing to allow for click events on popover items
            setTimeout(() => {
                if (
                    !popoverContentRef.current?.contains(document.activeElement)
                ) {
                    setOpen(false);
                }
            }, 100);
        },
        [],
    );

    return (
        <div className={cn('space-y-4', className)}>
            {/* Current Tags */}
            <div className="space-y-2">
                <Label className="text-sm font-medium">Current Tags</Label>
                <div className="flex min-h-[2.5rem] flex-wrap gap-2 rounded-lg border bg-muted/30 p-3">
                    {existingTags.length > 0 ? (
                        existingTags.map((tag) => (
                            <Badge
                                key={tag.id}
                                className="gap-1 px-3 py-1.5 pr-2 text-sm text-white transition-opacity hover:opacity-90"
                                style={{ backgroundColor: tag.color }}
                            >
                                {tag.name}
                                {editMode && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-5 w-5 rounded-sm p-0 hover:bg-white/20"
                                        onClick={() => handleRemoveTag(tag.id)}
                                        onMouseDown={(e) => e.preventDefault()} // Prevent focus loss
                                        aria-label={`Remove ${tag.name} tag`}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                            </Badge>
                        ))
                    ) : (
                        <p className="text-sm text-muted-foreground italic">
                            No tags yet. {editMode ? 'Add some below.' : ''}
                        </p>
                    )}
                </div>
            </div>

            {/* Add Tag Input */}
            {editMode && (
                <div className="space-y-2">
                    <Label className="text-sm font-medium">Add New Tag</Label>
                    <div className="flex gap-2">
                        {/* Input with Autocomplete */}
                        <div className="relative flex-1">
                            <Input
                                ref={inputRef}
                                type="text"
                                placeholder="Type to add or search tags..."
                                value={inputValue}
                                onChange={handleInputChange}
                                onKeyDown={handleKeyDown}
                                onFocus={handleInputFocus}
                                onBlur={handleInputBlur}
                                className="pr-10"
                                autoFocus
                            />
                            <TagIcon className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                            {/* Popover that doesn't steal focus */}
                            {open && inputValue.length > 0 && (
                                <div
                                    ref={popoverContentRef}
                                    className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md"
                                    style={{
                                        top: '100%',
                                        left: 0,
                                        right: 0,
                                    }}
                                    onMouseDown={(e) => e.preventDefault()} // Prevent focus steal
                                >
                                    <Command>
                                        <CommandList>
                                            {filteredSuggestions.length ===
                                            0 ? (
                                                <CommandEmpty>
                                                    <div className="py-6 text-center text-sm">
                                                        <p className="text-muted-foreground">
                                                            No existing tags
                                                            found
                                                        </p>
                                                        <p className="mt-1 text-xs text-muted-foreground">
                                                            Press Enter to
                                                            create "{inputValue}
                                                            "
                                                        </p>
                                                    </div>
                                                </CommandEmpty>
                                            ) : (
                                                <CommandGroup heading="Existing Tags">
                                                    {filteredSuggestions.map(
                                                        (tag) => (
                                                            <CommandItem
                                                                key={tag.id}
                                                                onSelect={() =>
                                                                    handleExistingTagSelect(
                                                                        tag.name,
                                                                        tag.color,
                                                                    )
                                                                }
                                                                onMouseDown={(
                                                                    e,
                                                                ) => {
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                    handleExistingTagSelect(
                                                                        tag.name,
                                                                        tag.color,
                                                                    );
                                                                }}
                                                                className="flex cursor-pointer items-center justify-between px-3 py-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    <div
                                                                        className="h-3 w-3 rounded-full ring-1 ring-gray-300 ring-offset-1"
                                                                        style={{
                                                                            backgroundColor:
                                                                                tag.color,
                                                                        }}
                                                                    />
                                                                    <span className="font-medium">
                                                                        {
                                                                            tag.name
                                                                        }
                                                                    </span>
                                                                </div>
                                                                {tag.usage_count >
                                                                    0 && (
                                                                    <Badge
                                                                        variant="secondary"
                                                                        className="ml-2 text-xs"
                                                                    >
                                                                        {
                                                                            tag.usage_count
                                                                        }
                                                                    </Badge>
                                                                )}
                                                            </CommandItem>
                                                        ),
                                                    )}
                                                </CommandGroup>
                                            )}
                                        </CommandList>
                                    </Command>
                                </div>
                            )}
                        </div>

                        {/* Color Picker */}
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-12 p-0"
                                    aria-label="Select color"
                                    onMouseDown={(e) => e.preventDefault()} // Prevent focus loss
                                >
                                    <div
                                        className="h-6 w-6 rounded-full ring-2 ring-gray-200 ring-offset-2"
                                        style={{
                                            backgroundColor: selectedColor,
                                        }}
                                    />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent
                                className="w-auto p-3"
                                align="end"
                                onOpenAutoFocus={(e) => e.preventDefault()} // Prevent auto-focus
                            >
                                <div className="grid grid-cols-6 gap-2">
                                    {TAG_COLORS.map((color) => (
                                        <button
                                            key={color}
                                            type="button"
                                            onClick={() => {
                                                setSelectedColor(color);
                                                setTimeout(() => {
                                                    inputRef.current?.focus();
                                                }, 10);
                                            }}
                                            onMouseDown={(e) =>
                                                e.preventDefault()
                                            } // Prevent focus loss
                                            className={cn(
                                                'h-8 w-8 rounded-full transition-all hover:scale-110',
                                                selectedColor === color
                                                    ? 'ring-2 ring-gray-900 ring-offset-2'
                                                    : 'ring-1 ring-gray-200',
                                            )}
                                            style={{ backgroundColor: color }}
                                            aria-label={`Select color ${color}`}
                                        />
                                    ))}
                                </div>
                            </PopoverContent>
                        </Popover>

                        {/* Add Button */}
                        <Button
                            type="button"
                            onClick={() =>
                                handleAddTag(inputValue, selectedColor)
                            }
                            onMouseDown={(e) => e.preventDefault()} // Prevent focus loss
                            disabled={!inputValue.trim()}
                            className="gap-2"
                        >
                            <Plus className="h-4 w-4" />
                            Add
                        </Button>
                    </div>
                </div>
            )}

            {/* Popular Tags */}
            {editMode && popularTags && popularTags.length > 0 && (
                <div className="space-y-2">
                    <Label className="text-sm font-medium">Popular Tags</Label>
                    <div className="flex flex-wrap gap-2">
                        {popularTags
                            .filter(
                                (tag) =>
                                    !existingTags.find((t) => t.id === tag.id),
                            )
                            .slice(0, 6)
                            .map((tag) => (
                                <Button
                                    key={tag.id}
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePopularTagClick(tag)}
                                    onMouseDown={(e) => e.preventDefault()} // Prevent focus loss
                                    className="h-8 gap-1.5"
                                    style={{
                                        borderColor: tag.color,
                                        color: tag.color,
                                    }}
                                >
                                    <Plus className="h-3 w-3" />
                                    {tag.name}
                                </Button>
                            ))}
                    </div>
                </div>
            )}
        </div>
    );
}
