import { IconUserCheck, IconUser, IconPencil, IconCheck, IconExclamationCircle } from '@tabler/icons-react';
import { DepCardProps } from './types';
import { useDepCard } from './useDepCard';
import { GroupNameInput } from './GroupNameInput';
import { DebouncedInput } from './DebouncedInput';

export default function DepCard({
    dep,
    depIndex,
    isAuthenticated,
    onFieldChange,
    onBossChange,
    onEditBoss,
    onEditIsMiniBoss,
    onGroupNameChange,
    bossChanged,
    isMiniBossChanged,
    errors,
}: DepCardProps) {
    const {
        activeColumn,
        groupName,
        sortedPhonesWithIndices,
        maxNameLen,
        isBossChecked,
        isMiniBossChecked,
        isBossPickDisabled,
        isMiniBossPickDisabled,
        isModalOpen,
        bossServerError,
        miniBossServerError,
        hasServerError,
        handleBossButtonClick,
        handleIsMiniBossButtonClick,
        handleBossRadioChange,
        handleMiniBossCheckboxToggle,
        handleGroupSubmit,
        handleGroupKeyDown,
    } = useDepCard(dep, depIndex, isAuthenticated, errors, onFieldChange, onBossChange, onGroupNameChange, onEditBoss, onEditIsMiniBoss);

    const buttonBaseClass =
        "relative bg-white text-[#111] border border-[#ccc] px-3 py-2 text-[0.95rem] font-bold flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 shadow-[3px_3px_0px_#000] hover:shadow-[1px_1px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all duration-100";

    const buttonStyle = {
        fontFamily: '"Courier New", Courier, monospace',
        clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)',
        borderRadius: 0,
    } as const;

    const rowCellBorder = (active: boolean) => (active ? 'border-b border-l border-r border-white' : '');

    const groupError = errors?.[`departments.${depIndex}.group`];

    return (
        <div className="relative mb-12">
            <div className="absolute -top-3 -right-3 w-[35px] h-[35px] border-4 border-white border-b-0 border-l-0 z-20 pointer-events-none" />
            <div className="absolute -bottom-3 -left-3 w-[35px] h-[35px] border-4 border-white border-t-0 border-r-0 z-20 pointer-events-none shadow-[-6px_6px_0px_rgba(0,0,0,0.4)]" />

            <div className="bg-[#f5f5f5] border border-[#ccc] shadow-[6px_6px_0px_rgba(0,0,0,0.4)] relative overflow-hidden text-[#111]" style={{ borderRadius: 0 }}>
                <div
                    className="p-2 text-left relative z-20 flex items-center justify-between"
                    style={{
                        background: 'conic-gradient(#000 90deg, #667 90deg 180deg, #000 180deg 270deg, #667 270deg)',
                        backgroundSize: '0.5rem 0.5rem',
                    }}
                >
                    <div className="bg-[#f5f5f5] inline-block px-4 py-2 text-[1.35rem] font-bold border border-[#ccc]">
                        {!isAuthenticated ? dep.group : (
                            <div>
                                <div className="flex items-center gap-2 border-b border-black">
                                    {/* no onBlur prop: GroupNameInput already sends its pending text on blur */}
                                    <GroupNameInput
                                        value={groupName}
                                        onCommit={(val) => onGroupNameChange?.(depIndex, val)}
                                        onKeyDown={handleGroupKeyDown}
                                    />
                                    <IconPencil size={27} stroke={2} aria-hidden="true" className="shrink-0" />
                                </div>
                                {groupError && (
                                    <div className="mt-1 flex items-center gap-1 text-red-600 text-[0.7rem] font-bold">
                                        <IconExclamationCircle size={11} stroke={2.5} aria-hidden="true" />
                                        <span>{groupError}</span>
                                    </div>
                                )}
                            </div>
                        )}
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
                                    <IconUserCheck size={16} stroke={2} aria-hidden="true" />
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
                            <div key={i}>
                                <span
                                    key={i}
                                    className="text-[5.5rem] font-black text-[#d6d6d6] uppercase whitespace-nowrap tracking-wider font-mono"
                                >
                                    {groupName || 'ОТДЕЛ'}
                                </span>
                            </div>
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
                                const bossErrMsg = bossServerError(originalIndex);
                                const miniBossErrMsg = miniBossServerError(originalIndex);
                                const rowHasServerError = hasServerError(originalIndex);

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

                                if (rowHasServerError) {
                                    rowBg += ' outline outline-red-600 -outline-offset-2';
                                }

                                return (
                                    <tr key={row.id ?? originalIndex} className={`${rowBg} transition-colors`}>
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
                                                {bossErrMsg && (
                                                    <div className="mt-1 flex items-center justify-center gap-1 text-red-600 text-[0.65rem] font-bold leading-tight">
                                                        <IconExclamationCircle size={11} stroke={2.5} aria-hidden="true" />
                                                        <span>{bossErrMsg}</span>
                                                    </div>
                                                )}
                                            </td>
                                        )}

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
                                                {miniBossErrMsg && (
                                                    <div className="mt-1 flex items-center justify-center gap-1 text-red-600 text-[0.65rem] font-bold leading-tight">
                                                        <IconExclamationCircle size={11} stroke={2.5} aria-hidden="true" />
                                                        <span>{miniBossErrMsg}</span>
                                                    </div>
                                                )}
                                            </td>
                                        )}

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
                                                <DebouncedInput
                                                    readOnly={!isAuthenticated}
                                                    value={row?.person}
                                                    onChange={(val) => onFieldChange(depIndex, originalIndex, 'person', val)}
                                                    className={`text-[1.15rem] w-full border-0 bg-transparent p-[0.3rem] outline-none text-black box-border font-mono ${isAuthenticated ? 'border-b border-[#999] focus:border-[#000]' : 'cursor-default'} ${bossActive ? 'font-bold' : ''}`}
                                                />
                                            </div>
                                            {rowHasServerError && (
                                                <div className="mt-1 text-red-600 text-[0.7rem] font-bold">
                                                    {bossErrMsg || miniBossErrMsg}
                                                </div>
                                            )}
                                        </td>
                                        <td className={`border-r border-[#ccc] p-3 ${rowCellBorder(anyBossActive)}`}>
                                            <DebouncedInput
                                                readOnly={!isAuthenticated}
                                                value={row?.phone}
                                                onChange={(val) => onFieldChange(depIndex, originalIndex, 'phone', val)}
                                                className={`text-[1.15rem] w-full border-0 bg-transparent p-[0.3rem] outline-none text-black box-border font-mono ${isAuthenticated ? 'border-b border-[#999] focus:border-[#000]' : 'cursor-default'} ${bossActive ? 'font-bold' : ''}`}
                                            />
                                        </td>
                                        <td className={`border-r border-[#ccc] p-3 ${rowCellBorder(anyBossActive)}`}>
                                            <DebouncedInput
                                                readOnly={!isAuthenticated}
                                                value={row?.extension}
                                                onChange={(val) => onFieldChange(depIndex, originalIndex, 'extension', val)}
                                                className={`text-[1.15rem] w-full border-0 bg-transparent p-[0.3rem] outline-none text-black box-border font-mono ${isAuthenticated ? 'border-b border-[#999] focus:border-[#000]' : 'cursor-default'} ${bossActive ? 'font-bold' : ''}`}
                                            />
                                        </td>
                                        {/* Cabinet Input */}
                                        <td className={`border-r border-[#ccc] p-3 ${rowCellBorder(anyBossActive)}`}>
                                            <DebouncedInput
                                                readOnly={!isAuthenticated}
                                                value={row?.cabinet}
                                                onChange={(val) => onFieldChange(depIndex, originalIndex, 'cabinet', val)}
                                                className={`text-[1.15rem] w-full border-0 bg-transparent p-[0.3rem] outline-none text-black box-border font-mono ${isAuthenticated ? 'border-b border-[#999] focus:border-[#000]' : 'cursor-default'} ${bossActive ? 'font-bold' : ''}`}
                                            />
                                        </td>

                                        {/* IP Input */}
                                        <td className={`p-3 ${rowCellBorder(anyBossActive)}`}>
                                            <DebouncedInput
                                                readOnly={!isAuthenticated}
                                                value={row?.ip}
                                                onChange={(val) => onFieldChange(depIndex, originalIndex, 'ip', val)}
                                                className={`text-[1.15rem] w-full border-0 bg-transparent p-[0.3rem] outline-none text-black box-border font-mono ${isAuthenticated ? 'border-b border-[#999] focus:border-[#000]' : 'cursor-default'} ${bossActive ? 'font-bold' : ''}`}
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







