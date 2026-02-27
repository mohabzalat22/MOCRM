import { router } from '@inertiajs/react';
import axios from 'axios';
import { Briefcase, Calendar, Search, Tag, User } from 'lucide-react';
import React, { useEffect, useState } from 'react';

import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';

interface SearchResult {
    clients: { id: number; name: string; company_name?: string }[];
    projects: { id: number; name: string }[];
    activities: { id: number; summary: string }[];
    tags: { id: number; name: string; color: string }[];
}

export function GlobalSearch() {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult>({
        clients: [],
        projects: [],
        activities: [],
        tags: [],
    });
    const [history, setHistory] = useState<string[]>(() => {
        const savedHistory =
            typeof window !== 'undefined'
                ? localStorage.getItem('search_history')
                : null;
        return savedHistory ? JSON.parse(savedHistory) : [];
    });

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener('keydown', down);

        return () => document.removeEventListener('keydown', down);
    }, []);

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (!query) {
                setResults({
                    clients: [],
                    projects: [],
                    activities: [],
                    tags: [],
                });
                return;
            }

            try {
                const response = await axios.get(
                    `/search?q=${encodeURIComponent(query)}`,
                );
                setResults(response.data);
            } catch (error) {
                console.error('Search failed:', error);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    const handleSelect = (type: string, id: number, name: string) => {
        setOpen(false);

        // Save to history
        const newHistory = [name, ...history.filter((h) => h !== name)].slice(
            0,
            5,
        );
        setHistory(newHistory);
        localStorage.setItem('search_history', JSON.stringify(newHistory));

        // Navigate
        switch (type) {
            case 'client':
                router.visit(`/clients/${id}`);
                break;
            case 'project':
                router.visit(`/projects/${id}`);
                break;
            case 'activity':
                // Activities usually don't have their own page, maybe scroll to it or go to client?
                // For now let's assume we go to the activity's client if possible,
                // but our search controller only returned id and summary.
                break;
            case 'tag':
                // Maybe filter by tag?
                break;
        }
    };

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="relative flex h-9 w-full items-center justify-start rounded-md border bg-muted/50 px-3 py-2 text-sm font-normal text-muted-foreground transition-colors hover:bg-muted focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none md:w-40 lg:w-64"
            >
                <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                <span className="inline-flex">Search MOCRM...</span>
                <kbd className="pointer-events-none absolute top-1/2 right-[0.3rem] hidden h-5 -translate-y-1/2 items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium opacity-100 select-none sm:flex">
                    <span className="text-xs">⌘</span>K
                </kbd>
            </button>
            <CommandDialog
                open={open}
                onOpenChange={setOpen}
                commandProps={{ shouldFilter: false }}
            >
                <CommandInput
                    placeholder="Type to search clients, projects, tags..."
                    value={query}
                    onValueChange={setQuery}
                />
                <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>

                    {query === '' && history.length > 0 && (
                        <CommandGroup heading="Recent Searches">
                            {history.map((item) => (
                                <CommandItem
                                    key={item}
                                    onSelect={() => setQuery(item)}
                                >
                                    <Search className="mr-2 h-4 w-4" />
                                    <span>{item}</span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    )}

                    {results.clients.length > 0 && (
                        <CommandGroup heading="Clients">
                            {results.clients.map((client) => (
                                <CommandItem
                                    key={client.id}
                                    onSelect={() =>
                                        handleSelect(
                                            'client',
                                            client.id,
                                            client.name,
                                        )
                                    }
                                >
                                    <User className="mr-2 h-4 w-4" />
                                    <span>{client.name}</span>
                                    {client.company_name && (
                                        <span className="ml-2 text-xs text-muted-foreground">
                                            ({client.company_name})
                                        </span>
                                    )}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    )}

                    {results.projects.length > 0 && (
                        <CommandGroup heading="Projects">
                            {results.projects.map((project) => (
                                <CommandItem
                                    key={project.id}
                                    onSelect={() =>
                                        handleSelect(
                                            'project',
                                            project.id,
                                            project.name,
                                        )
                                    }
                                >
                                    <Briefcase className="mr-2 h-4 w-4" />
                                    <span>{project.name}</span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    )}

                    {results.tags.length > 0 && (
                        <CommandGroup heading="Tags">
                            {results.tags.map((tag) => (
                                <CommandItem
                                    key={tag.id}
                                    onSelect={() =>
                                        handleSelect('tag', tag.id, tag.name)
                                    }
                                >
                                    <Tag
                                        className="mr-2 h-4 w-4"
                                        style={{ color: tag.color }}
                                    />
                                    <span>{tag.name}</span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    )}

                    {results.activities.length > 0 && (
                        <CommandGroup heading="Activities">
                            {results.activities.map((activity) => (
                                <CommandItem
                                    key={activity.id}
                                    onSelect={() =>
                                        handleSelect(
                                            'activity',
                                            activity.id,
                                            activity.summary,
                                        )
                                    }
                                >
                                    <Calendar className="mr-2 h-4 w-4" />
                                    <span>{activity.summary}</span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    )}
                </CommandList>
            </CommandDialog>
        </>
    );
}
