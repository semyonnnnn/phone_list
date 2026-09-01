import React from 'react';
import { IconUserStar, IconUser, IconPencil, IconCheck } from '@tabler/icons-react';

interface PhoneRecord {
    id?: number;
    person: string;
    phone: string;
    extension: string;
    cabinet: string | null;
    ip: string | null;
    file_id: string;
    isBoss?: boolean | string | number;
    isMiniBoss?: boolean | string | number;
    is_boss?: boolean | string | number;
    is_isMiniBoss?: boolean | string | number;
    is_miniboss?: boolean | string | number;
    [key: string]: any;
}

interface Department {
    group: string;
    phones: PhoneRecord[];
}

interface DepCardProps {
    dep: Department;
    depIndex: number;
    isAuthenticated: boolean;
    onFieldChange: (depIndex: number, rowIndex: number, field: keyof PhoneRecord, value: string | boolean) => void;
    onEditBoss?: (depIndex: number) => void;
    onEditIsMiniBoss?: (depIndex: number) => void;
    bossChanged: boolean;
    isMiniBossChanged: boolean;
}

const isTruthy = (v: any) => v === true || v === 'true' || v === 1 || v === '1';

export default function DepCard({
    dep,
    depIndex,
    isAuthenticated,
    onFieldChange,
    onEditBoss,
    onEditIsMiniBoss,
    bossChanged,
    isMiniBossChanged,
}: DepCardProps) {
    const phones = dep.phones || [];
    const [activeColumn, setActiveColumn] = React.useState<'isBoss' | 'isMiniBoss' | null>(null);

    const isBossChecked = (rowIndex: number) => {
        const row = phones[rowIndex];
        if (!row) return false;
        return isTruthy(row.isBoss ?? row.is_boss);
    };

    const isMiniBossChecked = (rowIndex: number) => {
        const row = phones[rowIndex];
        if (!row) return false;
        return isTruthy(row.isMiniBoss ?? row.is_isMiniBoss ?? row.is_miniboss);
    };

    // Only block *turning a flag on* when it would create a conflict — never
    // block turning an already-set flag off. Otherwise a row stuck in an
    // illegal both-true state (e.g. legacy data from before this guard
    // existed) would have both checkboxes permanently locked with no way to
    // fix it from the UI.
    const isBossPickDisabled = (rowIndex: number) =>
        !isBossChecked(rowIndex) && isMiniBossChecked(rowIndex);
    const isMiniBossPickDisabled = (rowIndex: number) =>
        !isMiniBossChecked(rowIndex) && isBossChecked(rowIndex);

    const sortedPhonesWithIndices = React.useMemo(() => {
        return phones
            .map((row, originalIndex) => ({ row, originalIndex }))
            .sort((a, b) => {
                const aBoss = isTruthy(a.row.isBoss ?? a.row.is_boss);
                const bBoss = isTruthy(b.row.isBoss ?? b.row.is_boss);
                if (aBoss && !bBoss) return -1;
                if (!aBoss && bBoss) return 1;

                const aMini = isTruthy(a.row.isMiniBoss ?? a.row.is_isMiniBoss ?? a.row.is_miniboss);
                const bMini = isTruthy(b.row.isMiniBoss ?? b.row.is_isMiniBoss ?? b.row.is_miniboss);
                if (aMini && !bMini) return -1;
                if (!aMini && bMini) return 1;

                return a.originalIndex - b.originalIndex;
            });
    }, [phones]);

    const handleBossButtonClick = () => {
        if (!isAuthenticated) return;
        setActiveColumn((prev) => (prev === 'isBoss' ? null : 'isBoss'));
        onEditBoss?.(depIndex);
    };

    const handleIsMiniBossButtonClick = () => {
        if (!isAuthenticated) return;
        setActiveColumn((prev) => (prev === 'isMiniBoss' ? null : 'isMiniBoss'));
        onEditIsMiniBoss?.(depIndex);
    };

    const handleBossRadioChange = (targetOriginalIndex: number) => {
        if (!isAuthenticated) return;
        if (isBossPickDisabled(targetOriginalIndex)) return;

        const currentlyBoss = isBossChecked(targetOriginalIndex);

        phones.forEach((_, i) => {
            if (isBossChecked(i)) {
                onFieldChange(depIndex, i, 'isBoss', false);
            }
        });

        if (!currentlyBoss) {
            onFieldChange(depIndex, targetOriginalIndex, 'isBoss', true);
        }
    };

    const handleMiniBossCheckboxToggle = (targetOriginalIndex: number) => {
        if (!isAuthenticated) return;
        if (isMiniBossPickDisabled(targetOriginalIndex)) return;

        const currentlyMiniBoss = isMiniBossChecked(targetOriginalIndex);
        onFieldChange(depIndex, targetOriginalIndex, 'isMiniBoss', !currentlyMiniBoss);
    };

    const maxNameLen = Math.max(5, ...phones.map((r) => (r.person || '').length)) + 6;

    const buttonBaseClass =
        "relative bg-white text-[#111] border border-[#ccc] px-3 py-2 text-[0.95rem] font-bold flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 shadow-[3px_3px_0px_#000] hover:shadow-[1px_1px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all duration-100";

    const buttonStyle = {
        fontFamily: '"Courier New", Courier, monospace',
        clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)',
        borderRadius: 0,
    } as const;

    // Thin white frame for the data columns (phone / extension / cabinet / ip)
    // on both boss and mini-boss rows. FIO's own left edge is deliberately left
    // out of this helper — it keeps using leftAccentClass below (black for boss,
    // dark gray for mini-boss), just with a thin white bottom edge added.
    const rowCellBorder = (active: boolean) => (active ? 'border-b border-l border-r border-white' : '');

    return (
        <div className="relative mb-12">
            <div className="absolute -top-3 -right-3 w-[35px] h-[35px] border-4 border-white border-b-0 border-l-0 z-20 pointer-events-none" />
            <div className="absolute -bottom-3 -left-3 w-[35px] h-[35px] border-4 border-white border-t-0 border-r-0 z-20 pointer-events-none shadow-[-6px_6px_0px_rgba(0,0,0,0.4)]" />

            <div className="bg-[#f5f5f5] border border-[#ccc] shadow-[6px_6px_0px_rgba(0,0,0,0.4)] relative overflow-hidden text-[#111]" style={{ borderRadius: 0 }}>
                <div
                    className="p-2 text-left relative z-20 flex items-center justify-between"
                    style={{
                        background: 'conic-gradient(#000 90deg, #666 90deg 180deg, #000 180deg 270deg, #666 270deg)',
                        backgroundSize: '0.5rem 0.5rem',
                    }}
                >
                    <div className="bg-[#f5f5f5] inline-block px-4 py-2 text-[1.35rem] font-bold border border-[#ccc]">
                        {dep.group}
                    </div>

                    {isAuthenticated && (
                        <div className="flex items-center gap-3">
                            <div className="relative inline-block">
                                <button
                                    type="button"
                                    onClick={handleBossButtonClick}
                                    disabled={!isAuthenticated}
                                    className={buttonBaseClass}
                                    style={buttonStyle}
                                >
                                    <IconUserStar size={16} stroke={2} aria-hidden="true" />
                                    нач
                                    <IconPencil size={14} stroke={2} aria-hidden="true" />
                                </button>
                                {bossChanged && (
                                    <span
                                        className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-red-600 border border-black animate-pulse z-30 shadow-[0_0_8px_#ef4444] pointer-events-none"
                                        style={{ borderRadius: 0 }}
                                    />
                                )}
                            </div>

                            <div className="relative inline-block">
                                <button
                                    type="button"
                                    onClick={handleIsMiniBossButtonClick}
                                    disabled={!isAuthenticated}
                                    className={buttonBaseClass}
                                    style={buttonStyle}
                                >
                                    <IconUser size={16} stroke={2} aria-hidden="true" />
                                    зам
                                    <IconPencil size={14} stroke={2} aria-hidden="true" />
                                </button>
                                {isMiniBossChanged && (
                                    <span
                                        className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-red-600 border border-black animate-pulse z-30 shadow-[0_0_8px_#ef4444] pointer-events-none"
                                        style={{ borderRadius: 0 }}
                                    />
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="relative overflow-hidden">
                    <div className="absolute inset-0 flex flex-wrap content-center justify-center items-center gap-32 z-0 pointer-events-none select-none -rotate-[30deg] opacity-15">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <span
                                key={i}
                                className="text-[5.5rem] font-black text-[#d6d6d6] uppercase whitespace-nowrap tracking-wider font-mono"
                            >
                                {dep.group || 'ОТДЕЛ'}
                            </span>
                        ))}
                    </div>

                    <table className="w-full border-collapse relative z-10 table-auto bg-transparent">
                        <thead>
                            <tr className="border-b border-[#ccc] bg-[#e5e5e5]/90 text-[1.1rem] text-[#333] font-bold">
                                {activeColumn === 'isBoss' && (
                                    <th className="border-r border-[#ccc] p-3 text-left whitespace-nowrap">начальник</th>
                                )}
                                {activeColumn === 'isMiniBoss' && (
                                    <th className="border-r border-[#ccc] p-3 text-left whitespace-nowrap">заместитель</th>
                                )}
                                <th
                                    className="border-r border-[#ccc] p-3 text-left whitespace-nowrap"
                                    style={{ width: `${maxNameLen}ch` }}
                                >
                                    ФИО
                                </th>
                                <th className="border-r border-[#ccc] p-3 text-left">Телефон</th>
                                <th className="border-r border-[#ccc] p-3 text-left">Добавочный</th>
                                <th className="border-r border-[#ccc] p-3 text-left">Кабинет</th>
                                <th className="p-3 text-left">IP</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#ccc]/50">
                            {sortedPhonesWithIndices.map(({ row, originalIndex }, sortedIdx) => {
                                const bossActive = isBossChecked(originalIndex);
                                const miniBossActive = isMiniBossChecked(originalIndex);
                                const anyBossActive = bossActive || miniBossActive;
                                const bossPickDisabled = isBossPickDisabled(originalIndex);
                                const miniBossPickDisabled = isMiniBossPickDisabled(originalIndex);

                                // Tactical monochromatic hierarchy
                                let rowBg = sortedIdx % 2 === 0 ? 'bg-transparent' : 'bg-black/[0.03]';
                                let leftAccentClass = 'border-l-4 border-l-transparent';

                                if (bossActive || miniBossActive) {
                                    rowBg = 'bg-black/15 hover:bg-black/20';
                                    leftAccentClass = miniBossActive ?
                                        'border-l-4 border-l-[#777]'
                                        : 'border-l-4 border-l-black';
                                } else {
                                    rowBg += ' hover:bg-black/10';
                                }

                                return (
                                    <tr key={row.id ?? originalIndex} className={`${rowBg} transition-colors`}>
                                        {/* Boss Selection Box */}
                                        {activeColumn === 'isBoss' && (
                                            <td
                                                className={`border-r border-[#ccc] p-3 text-center select-none ${leftAccentClass} ${bossPickDisabled
                                                        ? 'opacity-40 cursor-not-allowed'
                                                        : 'cursor-pointer hover:bg-black/10'
                                                    }`}
                                                onClick={() => handleBossRadioChange(originalIndex)}
                                                aria-disabled={bossPickDisabled}
                                                title={bossPickDisabled ? 'Уже назначен заместителем' : undefined}
                                            >
                                                <div className="w-5 h-5 border-2 border-[#333] bg-white mx-auto flex items-center justify-center" style={{ borderRadius: 0 }}>
                                                    {bossActive && (
                                                        <IconCheck size={14} stroke={3} className="text-[#111]" aria-hidden="true" />
                                                    )}
                                                </div>
                                            </td>
                                        )}

                                        {/* Deputy Selection Box */}
                                        {activeColumn === 'isMiniBoss' && (
                                            <td
                                                className={`border-r border-[#ccc] p-3 text-center select-none ${!activeColumn ? leftAccentClass : ''
                                                    } ${miniBossPickDisabled
                                                        ? 'opacity-40 cursor-not-allowed'
                                                        : 'cursor-pointer hover:bg-black/10'
                                                    }`}
                                                onClick={() => handleMiniBossCheckboxToggle(originalIndex)}
                                                aria-disabled={miniBossPickDisabled}
                                                title={miniBossPickDisabled ? 'Уже назначен начальником' : undefined}
                                            >
                                                <div className="w-5 h-5 border-2 border-[#333] bg-white mx-auto flex items-center justify-center" style={{ borderRadius: 0 }}>
                                                    {miniBossActive && (
                                                        <IconCheck size={14} stroke={3} className="text-[#111]" aria-hidden="true" />
                                                    )}
                                                </div>
                                            </td>
                                        )}

                                        {/* FIO: left edge stays the existing black (boss) / dark-gray (mini-boss)
                                            accent — untouched — with a thin white bottom edge added on top */}
                                        <td
                                            className={`border-r border-[#ccc] p-3 whitespace-nowrap overflow-hidden ${!activeColumn ? leftAccentClass : ''
                                                } ${anyBossActive ? 'border-b border-white' : ''}`}
                                            style={{ width: `${maxNameLen}ch` }}
                                        >
                                            <div className="flex items-center gap-2">
                                                {bossActive && (
                                                    <span className="bg-black text-white text-[0.7rem] font-bold px-1 py-0.5 tracking-wider font-mono select-none">
                                                        НАЧ
                                                    </span>
                                                )}
                                                {miniBossActive && (
                                                    <span className="bg-[#555] text-white text-[0.7rem] font-bold px-1 py-0.5 tracking-wider font-mono select-none">
                                                        ЗАМ
                                                    </span>
                                                )}
                                                <input
                                                    type="text"
                                                    readOnly
                                                    className={`text-[1.15rem] border-0 bg-transparent p-[0.1rem] outline-none cursor-default block font-mono ${bossActive ? 'font-black text-black' : miniBossActive ? 'font-bold text-[#222]' : 'text-[#333]'}`}
                                                    style={{ width: `${maxNameLen}ch` }}
                                                    value={row?.person || ''}
                                                />
                                            </div>
                                        </td>
                                        <td className={`border-r border-[#ccc] p-3 ${rowCellBorder(anyBossActive)}`}>
                                            <input
                                                type="text"
                                                readOnly
                                                className={`text-[1.15rem] border-0 bg-transparent p-[0.3rem] outline-none text-black cursor-default w-full font-mono ${bossActive ? 'font-bold' : ''}`}
                                                value={row?.phone || ''}
                                            />
                                        </td>
                                        <td className={`border-r border-[#ccc] p-3 ${rowCellBorder(anyBossActive)}`}>
                                            <input
                                                type="text"
                                                readOnly
                                                className={`text-[1.15rem] w-full border-0 bg-transparent p-[0.3rem] outline-none text-black box-border cursor-default font-mono ${bossActive ? 'font-bold' : ''}`}
                                                value={row?.extension || ''}
                                            />
                                        </td>
                                        <td className={`border-r border-[#ccc] p-3 ${rowCellBorder(anyBossActive)}`}>
                                            <input
                                                type="text"
                                                readOnly={!isAuthenticated}
                                                onChange={(e) => onFieldChange(depIndex, originalIndex, 'cabinet', e.target.value)}
                                                className={`text-[1.15rem] w-full border-0 bg-transparent p-[0.3rem] outline-none text-black box-border font-mono ${isAuthenticated ? 'border-b border-[#999] focus:border-[#000]' : 'cursor-default'} ${bossActive ? 'font-bold' : ''}`}
                                                value={row?.cabinet ?? ''}
                                            />
                                        </td>
                                        <td className={`p-3 ${rowCellBorder(anyBossActive)}`}>
                                            <input
                                                type="text"
                                                readOnly={!isAuthenticated}
                                                onChange={(e) => onFieldChange(depIndex, originalIndex, 'ip', e.target.value)}
                                                className={`text-[1.15rem] w-full border-0 bg-transparent p-[0.3rem] outline-none text-black box-border font-mono ${isAuthenticated ? 'border-b border-[#999] focus:border-[#000]' : 'cursor-default'} ${bossActive ? 'font-bold' : ''}`}
                                                value={row?.ip ?? ''}
                                            />
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
