import React, { useEffect } from 'react';
import { router, useForm } from '@inertiajs/react';
import { IconPlus, IconX, IconExclamationCircle, IconArrowsLeftRight } from '@tabler/icons-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
} from '@/components/ui/dialog';
import { TerritoryKey } from '@/types';
interface AddDepartmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    defaultTerritory?: TerritoryKey;
}

export function AddDepartmentModal({
    isOpen,
    onClose,
    defaultTerritory = 'ekb',
}: AddDepartmentModalProps) {
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        name: '',
        territory: defaultTerritory,
    });

    useEffect(() => {
        if (isOpen) {
            clearErrors();
            setData({
                name: '',
                territory: defaultTerritory,
            });
        }
    }, [isOpen, defaultTerritory]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        post(route('departments.store'), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    const toggleTerritory = () => {
        setData('territory', data.territory === 'ekb' ? 'krg' : 'ekb');
    };

    const buttonBaseClass =
        'relative bg-white text-[#111] border border-[#ccc] px-4 py-2 text-[0.95rem] font-bold flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 shadow-[3px_3px_0px_#000] hover:shadow-[1px_1px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all duration-100';

    const buttonStyle = {
        fontFamily: '"Courier New", Courier, monospace',
        clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)',
        borderRadius: 0,
    } as const;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent
                // Hide shadcn's default rounded close icon so we can use our sharp checkerboard header close button
                className="p-0 border border-[#ccc] bg-[#f5f5f5] text-[#111] shadow-[8px_8px_0px_rgba(0,0,0,0.6)] sm:max-w-[480px] overflow-visible [&>button]:hidden"
                style={{ borderRadius: 0, fontFamily: '"Courier New", Courier, monospace' }}
            >
                {/* Signature white L-brackets matching DepCard */}
                <div className="absolute -top-3 -right-3 w-[30px] h-[30px] border-4 border-white border-b-0 border-l-0 z-20 pointer-events-none" />
                <div className="absolute -bottom-3 -left-3 w-[30px] h-[30px] border-4 border-white border-t-0 border-r-0 z-20 pointer-events-none" />

                {/* Checkerboard Header matching DepCard */}
                <DialogHeader
                    className="p-2.5 flex flex-row items-center justify-between space-y-0 border-b border-[#ccc]"
                    style={{
                        background: 'conic-gradient(#000 90deg, #667 90deg 180deg, #000 180deg 270deg, #667 270deg)',
                        backgroundSize: '0.5rem 0.5rem',
                    }}
                >
                    <DialogTitle className="bg-[#f5f5f5] px-3 py-1.5 text-[1.15rem] font-bold text-[#111] border border-[#ccc] tracking-normal">
                        Новый отдел
                    </DialogTitle>

                    <DialogClose asChild>
                        <button
                            type="button"
                            onClick={onClose}
                            aria-label="Закрыть"
                            className="bg-black text-white border border-white/70 p-1.5 hover:bg-white hover:text-black transition-colors cursor-pointer"
                        >
                            <IconX size={18} stroke={2.5} />
                        </button>
                    </DialogClose>
                </DialogHeader>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="p-5 space-y-5">
                    {/* Department Name */}
                    <div className="space-y-1.5">
                        <label
                            htmlFor="dep-name"
                            className="block text-[0.95rem] font-bold uppercase tracking-wider text-[#333]"
                        >
                            Название отдела
                        </label>
                        <input
                            id="dep-name"
                            type="text"
                            autoFocus
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="Например: Отдел разработки"
                            className="w-full bg-white border border-[#999] focus:border-black p-2.5 text-[1.1rem] text-black outline-none transition-colors"
                            style={{ borderRadius: 0 }}
                        />
                        {errors.name && (
                            <div className="flex items-center gap-1.5 text-red-600 text-[0.8rem] font-bold pt-0.5">
                                <IconExclamationCircle size={14} stroke={2.5} />
                                <span>{errors.name}</span>
                            </div>
                        )}
                    </div>

                    {/* Territory Switch matching DepCard's ЕКБ / КРГ toggle */}
                    <div className="space-y-1.5">
                        <span className="block text-[0.95rem] font-bold uppercase tracking-wider text-[#333]">
                            Территория
                        </span>
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={toggleTerritory}
                                className="bg-[#1c1c1c] text-white border border-black px-4 py-2 text-[1rem] font-bold flex items-center gap-2.5 hover:bg-[#333] transition-colors cursor-pointer"
                                style={{ borderRadius: 0 }}
                            >
                                <span>{data.territory === 'ekb' ? 'ЕКБ' : 'КРГ'}</span>
                                <IconArrowsLeftRight size={15} stroke={2} />
                            </button>
                            <span className="text-[0.85rem] text-[#555]">
                                {data.territory === 'ekb' ? 'Екатеринбург' : 'Курган'}
                            </span>
                        </div>
                        {errors.territory && (
                            <div className="flex items-center gap-1.5 text-red-600 text-[0.8rem] font-bold pt-0.5">
                                <IconExclamationCircle size={14} stroke={2.5} />
                                <span>{errors.territory}</span>
                            </div>
                        )}
                    </div>

                    {/* Footer Buttons matching DepCard's clipped-corner buttons */}
                    <DialogFooter className="pt-2 flex flex-row justify-end gap-3 border-t border-[#ccc]/70">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={processing}
                            className="bg-[#e5e5e5] text-[#222] border border-[#999] px-4 py-2 text-[0.95rem] font-bold hover:bg-[#d6d6d6] transition-colors cursor-pointer"
                            style={{ borderRadius: 0 }}
                        >
                            Отмена
                        </button>

                        <button
                            type="submit"
                            disabled={processing || !data.name.trim()}
                            className={buttonBaseClass}
                            style={buttonStyle}
                        >
                            <IconPlus size={16} stroke={2.5} />
                            <span>{processing ? 'Создание...' : 'Создать'}</span>
                        </button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
