import { Button } from '@/components/ui/button';

interface SaveButtonFooterProps {
    isSaving: boolean;
    onCancel: () => void;
}

export default function SaveButtonFooter({
    isSaving,
    onCancel,
}: SaveButtonFooterProps) {
    return (
        <div className="fixed right-0 bottom-6 left-0 z-50 flex justify-center px-4">
            <div className="flex w-full max-w-2xl items-center justify-between gap-4 rounded-lg border bg-background p-4 shadow-lg">
                <Button
                    variant="outline"
                    type="button"
                    onClick={onCancel}
                    disabled={isSaving}
                >
                    Cancel
                </Button>
                <div className="flex items-center gap-3">
                    {isSaving && (
                        <span className="text-sm text-muted-foreground">
                            Saving...
                        </span>
                    )}
                    <Button type="submit" disabled={isSaving}>
                        Save Changes
                    </Button>
                </div>
            </div>
        </div>
    );
}
