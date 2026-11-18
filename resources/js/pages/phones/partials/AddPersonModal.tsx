import React, { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import {
    IconPlus,
    IconX,
    IconExclamationCircle,
    IconUserCheck,
    IconUser,
} from '@tabler/icons-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
} from '@/components/ui/dialog';
/////////////////////////////////////
import { Department } from '@/pages/phones/types';

interface AddPersonModalProps {
    department: Department | null;
    isOpen: boolean;
    onClose: () => void;
}

export function AddPersonModal({
    department,
    onClose,
    isOpen, }: AddPersonModalProps) {

    const departmentHasBoss =
        department?.phones.some((p) => Boolean(p.isBoss)) ?? false;

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        department: null,
        person: '',
        phone: '',
        extension: '',
        cabinet: '',
        ip: '',
        isBoss: false,
        isMiniBoss: false,
    });

    useEffect(() => {
        if (department) {
            clearErrors();
            setData({
                department: null,
                person: '',
                phone: '',
                extension: '',
                cabinet: '',
                ip: '',
                isBoss: false,
                isMiniBoss: false,
            });
        }
    }, [department]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        post(route('phones.store'), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    const handleBossToggle = () => {
        if (departmentHasBoss && !data.isBoss) return;
        setData((prev) => ({
            ...prev,
            isBoss: !prev.isBoss,
            isMiniBoss: !prev.isBoss ? false : prev.isMiniBoss,
        }));
    };

    const handleMiniBossToggle = () => {
        setData((prev) => ({
            ...prev,
            isMiniBoss: !prev.isMiniBoss,
            isBoss: !prev.isMiniBoss ? false : prev.isBoss,
        }));
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
                className="p-0 border border-[#ccc] bg-[#f5f5f5] text-[#111] shadow-[8px_8px_0px_rgba(0,0,0,0.6)] sm:max-w-[540px] overflow-visible [&>button]:hidden"
                style={{ borderRadius: 0, fontFamily: '"Courier New", Courier, monospace' }}
            >
                {/* Signature white L-brackets matching DepCard */}
                <div className="absolute -top-3 -right-3 w-[30px] h-[30px] border-4 border-white border-b-0 border-l-0 z-20 pointer-events-none" />
                <div className="absolute -bottom-3 -left-3 w-[30px] h-[30px] border-4 border-white border-t-0 border-r-0 z-20 pointer-events-none" />

                {/* Checkerboard Header matching DepCard */}
                <DialogHeader
                    className="p-2.5 flex flex-row items-center justify-between space-y-0 border-b border-[#ccc]"
                    style={{
                        background:
                            'conic-gradient(#000 90deg, #667 90deg 180deg, #000 180deg 270deg, #667 270deg)',
                        backgroundSize: '0.5rem 0.5rem',
                    }}
                >
                    <DialogTitle className="bg-[#f5f5f5] px-3 py-1.5 text-[1.15rem] font-bold text-[#111] border border-[#ccc] tracking-normal">
                        Новый сотрудник
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
                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    {/* Target Department Read-Only Badge */}
                    {department && (
                        <div className="bg-[#e5e5e5] border border-[#bbb] px-3 py-2 flex items-center justify-between gap-2">
                            <span className="text-[0.95rem] font-bold text-[#111] truncate">
                                {department.group.name}
                            </span>
                            <span className="bg-[#1c1c1c] text-white text-[0.75rem] font-bold px-2 py-0.5 shrink-0">
                                {department.group.territory === 'krg' ? 'КРГ' : 'ЕКБ'}
                            </span>
                        </div>
                    )}

                    {/* Person (ФИО) */}
                    <div className="space-y-1">
                        <label
                            htmlFor="person-name"
                            className="block text-[0.9rem] font-bold uppercase tracking-wider text-[#333]"
                        >
                            ФИО
                        </label>
                        <input
                            id="person-name"
                            type="text"
                            autoFocus
                            value={data.person}
                            onChange={(e) => setData('person', e.target.value)}
                            placeholder="Иванов Иван Иванович"
                            className="w-full bg-white border border-[#999] focus:border-black p-2 text-[1.05rem] text-black outline-none transition-colors"
                            style={{ borderRadius: 0 }}
                        />
                        {errors.person && (
                            <div className="flex items-center gap-1.5 text-red-600 text-[0.8rem] font-bold pt-0.5">
                                <IconExclamationCircle size={14} stroke={2.5} />
                                <span>{errors.person}</span>
                            </div>
                        )}
                    </div>

                    {/* Phone & Extension Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label
                                htmlFor="person-phone"
                                className="block text-[0.9rem] font-bold uppercase tracking-wider text-[#333]"
                            >
                                Телефон
                            </label>
                            <input
                                id="person-phone"
                                type="text"
                                value={data.phone}
                                onChange={(e) => setData('phone', e.target.value)}
                                placeholder="371-22-23"
                                className="w-full bg-white border border-[#999] focus:border-black p-2 text-[1.05rem] text-black outline-none transition-colors"
                                style={{ borderRadius: 0 }}
                            />
                            {errors.phone && (
                                <div className="flex items-center gap-1.5 text-red-600 text-[0.8rem] font-bold pt-0.5">
                                    <IconExclamationCircle size={14} stroke={2.5} />
                                    <span>{errors.phone}</span>
                                </div>
                            )}
                        </div>

                        <div className="space-y-1">
                            <label
                                htmlFor="person-ext"
                                className="block text-[0.9rem] font-bold uppercase tracking-wider text-[#333]"
                            >
                                Добавочный
                            </label>
                            <input
                                id="person-ext"
                                type="text"
                                value={data.extension}
                                onChange={(e) => setData('extension', e.target.value)}
                                placeholder="101"
                                className="w-full bg-white border border-[#999] focus:border-black p-2 text-[1.05rem] text-black outline-none transition-colors"
                                style={{ borderRadius: 0 }}
                            />
                            {errors.extension && (
                                <div className="flex items-center gap-1.5 text-red-600 text-[0.8rem] font-bold pt-0.5">
                                    <IconExclamationCircle size={14} stroke={2.5} />
                                    <span>{errors.extension}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Cabinet & IP Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label
                                htmlFor="person-cabinet"
                                className="block text-[0.9rem] font-bold uppercase tracking-wider text-[#333]"
                            >
                                Кабинет <span className='text-gray-500 text-xs'>|опц|</span>
                            </label>
                            <input
                                id="person-cabinet"
                                type="text"
                                value={data.cabinet}
                                onChange={(e) => setData('cabinet', e.target.value)}
                                placeholder="305"
                                className="w-full bg-white border border-[#999] focus:border-black p-2 text-[1.05rem] text-black outline-none transition-colors"
                                style={{ borderRadius: 0 }}
                            />
                            {errors.cabinet && (
                                <div className="flex items-center gap-1.5 text-red-600 text-[0.8rem] font-bold pt-0.5">
                                    <IconExclamationCircle size={14} stroke={2.5} />
                                    <span>{errors.cabinet}</span>
                                </div>
                            )}
                        </div>

                        <div className="space-y-1">
                            <label
                                htmlFor="person-ip"
                                className="block text-[0.9rem] font-bold uppercase tracking-wider text-[#333]"
                            >
                                IP <span className='text-gray-500 text-xs'>|опц|</span>
                            </label>
                            <input
                                id="person-ip"
                                type="text"
                                value={data.ip}
                                onChange={(e) => setData('ip', e.target.value)}
                                placeholder="10.0.0.15"
                                className="w-full bg-white border border-[#999] focus:border-black p-2 text-[1.05rem] text-black outline-none transition-colors"
                                style={{ borderRadius: 0 }}
                            />
                            {errors.ip && (
                                <div className="flex items-center gap-1.5 text-red-600 text-[0.8rem] font-bold pt-0.5">
                                    <IconExclamationCircle size={14} stroke={2.5} />
                                    <span>{errors.ip}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Role Selection (Начальник / Заместитель) */}
                    <div className="space-y-1.5 pt-1">
                        <span className="block text-[0.9rem] font-bold uppercase tracking-wider text-[#333]">
                            Должность в отделе
                        </span>
                        <div className="flex flex-wrap items-center gap-3">
                            <button
                                type="button"
                                onClick={handleBossToggle}
                                disabled={departmentHasBoss && !data.isBoss}
                                title={
                                    departmentHasBoss && !data.isBoss
                                        ? 'В отделе уже назначен начальник'
                                        : undefined
                                }
                                className={`px-3 py-1.5 text-[0.9rem] font-bold border flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${data.isBoss
                                    ? 'bg-black text-white border-black'
                                    : 'bg-white text-[#222] border-[#999] hover:border-black'
                                    }`}
                                style={{ borderRadius: 0 }}
                            >
                                <IconUserCheck size={16} stroke={2} />
                                <span>Начальник</span>
                            </button>

                            <button
                                type="button"
                                onClick={handleMiniBossToggle}
                                className={`px-3 py-1.5 text-[0.9rem] font-bold border flex items-center gap-1.5 transition-colors cursor-pointer ${data.isMiniBoss
                                    ? 'bg-[#555] text-white border-[#555]'
                                    : 'bg-white text-[#222] border-[#999] hover:border-black'
                                    }`}
                                style={{ borderRadius: 0 }}
                            >
                                <IconUser size={16} stroke={2} />
                                <span>Заместитель</span>
                            </button>
                        </div>
                        {errors.isBoss && (
                            <div className="flex items-center gap-1.5 text-red-600 text-[0.8rem] font-bold pt-0.5">
                                <IconExclamationCircle size={14} stroke={2.5} />
                                <span>{errors.isBoss}</span>
                            </div>
                        )}
                    </div>

                    {/* Footer Buttons */}
                    <DialogFooter className="pt-3 flex flex-row justify-end gap-3 border-t border-[#ccc]/70">
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
                            disabled={processing || !data.person.trim() || !data.phone.trim()}
                            className={buttonBaseClass}
                            style={buttonStyle}
                        >
                            <IconPlus size={16} stroke={2.5} />
                            <span>{processing ? 'Добавление...' : 'Добавить'}</span>
                        </button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
