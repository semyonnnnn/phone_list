import { useState } from 'react';
import { router } from '@inertiajs/react';
import { IconX, IconTrash, IconAlertTriangle } from '@tabler/icons-react';
import { DepartmentGroup } from '@/pages/phones/partials/DepCard/types';

export interface DeleteConfirmModalProps {
    route: string;
    target: DepartmentGroup | null;
    onClose: () => void;
}


export function DeleteConfirmModal({
    target,
    onClose
}: DeleteConfirmModalProps) {
    const [processing, setProcessing] = useState(false);

    if (!target) {
        return null;
    }

    const handleConfirmDelete = () => {
        if (processing) return;

        router.delete(route, {
            preserveScroll: true,
            onStart: () => setProcessing(true),
            onFinish: () => setProcessing(false),
            onSuccess: () => onClose(),
        });
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 font-mono"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-modal-title"
        >
            <div
                className="relative w-full max-w-lg"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Decorative corner brackets matching your existing modal */}
                <div className="pointer-events-none absolute -top-2.5 -right-2.5 z-20 h-[30px] w-[30px] border-4 border-white border-b-0 border-l-0" />
                <div className="pointer-events-none absolute -bottom-2.5 -left-2.5 z-20 h-[30px] w-[30px] border-4 border-white border-t-0 border-r-0 shadow-[-6px_6px_0px_rgba(0,0,0,0.4)]" />

                {/* Main modal box */}
                <div
                    className="relative overflow-hidden border border-[#ccc] bg-[#f5f5f5] text-[#111] shadow-[8px_8px_0px_rgba(0,0,0,0.6)]"
                    style={{ borderRadius: 0 }}
                >
                    {/* Checkerboard Header */}
                    <div
                        className="flex items-center justify-between p-2.5"
                        style={{
                            background:
                                'conic-gradient(#000 90deg, #667 90deg 180deg, #000 180deg 270deg, #667 270deg)',
                            backgroundSize: '0.5rem 0.5rem',
                        }}
                    >
                        <div
                            id="delete-modal-title"
                            className="border border-[#ccc] bg-[#f5f5f5] px-4 py-1.5 text-[1.15rem] font-bold tracking-wide text-[#111]"
                        >
                            {target.title}
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            disabled={processing}
                            aria-label="Закрыть"
                            className="inline-flex h-9 w-9 cursor-pointer items-center justify-center border border-[#667] bg-[#1a1a1a] text-white transition-colors hover:bg-[#333] disabled:opacity-50"
                        >
                            <IconX size={18} stroke={2} />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-6">
                        <div className="flex items-start gap-3 border border-red-300 bg-red-50/90 p-4 text-[#111]">
                            <IconAlertTriangle
                                size={24}
                                stroke={2}
                                className="mt-0.5 shrink-0 text-red-600"
                                aria-hidden="true"
                            />
                            <div className="space-y-1.5">
                                <p className="text-[1rem] font-bold leading-snug text-[#111]">
                                    {target.message}
                                </p>
                                {target.subMessage && (
                                    <p className="text-[0.85rem] text-[#555]">
                                        {target.subMessage}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="mt-6 flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={processing}
                                className="cursor-pointer border border-[#999] bg-white px-5 py-2 text-[0.95rem] font-bold text-[#111] transition-colors hover:bg-[#e5e5e5] disabled:opacity-50"
                            >
                                Отмена
                            </button>

                            <button
                                type="button"
                                onClick={handleConfirmDelete}
                                disabled={processing}
                                className="inline-flex cursor-pointer items-center gap-2 border border-red-800 bg-red-600 px-5 py-2 text-[0.95rem] font-bold text-white transition-colors hover:bg-red-700 active:bg-red-800 disabled:opacity-50"
                            >
                                <IconTrash size={16} stroke={2} aria-hidden="true" />
                                {processing ? 'Удаление...' : 'Удалить'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
