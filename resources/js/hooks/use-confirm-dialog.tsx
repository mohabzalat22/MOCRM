import { useState } from 'react';
import { ConfirmDialog } from '@/components/confirm-dialog';

interface ConfirmDialog {
    title?: string;
    message?: string;
}

export function useConfirmDialog() {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [options, setOptions] = useState<ConfirmDialog>({});
    const [onConfirmCallback, setOnConfirmCallback] = useState<() => void>(
        () => {},
    );

    const confirm = (callback: () => void, opts?: ConfirmDialog) => {
        setOnConfirmCallback(() => callback);
        setOptions(opts || {});
        setIsOpen(true);
    };

    const handleConfirm = () => {
        setIsOpen(false);
        onConfirmCallback();
    };

    const handleCancel = () => {
        setIsOpen(false);
    };

    const confirmDialogWrapper = () => (
        <ConfirmDialog
            isOpen={isOpen}
            title={options.title}
            message={options.message}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
        />
    );

    return { confirm, ConfirmDialog: confirmDialogWrapper };
}
