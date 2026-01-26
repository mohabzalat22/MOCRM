import { Camera, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ClientImageUploadProps {
    image: string | null;
    editMode: boolean;
    inputRef: React.RefObject<HTMLInputElement | null>;
    onImageChange: (file: File) => void;
    onRemoveImage: () => void;
}

export default function ClientImageUpload({
    image,
    editMode,
    inputRef,
    onImageChange,
    onRemoveImage,
}: ClientImageUploadProps) {
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onImageChange(file);
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
                <div className="flex flex-col items-center gap-2">
                    <img
                        src={image}
                        alt="Client profile"
                        className="h-40 w-40 cursor-pointer rounded-full border object-cover lg:h-60 lg:w-60 dark:border-zinc-700"
                        onClick={handleClick}
                    />
                    {editMode && (
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={onRemoveImage}
                            size="icon"
                            aria-label="Remove image"
                        >
                            <Trash />
                        </Button>
                    )}
                </div>
            ) : (
                <div
                    className="flex h-40 w-40 cursor-pointer items-center justify-center rounded-full bg-gray-800 dark:bg-zinc-800"
                    onClick={handleClick}
                    role="button"
                    tabIndex={0}
                    aria-label="Upload image"
                >
                    <Camera className="h-10 w-10 text-white" />
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
