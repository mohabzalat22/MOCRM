import { Camera, Upload, X } from 'lucide-react';
import { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useClientStore } from '@/stores/useClientStore';

export default function ClientImageUpload() {
    const { image, editMode, setImage, updateFormData } = useClientStore();

    const inputRef = useRef<HTMLInputElement>(null);
    const [isHovered, setIsHovered] = useState(false);

    // Reset input when editMode changes to false
    useEffect(() => {
        if (!editMode && inputRef.current) {
            inputRef.current.value = '';
        }
    }, [editMode]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Update store
            // updateFormData handles updating changedFields
            updateFormData('image', file);

            // Preview
            const reader = new FileReader();
            reader.onload = () => setImage(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setImage(null);
        updateFormData('image', ''); // Start sending empty string to signal removal
        if (inputRef.current) {
            inputRef.current.value = '';
        }
    };

    const handleClick = () => {
        if (editMode) {
            inputRef.current?.click();
        }
    };

    return (
        <>
            {image ? (
                <div
                    className="group relative"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    <div className="relative h-48 w-48 lg:h-56 lg:w-56">
                        <img
                            src={image}
                            alt="Client profile"
                            className={cn(
                                'h-full w-full rounded-full border-4 border-background object-cover shadow-xl ring-2 ring-border transition-all duration-300',
                                editMode &&
                                    'cursor-pointer hover:ring-primary/50',
                            )}
                            onClick={handleClick}
                        />

                        {/* Overlay for edit mode */}
                        {editMode && isHovered && (
                            <div
                                className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60 backdrop-blur-sm transition-opacity duration-300"
                                onClick={handleClick}
                            >
                                <Upload className="h-8 w-8 text-white" />
                            </div>
                        )}

                        {/* Remove button */}
                        {editMode && (
                            <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                onClick={handleRemoveImage}
                                className="absolute -top-2 -right-2 h-10 w-10 rounded-full shadow-lg transition-transform duration-200 hover:scale-110"
                                aria-label="Remove image"
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        )}
                    </div>
                </div>
            ) : (
                <div
                    className={cn(
                        'group relative flex h-48 w-48 items-center justify-center rounded-full border-4 border-dashed border-border bg-muted/50 shadow-inner transition-all duration-300 lg:h-56 lg:w-56',
                        editMode &&
                            'cursor-pointer hover:border-primary hover:bg-muted hover:shadow-lg',
                    )}
                    onClick={handleClick}
                    role="button"
                    tabIndex={editMode ? 0 : -1}
                    aria-label="Upload image"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    <div className="flex flex-col items-center gap-2">
                        <Camera
                            className={cn(
                                'h-12 w-12 text-muted-foreground transition-all duration-300',
                                editMode &&
                                    isHovered &&
                                    'scale-110 text-primary',
                            )}
                        />
                        {editMode && (
                            <span className="text-xs font-medium text-muted-foreground transition-colors group-hover:text-primary">
                                Upload
                            </span>
                        )}
                    </div>
                </div>
            )}
            <input
                type="file"
                name="image"
                accept="image/png, image/jpg, image/jpeg, image/webp"
                onChange={handleFileSelect}
                ref={inputRef}
                className="hidden"
                aria-hidden="true"
            />
        </>
    );
}
