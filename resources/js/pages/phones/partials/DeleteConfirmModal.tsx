import { useState } from 'react';
import { router } from '@inertiajs/react';
import {
    IconX,
    IconTrash,
    IconAlertTriangle,
    IconFlame,
    IconPhone,
    IconUser,
} from '@tabler/icons-react';
////////////////////////////////////////////////////
import { TERRITORIES, TerritoryKey } from '@/types';
import { PhoneRecordDetails, DeleteConfirmModalProps } from '@/pages/phones/types';


export function PhoneRecordDeleteDetails({
    person, phone, extension,
}: PhoneRecordDetails) {
    return (
        <div className="mt-4 border-2 border-black bg-white p-3.5 text-[0.9rem] text-[#111]">
            <div className="mb-2 border-b border-[#ddd] pb-1 text-[0.75rem] font-bold tracking-wider text-[#667] uppercase">
                Удаляемая запись
            </div>

            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <IconUser
                        size={16}
                        stroke={2}
                        className="shrink-0 text-[#555]"
                        aria-hidden="true"
                    />
                    <span className="font-bold">{person}</span>
                </div>

                <div className="flex items-center gap-2">
                    <IconPhone
                        size={16}
                        stroke={2}
                        className="shrink-0 text-[#555]"
                        aria-hidden="true"
                    />
                    <span>{phone}</span>
                    {extension && (
                        <span className="border border-[#ccc] bg-[#f5f5f5] px-1.5 py-0.5 text-[0.8rem] font-bold text-[#333]">
                            доб. {extension}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

export function DeleteConfirmModal({
    target,
    onClose,
}: DeleteConfirmModalProps) {
    const [processing, setProcessing] = useState(false);

    if (!target) {
        return null;
    }

    const isDepartmentDeletion = target.phoneDetails === undefined;

    const handleConfirmDelete = () => {
        if (processing) return;

        router.delete(target.route, {
            preserveScroll: true,
            onStart: () => setProcessing(true),
            onFinish: () => setProcessing(false),
            onSuccess: () => onClose(),
        });
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 font-mono"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-modal-title"
        >
            <div
                className="relative w-full max-w-lg"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Decorative corner brackets */}
                <div className="pointer-events-none absolute -top-2.5 -right-2.5 z-20 h-[30px] w-[30px] border-4 border-b-0 border-l-0 border-white" />
                <div className="pointer-events-none absolute -bottom-2.5 -left-2.5 z-20 h-[30px] w-[30px] border-4 border-t-0 border-r-0 border-red-500 shadow-[-6px_6px_0px_rgba(0,0,0,0.4)]" />

                {/* Main modal box */}
                <div
                    className="relative overflow-hidden border border-white bg-[#f5f5f5] text-[#111] shadow-[8px_8px_0px_rgba(0,0,0,0.6)]"
                    style={{ borderRadius: 0 }}
                >
                    {/* Checkerboard Header */}
                    <div
                        className="flex items-center justify-between gap-2 p-2.5"
                        style={{
                            background:
                                'conic-gradient(#000 90deg, #667 90deg 180deg, #000 180deg 270deg, #667 270deg)',
                            backgroundSize: '0.5rem 0.5rem',
                        }}
                    >
                        <div className="flex items-stretch">
                            <div
                                id="delete-modal-title"
                                className="border border-[#ccc] bg-[#f5f5f5] px-3.5 py-1.5 text-[#111]"
                            >
                                <div className="text-[1.05rem] font-bold tracking-wide">
                                    {target.departmentName}
                                </div>
                            </div>

                            {/* Territory badge matching DepCard's TerritorySwitch without arrows */}
                            <div className="inline-flex self-stretch items-center justify-center border border-l-0 border-[#667] bg-[#222]/50 backdrop-blur-[1.8px] px-3 text-base font-bold text-[#ddd] select-none">
                                {TERRITORIES[target.territory as TerritoryKey]}
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            disabled={processing}
                            aria-label="Закрыть"
                            className="inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center border border-[#667] bg-[#1a1a1a] text-white transition-colors hover:bg-[#333] disabled:opacity-50"
                        >
                            <IconX size={18} stroke={2} />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-6">
                        <div className="border-2 border-black bg-white p-4 shadow-[4px_4px_0px_rgba(50,50,50,0.5)]">
                            <div className="flex items-center gap-2 border-b border-black pb-2 text-[0.8rem] font-black tracking-widest uppercase">
                                <IconFlame
                                    size={20}
                                    stroke={2.5}
                                    className="shrink-0 text-red-600"
                                    aria-hidden="true"
                                />
                                <span className="text-red-600">
                                    Критическое действие:
                                </span>
                                <span>{isDepartmentDeletion ? 'удаление отдела' : 'удаление записи'}</span>
                            </div>
                            <div className="mt-3 space-y-1.5">
                                <p className="text-[1.05rem] leading-snug font-bold text-[#111]">
                                    {target.message}
                                </p>
                            </div>
                        </div>


                        {!isDepartmentDeletion && target.phoneDetails !== undefined && (
                            <PhoneRecordDeleteDetails
                                person={target.phoneDetails.person}
                                phone={target.phoneDetails.phone}
                                extension={target.phoneDetails.extension}
                            />
                        )}

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
                                className="inline-flex cursor-pointer items-center gap-2 border border-red-900 bg-red-600 px-5 py-2 text-[0.95rem] font-bold text-white transition-colors hover:bg-red-700 active:bg-red-800 disabled:opacity-50"
                            >
                                <IconTrash
                                    size={16}
                                    stroke={2}
                                    aria-hidden="true"
                                />
                                {processing
                                    ? 'Удаление...'
                                    : isDepartmentDeletion
                                        ? 'Удалить отдел'
                                        : 'Удалить запись'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
