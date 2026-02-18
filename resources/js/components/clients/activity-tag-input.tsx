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
import { Label } from '@/components/ui/label';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn, TAG_COLORS } from '@/lib/utils';
import { useClientStore } from '@/stores/useClientStore';
import type { Tag } from '@/types';

export interface ActivityTag {
    name: string;
    color: string;
    id?: number; // Existing tags have IDs
}

interface ActivityTagInputProps {
    className?: string;
    tags: ActivityTag[];
    onChange: (tags: ActivityTag[]) => void;
}

export default function ActivityTagInput({
    className = '',
    tags,
    onChange,
}: ActivityTagInputProps) {
    const { allTags } = useClientStore();

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
                tags.some(
                    (t) =>
                        t.name.toLowerCase() === tagName.trim().toLowerCase(),
                )
            ) {
                setInputValue('');
                setOpen(false);
                return;
            }

            const newTags = [
                ...tags,
                { name: tagName.trim(), color: color || selectedColor },
            ];

            onChange(newTags);
            setInputValue('');
            setOpen(false);

            setTimeout(() => {
                inputRef.current?.focus();
            }, 10);
        },
        [selectedColor, tags, onChange],
    );

    const handleRemoveTag = useCallback(
        (tagName: string) => {
            const newTags = tags.filter((t) => t.name !== tagName);
            onChange(newTags);

            setTimeout(() => {
                inputRef.current?.focus();
            }, 10);
        },
        [tags, onChange],
    );

    const filteredSuggestions = allTags.filter(
        (tag: Tag) =>
            tag.name.toLowerCase().includes(inputValue.toLowerCase()) &&
            !tags.find((t) => t.name.toLowerCase() === tag.name.toLowerCase()),
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
                <Label className="text-sm font-medium">Activity Tags</Label>
                <div className="flex min-h-[2.5rem] flex-wrap gap-2 rounded-lg border bg-muted/30 p-2">
                    {tags.length > 0 ? (
                        tags.map((tag, idx) => (
                            <Badge
                                key={`${tag.name}-${idx}`}
                                className="gap-1 px-2 py-1 text-xs text-white transition-opacity hover:opacity-90"
                                style={{ backgroundColor: tag.color }}
                            >
                                {tag.name}
                                <button
                                    type="button"
                                    className="ml-1 rounded-sm hover:bg-white/20"
                                    onClick={() => handleRemoveTag(tag.name)}
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </Badge>
                        ))
                    ) : (
                        <p className="p-1 text-xs text-muted-foreground italic">
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
