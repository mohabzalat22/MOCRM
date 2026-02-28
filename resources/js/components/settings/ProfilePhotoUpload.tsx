import { Camera, Upload, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ProfilePhotoUploadProps {
    currentImage?: string | null;
    onChange: (file: File | null) => void;
    label?: string;
    className?: string;
}

export default function ProfilePhotoUpload({
    currentImage,
    onChange,
    label = 'Upload photo',
    className,
}: ProfilePhotoUploadProps) {
    const [preview, setPreview] = useState<string | null>(currentImage || null);
    const [isHovered, setIsHovered] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onChange(file);
            const reader = new FileReader();
            reader.onload = () => setPreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setPreview(null);
        onChange(null);
        if (inputRef.current) {
            inputRef.current.value = '';
        }
    };

    const handleClick = () => {
        inputRef.current?.click();
    };

    return (
        <div className={cn('space-y-4', className)}>
            <div
                className={cn(
                    'group relative flex cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-border bg-muted/50 transition-all duration-300 hover:border-primary hover:bg-muted',
                    'h-40 w-40',
                )}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onClick={handleClick}
            >
                {preview ? (
                    <>
                        <img
                            src={
                                preview.startsWith('data:')
                                    ? preview
                                    : `/storage/${preview}`
                            }
                            alt="Preview"
                            className="h-full w-full object-cover transition-all duration-300 group-hover:scale-105"
                        />
                        <div
                            className={cn(
                                'absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity duration-300',
                                isHovered ? 'opacity-100' : 'opacity-0',
                            )}
                        >
                            <Upload className="h-8 w-8 text-white" />
                        </div>
                        <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={handleRemoveImage}
                            className="absolute top-2 right-2 h-8 w-8 rounded-full opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </>
                ) : (
                    <div className="flex flex-col items-center gap-2">
                        <Camera
                            className={cn(
                                'h-10 w-10 text-muted-foreground transition-all duration-300',
                                isHovered && 'scale-110 text-primary',
                            )}
                        />
                        <span className="text-xs font-medium text-muted-foreground group-hover:text-primary">
                            {label}
                        </span>
                    </div>
                )}
            </div>
            <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileSelect}
                ref={inputRef}
            />
        </div>
    );
}
