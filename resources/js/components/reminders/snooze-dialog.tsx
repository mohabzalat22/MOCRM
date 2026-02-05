import {  Clock } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

interface SnoozeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSnooze: (date: Date) => void;
}

export function SnoozeDialog({ open, onOpenChange, onSnooze }: SnoozeDialogProps) {
    // Initial state as ISO string for datetime-local input
    const [datetime, setDatetime] = useState<string>('');

    const handleSnooze = () => {
        if (!datetime) return;
        onSnooze(new Date(datetime));
        onOpenChange(false);
    };

    const handleQuickSnooze = (type: 'later_today' | 'tomorrow' | 'next_week') => {
        const now = new Date();
        const newDate = new Date();
        
        switch (type) {
            case 'later_today':
                newDate.setHours(now.getHours() + 4);
                break;
            case 'tomorrow':
                newDate.setDate(now.getDate() + 1);
                newDate.setHours(9, 0, 0, 0);
                break;
            case 'next_week':
                newDate.setDate(now.getDate() + 7);
                newDate.setHours(9, 0, 0, 0);
                break;
        }
        
        onSnooze(newDate);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Snooze Reminder</DialogTitle>
                    <DialogDescription>
                        Choose when you want to be reminded again.
                    </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                    <div className="flex flex-col gap-2">
                        <Button variant="outline" onClick={() => handleQuickSnooze('later_today')}>
                            Later Today (+4 hours)
                        </Button>
                        <Button variant="outline" onClick={() => handleQuickSnooze('tomorrow')}>
                            Tomorrow (9:00 AM)
                        </Button>
                        <Button variant="outline" onClick={() => handleQuickSnooze('next_week')}>
                            Next Week (9:00 AM)
                        </Button>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">
                                Or pick a date & time
                            </span>
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Custom Date & Time
                        </label>
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <Input 
                                type="datetime-local" 
                                value={datetime}
                                onChange={(e) => setDatetime(e.target.value)}
                                className="w-full"
                            />
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSnooze} disabled={!datetime}>Snooze</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
