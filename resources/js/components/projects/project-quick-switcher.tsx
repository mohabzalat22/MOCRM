import { router } from '@inertiajs/react';
import { ChevronsUpDown, Check } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface ProjectQuickSwitcherProps {
    currentProjectId: number;
    siblingProjects: { id: number; name: string; status: string }[];
}

export function ProjectQuickSwitcher({
    currentProjectId,
    siblingProjects,
}: ProjectQuickSwitcherProps) {
    const [open, setOpen] = useState(false);

    if (siblingProjects.length === 0) {
        return null; // Don't show if no other projects
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-[200px] justify-between text-muted-foreground hover:text-foreground"
                >
                    Switch Project...
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
                <Command>
                    <CommandInput placeholder="Search projects..." />
                    <CommandList>
                        <CommandEmpty>No project found.</CommandEmpty>
                        <CommandGroup heading="Active Projects">
                            {siblingProjects.map((project) => (
                                <CommandItem
                                    key={project.id}
                                    value={project.name}
                                    onSelect={() => {
                                        setOpen(false);
                                        router.visit(`/projects/${project.id}`);
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            'mr-2 h-4 w-4',
                                            currentProjectId === project.id
                                                ? 'opacity-100'
                                                : 'opacity-0',
                                        )}
                                    />
                                    {project.name}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
