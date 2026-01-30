import { router } from '@inertiajs/react';
import { X, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Tag } from '@/types';

interface TagFilterProps {
    allTags?: Tag[];
    selectedTags?: number[];
    baseUrl?: string;
    className?: string;
}

export default function TagFilter({
    allTags = [],
    selectedTags = [],
    baseUrl = '/clients',
    className = '',
}: TagFilterProps) {
    const toggleTag = (tagId: number) => {
        const newSelection = selectedTags.includes(tagId)
            ? selectedTags.filter((id) => id !== tagId)
            : [...selectedTags, tagId];

        const params = new URLSearchParams();
        if (newSelection.length > 0) {
            newSelection.forEach((id) =>
                params.append('tags[]', id.toString()),
            );
        }

        const url = params.toString()
            ? `${baseUrl}?${params.toString()}`
            : baseUrl;

        router.get(
            url,
            {},
            {
                preserveState: true,
                preserveScroll: true,
                only: ['clients', 'selectedTags'],
            },
        );
    };

    const clearFilters = () => {
        router.get(
            baseUrl,
            {},
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    if (allTags.length === 0) {
        return null;
    }

    return (
        <Card className={cn(className)}>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-muted-foreground" />
                        <CardTitle className="text-sm font-semibold">
                            Filter by Tags
                        </CardTitle>
                        {selectedTags.length > 0 && (
                            <Badge variant="secondary" className="ml-2">
                                {selectedTags.length}
                            </Badge>
                        )}
                    </div>
                    {selectedTags.length > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearFilters}
                            className="h-7 gap-1 text-xs"
                        >
                            <X className="h-3 w-3" />
                            Clear
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex flex-wrap gap-2">
                    {allTags.map((tag) => {
                        const isSelected = selectedTags.includes(tag.id);
                        return (
                            <Button
                                key={tag.id}
                                variant={isSelected ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => toggleTag(tag.id)}
                                className={cn(
                                    'h-8 gap-1 transition-all',
                                    isSelected && 'text-white shadow-md',
                                )}
                                style={
                                    isSelected
                                        ? {
                                              backgroundColor: tag.color,
                                              borderColor: tag.color,
                                          }
                                        : {
                                              borderColor: tag.color,
                                              color: tag.color,
                                          }
                                }
                            >
                                {tag.name}
                                {isSelected && (
                                    <span className="ml-0.5 font-bold">✓</span>
                                )}
                            </Button>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
