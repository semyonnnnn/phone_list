import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { IconExclamationCircle, IconPlus, IconUser, IconUserCheck, IconX } from '@tabler/icons-react';
/////////////////////////////////////
import { AddPersonModalProps } from '@/pages/phones/partials/AddPersonModal/types';
import { useAddPersonModal } from '@/pages/phones/partials/AddPersonModal/useAddPersonModal';

export function AddPersonModal({ department, onClose, isOpen }: AddPersonModalProps) {
    const { handleSubmit, data, errors, handleMiniBossToggle, setData, handleBossToggle, processing, departmentHasBoss, buttonStyle, buttonBaseClass } = useAddPersonModal({
        department,
        onClose,
    });

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent
                className="overflow-visible border border-[#ccc] bg-[#f5f5f5] p-0 text-[#111] shadow-[8px_8px_0px_rgba(0,0,0,0.6)] sm:max-w-[540px] [&>button]:hidden"
                style={{ borderRadius: 0, fontFamily: '"Courier New", Courier, monospace' }}
            >
                {/* Signature white L-brackets matching DepCard */}
                <div className="pointer-events-none absolute -top-3 -right-3 z-20 h-[30px] w-[30px] border-4 border-b-0 border-l-0 border-white" />
                <div className="pointer-events-none absolute -bottom-3 -left-3 z-20 h-[30px] w-[30px] border-4 border-t-0 border-r-0 border-white" />

                {/* Checkerboard Header matching DepCard */}
                <DialogHeader
                    className="flex flex-row items-center justify-between space-y-0 border-b border-[#ccc] p-2.5"
                    style={{
                        background: 'conic-gradient(#000 90deg, #667 90deg 180deg, #000 180deg 270deg, #667 270deg)',
                        backgroundSize: '0.5rem 0.5rem',
                    }}
                >
                    <DialogTitle className="border border-[#ccc] bg-[#f5f5f5] px-3 py-1.5 text-[1.15rem] font-bold tracking-normal text-[#111]">
                        Новый сотрудник
                    </DialogTitle>

                    <DialogClose asChild>
                        <button
                            type="button"
                            onClick={onClose}
                            aria-label="Закрыть"
                            className="cursor-pointer border border-white/70 bg-black p-1.5 text-white transition-colors hover:bg-white hover:text-black"
                        >
                            <IconX size={18} stroke={2.5} />
                        </button>
                    </DialogClose>
                </DialogHeader>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="space-y-4 p-5">
                    {/* Target Department Read-Only Badge */}
                    {department && (
                        <div className="flex items-center justify-between gap-2 border border-[#bbb] bg-[#e5e5e5] px-3 py-2">
                            <span className="truncate text-[0.95rem] font-bold text-[#111]">{department.group.name}</span>
                            <span className="shrink-0 bg-[#1c1c1c] px-2 py-0.5 text-[0.75rem] font-bold text-white">
                                {department.group.territory === 'krg' ? 'КРГ' : 'ЕКБ'}
                            </span>
                        </div>
                    )}

                    {/* Person (ФИО) */}
                    <div className="space-y-1">
                        <label htmlFor="person-name" className="block text-[0.9rem] font-bold tracking-wider text-[#333] uppercase">
                            ФИО
                        </label>
                        <input
                            id="person-name"
                            type="text"
                            autoFocus
                            value={data.person}
                            onChange={(e) => setData('person', e.target.value)}
                            placeholder="Иванов Иван Иванович"
                            className="w-full border border-[#999] bg-white p-2 text-[1.05rem] text-black transition-colors outline-none focus:border-black"
                            style={{ borderRadius: 0 }}
                        />
                        {errors.person && (
                            <div className="flex items-center gap-1.5 pt-0.5 text-[0.8rem] font-bold text-red-600">
                                <IconExclamationCircle size={14} stroke={2.5} />
                                <span>{errors.person}</span>
                            </div>
                        )}
                    </div>

                    {/* Phone & Extension Row */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-1">
                            <label htmlFor="person-phone" className="block text-[0.9rem] font-bold tracking-wider text-[#333] uppercase">
                                Телефон
                            </label>
                            <input
                                id="person-phone"
                                type="text"
                                value={data.phone}
                                onChange={(e) => setData('phone', e.target.value)}
                                placeholder="371-22-23"
                                className="w-full border border-[#999] bg-white p-2 text-[1.05rem] text-black transition-colors outline-none focus:border-black"
                                style={{ borderRadius: 0 }}
                            />
                            {errors.phone && (
                                <div className="flex items-center gap-1.5 pt-0.5 text-[0.8rem] font-bold text-red-600">
                                    <IconExclamationCircle size={14} stroke={2.5} />
                                    <span>{errors.phone}</span>
                                </div>
                            )}
                        </div>

                        <div className="space-y-1">
                            <label htmlFor="person-ext" className="block text-[0.9rem] font-bold tracking-wider text-[#333] uppercase">
                                Добавочный
                            </label>
                            <input
                                id="person-ext"
                                type="text"
                                value={data.extension}
                                onChange={(e) => setData('extension', e.target.value)}
                                placeholder="101"
                                className="w-full border border-[#999] bg-white p-2 text-[1.05rem] text-black transition-colors outline-none focus:border-black"
                                style={{ borderRadius: 0 }}
                            />
                            {errors.extension && (
                                <div className="flex items-center gap-1.5 pt-0.5 text-[0.8rem] font-bold text-red-600">
                                    <IconExclamationCircle size={14} stroke={2.5} />
                                    <span>{errors.extension}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Cabinet & IP Row */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-1">
                            <label htmlFor="person-cabinet" className="block text-[0.9rem] font-bold tracking-wider text-[#333] uppercase">
                                Кабинет <span className="text-xs text-gray-500">|опц|</span>
                            </label>
                            <input
                                id="person-cabinet"
                                type="text"
                                value={data.cabinet}
                                onChange={(e) => setData('cabinet', e.target.value)}
                                placeholder="305"
                                className="w-full border border-[#999] bg-white p-2 text-[1.05rem] text-black transition-colors outline-none focus:border-black"
                                style={{ borderRadius: 0 }}
                            />
                            {errors.cabinet && (
                                <div className="flex items-center gap-1.5 pt-0.5 text-[0.8rem] font-bold text-red-600">
                                    <IconExclamationCircle size={14} stroke={2.5} />
                                    <span>{errors.cabinet}</span>
                                </div>
                            )}
                        </div>

                        <div className="space-y-1">
                            <label htmlFor="person-ip" className="block text-[0.9rem] font-bold tracking-wider text-[#333] uppercase">
                                IP <span className="text-xs text-gray-500">|опц|</span>
                            </label>
                            <input
                                id="person-ip"
                                type="text"
                                value={data.ip}
                                onChange={(e) => setData('ip', e.target.value)}
                                placeholder="10.0.0.15"
                                className="w-full border border-[#999] bg-white p-2 text-[1.05rem] text-black transition-colors outline-none focus:border-black"
                                style={{ borderRadius: 0 }}
                            />
                            {errors.ip && (
                                <div className="flex items-center gap-1.5 pt-0.5 text-[0.8rem] font-bold text-red-600">
                                    <IconExclamationCircle size={14} stroke={2.5} />
                                    <span>{errors.ip}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Role Selection (Начальник / Заместитель) */}
                    <div className="space-y-1.5 pt-1">
                        <span className="block text-[0.9rem] font-bold tracking-wider text-[#333] uppercase">Должность в отделе</span>
                        <div className="flex flex-wrap items-center gap-3">
                            <button
                                type="button"
                                onClick={handleBossToggle}
                                disabled={departmentHasBoss && !data.isBoss}
                                title={departmentHasBoss && !data.isBoss ? 'В отделе уже назначен начальник' : undefined}
                                className={`flex cursor-pointer items-center gap-1.5 border px-3 py-1.5 text-[0.9rem] font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${data.isBoss ? 'border-black bg-black text-white' : 'border-[#999] bg-white text-[#222] hover:border-black'
                                    }`}
                                style={{ borderRadius: 0 }}
                            >
                                <IconUserCheck size={16} stroke={2} />
                                <span>Начальник</span>
                            </button>

                            <button
                                type="button"
                                onClick={handleMiniBossToggle}
                                className={`flex cursor-pointer items-center gap-1.5 border px-3 py-1.5 text-[0.9rem] font-bold transition-colors ${data.isMiniBoss ? 'border-[#555] bg-[#555] text-white' : 'border-[#999] bg-white text-[#222] hover:border-black'
                                    }`}
                                style={{ borderRadius: 0 }}
                            >
                                <IconUser size={16} stroke={2} />
                                <span>Заместитель</span>
                            </button>
                        </div>
                        {errors.isBoss && (
                            <div className="flex items-center gap-1.5 pt-0.5 text-[0.8rem] font-bold text-red-600">
                                <IconExclamationCircle size={14} stroke={2.5} />
                                <span>{errors.isBoss}</span>
                            </div>
                        )}
                    </div>

                    {/* Footer Buttons */}
                    <DialogFooter className="flex flex-row justify-end gap-3 border-t border-[#ccc]/70 pt-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={processing}
                            className="cursor-pointer border border-[#999] bg-[#e5e5e5] px-4 py-2 text-[0.95rem] font-bold text-[#222] transition-colors hover:bg-[#d6d6d6]"
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
