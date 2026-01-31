import { Camera, Trash } from 'lucide-react';
import { useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useClientStore } from '@/stores/useClientStore';

export default function ClientImageUpload() {
    const { 
        image, 
        editMode, 
        setImage, 
        updateFormData 
    } = useClientStore();
    
    const inputRef = useRef<HTMLInputElement>(null);

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

    const handleRemoveImage = () => {
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
                            onClick={handleRemoveImage}
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
