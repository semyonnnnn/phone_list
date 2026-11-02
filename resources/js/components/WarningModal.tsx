// resources/js/components/WarningModal.tsx
import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';

export type WarningVariant = 'danger' | 'warning' | 'info';

interface WarningModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    variant?: WarningVariant;
    isLoading?: boolean;
}

export default function WarningModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = 'Подтвердить',
    cancelText = 'Отмена',
    variant = 'warning',
    isLoading = false,
}: WarningModalProps) {
    // Style variants matching your industrial brutalist palette
    const confirmButtonStyles: Record<WarningVariant, string> = {
        danger: 'bg-red-600 text-white hover:bg-red-700 border-black',
        warning: 'bg-amber-500 text-black hover:bg-amber-600 border-black',
        info: 'bg-black text-white hover:bg-neutral-800 border-black',
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="border-2 border-black bg-[#f5f5f5] text-[#111] rounded-none shadow-[6px_6px_0px_rgba(0,0,0,0.4)]">
                <DialogHeader>
                    <DialogTitle className="font-mono text-[1.25rem] font-bold uppercase tracking-wider">
                        {title}
                    </DialogTitle>
                    <DialogDescription className="text-[#444] font-mono text-[0.95rem]">
                        {description}
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="mt-4 flex gap-2 justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isLoading}
                        className="px-4 py-2 font-mono font-bold text-sm bg-white border border-black shadow-[2px_2px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer disabled:opacity-50"
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`px-4 py-2 font-mono font-bold text-sm border shadow-[2px_2px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer disabled:opacity-50 ${confirmButtonStyles[variant]}`}
                    >
                        {isLoading ? 'Загрузка...' : confirmText}
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}