import { Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface DateGroupHeaderProps {
    label: string;
    count: number;
}

export default function DateGroupHeader({ label, count }: DateGroupHeaderProps) {
    return (
        <div className="sticky top-0 z-20 mb-4 flex items-center gap-3 border-b bg-background/95 pb-2 pt-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground">
                    {label}
                </h3>
            </div>
            <Badge variant="secondary" className="h-5 rounded-full px-2 text-xs">
                {count}
            </Badge>
        </div>
    );
}
