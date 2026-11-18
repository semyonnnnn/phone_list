import {
    IconUserCheck,
    IconUser,
    IconPencil,
    IconCheck,
    IconExclamationCircle,
    IconPlus,
} from '@tabler/icons-react';
import { DepCardProps } from './types';
import { useDepCard } from './useDepCard';
import { GroupNameInput } from './GroupNameInput';
import { DebouncedInput } from './DebouncedInput';
import { TerritorySwitch } from './TerritorySwitch';

export default function DepCard({
    dep,
    depIndex,
    isAuthenticated,
    onFieldChange,
    onBossChange,
    onEditBoss,
    onEditIsMiniBoss,
    onGroupNameChange,
    onAddPersonClick,
    bossChanged,
    isMiniBossChanged,
    errors,
    territories,
    handleTerritoryChange,
    departmentNameWidth,
    columnWidths,
}: DepCardProps) {
    const {
        activeColumn,
        groupName,
        sortedPhonesWithIndices,
        isBossChecked,
        isMiniBossChecked,
        isBossPickDisabled,
        isMiniBossPickDisabled,
        bossServerError,
        miniBossServerError,
        hasServerError,
        handleBossButtonClick,
        handleIsMiniBossButtonClick,
        handleBossRadioChange,
        handleMiniBossCheckboxToggle,
        handleGroupKeyDown,
        pencilSpace,
        groupError,
        buttonBaseClass,
        buttonStyle,
        gridTemplateColumns,
        hasPickerCol,
        rowCellBorder,
    } = useDepCard(
        dep,
        depIndex,
        isAuthenticated,
        errors,
        onFieldChange,
        onBossChange,
        columnWidths,
        onGroupNameChange,
        onEditBoss,
        onEditIsMiniBoss
    );

    const isEmpty = dep.phones.length === 0;

    return (
        <div className="relative mb-12">
            <div className="absolute -top-3 -right-3 w-[35px] h-[35px] border-4 border-white border-b-0 border-l-0 z-20 pointer-events-none" />
            <div className="absolute -bottom-3 -left-3 w-[35px] h-[35px] border-4 border-white border-t-0 border-r-0 z-20 pointer-events-none shadow-[-6px_6px_0px_rgba(0,0,0,0.4)]" />

            <div
                className="bg-[#f5f5f5] border border-[#ccc] shadow-[6px_6px_0px_rgba(0,0,0,0.4)] relative overflow-hidden text-[#111]"
                style={{ borderRadius: 0 }}
            >
                <div
                    className="p-2 text-left relative z-20 flex items-center justify-between"
                    style={{
                        background:
                            'conic-gradient(#000 90deg, #667 90deg 180deg, #000 180deg 270deg, #667 270deg)',
                        backgroundSize: '0.5rem 0.5rem',
                    }}
                >
                    <div className="flex">
                        <div
                            className="bg-[#f5f5f5] inline-block shrink-0 box-border min-w-[12ch] px-4 py-2 text-[1.35rem] font-bold border border-[#ccc]"
                            style={{
                                width: `calc(${departmentNameWidth}ch + ${pencilSpace})`,
                                maxWidth: `calc(60ch + ${pencilSpace})`,
                            }}
                        >
                            {!isAuthenticated ? (
                                dep.group.name
                            ) : (
                                <div>
                                    <div className="flex justify-between items-center gap-2 border-b border-black">
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

                        <TerritorySwitch
                            value={dep.group.territory}
                            isAuthenticated={isAuthenticated}
                            onChange={(territory) => handleTerritoryChange(depIndex, territory)}
                        />
                    </div>

                    {isAuthenticated && (
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => onAddPersonClick(dep)}
                                title="Добавить сотрудника"
                                className={`${buttonBaseClass} gap-0!`}
                                style={buttonStyle}>
                                <IconPlus size={16} stroke={2.5} aria-hidden="true" />
                                <span aria-hidden="true">&#8203;</span>
                            </button>


                            {!isEmpty && (
                                <>
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
                                </>
                            )}
                        </div>
                    )}
                </div>

                <div className="relative overflow-hidden">
                    <div className="absolute inset-0 flex flex-wrap content-center justify-center items-center gap-32 z-0 pointer-events-none select-none -rotate-[30deg] opacity-15">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i}>
                                <span className="text-[5.5rem] font-black text-[#d6d6d6] uppercase whitespace-nowrap tracking-wider font-mono">
                                    {groupName || 'ОТДЕЛ'}
                                </span>
                            </div>
                        ))}
                    </div>

                    {isEmpty ? (
                        <div className="relative z-10 py-10 px-6 flex flex-col items-center justify-center text-center font-mono gap-3">
                            <div className="text-[1.1rem] font-bold text-[#555] uppercase tracking-wider">
                                В этом отделе пока нет сотрудников
                            </div>
                        </div>
                    ) : (
                        <div
                            className="grid w-full font-mono text-[1.15rem] relative z-10 bg-transparent"
                            style={{ gridTemplateColumns }}>
                            {/* Header Cells */}
                            <div className="contents text-[1.1rem] text-[#333] font-bold">
                                {activeColumn === 'isBoss' && (
                                    <div className="border-b border-r border-[#ccc] bg-[#e5e5e5]/90 border-l-4 border-l-transparent p-1 whitespace-nowrap flex items-center justify-center">
                                        начальник
                                    </div>
                                )}
                                {activeColumn === 'isMiniBoss' && (
                                    <div className="border-b border-r border-[#ccc] bg-[#e5e5e5]/90 border-l-4 border-l-transparent p-1 whitespace-nowrap flex items-center justify-center">
                                        заместитель
                                    </div>
                                )}
                                <div
                                    className={`border-b border-r border-[#ccc] bg-[#e5e5e5]/90 p-3 flex items-center whitespace-nowrap ${!hasPickerCol ? 'border-l-4 border-l-transparent' : ''
                                        }`}
                                >
                                    <span className="px-[0.3rem]">ФИО</span>
                                </div>
                                <div className="border-b border-r border-[#ccc] bg-[#e5e5e5]/90 p-3 flex items-center whitespace-nowrap">
                                    <span className="px-[0.3rem]">Телефон</span>
                                </div>
                                <div className="border-b border-r border-[#ccc] bg-[#e5e5e5]/90 p-3 flex items-center justify-center whitespace-nowrap">
                                    Добавочный
                                </div>
                                <div className="border-b border-r border-[#ccc] bg-[#e5e5e5]/90 p-3 flex items-center whitespace-nowrap">
                                    <span className="px-[0.3rem]">Кабинет</span>
                                </div>
                                <div className="border-b border-[#ccc] bg-[#e5e5e5]/90 p-3 flex items-center whitespace-nowrap">
                                    <span className="px-[0.3rem]">IP</span>
                                </div>
                            </div>

                            {/* Body Rows */}
                            {sortedPhonesWithIndices.map(({ row, originalIndex }, sortedIdx) => {
                                const bossActive = isBossChecked(originalIndex);
                                const miniBossActive = isMiniBossChecked(originalIndex);
                                const anyBossActive = bossActive || miniBossActive;
                                const bossPickDisabled = isBossPickDisabled(originalIndex);
                                const miniBossPickDisabled = isMiniBossPickDisabled(originalIndex);
                                const bossErrMsg = bossServerError(originalIndex);
                                const miniBossErrMsg = miniBossServerError(originalIndex);
                                const rowHasServerError = hasServerError(originalIndex);

                                let baseCellBg = sortedIdx % 2 === 0 ? 'bg-transparent' : 'bg-black/[0.03]';
                                let hoverCellBg = 'group-hover:bg-black/10';

                                if (bossActive || miniBossActive) {
                                    baseCellBg = 'bg-black/15';
                                    hoverCellBg = 'group-hover:bg-black/20';
                                }

                                const cellBgClass = `${baseCellBg} ${hoverCellBg} transition-colors`;

                                let rowBg = sortedIdx % 2 === 0 ? 'bg-transparent' : 'bg-black/[0.03]';
                                let leftAccentClass = 'border-l-4 border-l-transparent';

                                if (bossActive || miniBossActive) {
                                    rowBg = 'bg-black/15 hover:bg-black/20';
                                    leftAccentClass = miniBossActive
                                        ? 'border-l-4 border-l-[#777]'
                                        : 'border-l-4 border-l-black';
                                } else {
                                    rowBg += ' hover:bg-black/10';
                                }

                                const rowDividerClass =
                                    sortedIdx < sortedPhonesWithIndices.length - 1 ? 'border-b border-[#ccc]/50' : '';
                                const errorOutlineClass = rowHasServerError ? 'border-t-2 border-b-2 border-red-600' : '';

                                return (
                                    <div key={row.id ?? originalIndex} className="contents group">
                                        {activeColumn === 'isBoss' && (
                                            <div
                                                className={`border-r border-[#ccc] p-0 flex flex-col items-center justify-center select-none transition-colors ${rowBg} ${rowDividerClass} ${errorOutlineClass} ${leftAccentClass} ${rowCellBorder(
                                                    anyBossActive
                                                )} ${bossPickDisabled
                                                    ? 'opacity-40 cursor-not-allowed'
                                                    : 'cursor-pointer hover:bg-black/10'
                                                    } ${cellBgClass}`}
                                                onClick={() => handleBossRadioChange(originalIndex)}
                                                aria-disabled={bossPickDisabled}
                                                title={bossPickDisabled ? 'Уже назначен заместителем' : undefined}
                                            >
                                                <div
                                                    className="w-5 h-5 border-2 border-[#333] bg-white flex items-center justify-center"
                                                    style={{ borderRadius: 0 }}
                                                >
                                                    {bossActive && (
                                                        <IconCheck
                                                            size={14}
                                                            stroke={3}
                                                            className="text-[#111]"
                                                            aria-hidden="true"
                                                        />
                                                    )}
                                                </div>
                                                {bossErrMsg && (
                                                    <div className="mt-1 flex items-center justify-center gap-1 text-red-600 text-[0.65rem] font-bold leading-tight">
                                                        <IconExclamationCircle
                                                            size={11}
                                                            stroke={2.5}
                                                            aria-hidden="true"
                                                        />
                                                        <span>{bossErrMsg}</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {activeColumn === 'isMiniBoss' && (
                                            <div
                                                className={`border-r border-[#ccc] p-0 flex flex-col items-center justify-center select-none transition-colors ${rowBg} ${rowDividerClass} ${errorOutlineClass} ${leftAccentClass} ${rowCellBorder(
                                                    anyBossActive
                                                )} ${miniBossPickDisabled
                                                    ? 'opacity-40 cursor-not-allowed'
                                                    : 'cursor-pointer hover:bg-black/10'
                                                    } ${cellBgClass}`}
                                                onClick={() => handleMiniBossCheckboxToggle(originalIndex)}
                                                aria-disabled={miniBossPickDisabled}
                                                title={miniBossPickDisabled ? 'Уже назначен начальником' : undefined}
                                            >
                                                <div
                                                    className="w-5 h-5 border-2 border-[#333] bg-white flex items-center justify-center"
                                                    style={{ borderRadius: 0 }}
                                                >
                                                    {miniBossActive && (
                                                        <IconCheck
                                                            size={14}
                                                            stroke={3}
                                                            className="text-[#111]"
                                                            aria-hidden="true"
                                                        />
                                                    )}
                                                </div>
                                                {miniBossErrMsg && (
                                                    <div className="mt-1 flex items-center justify-center gap-1 text-red-600 text-[0.65rem] font-bold leading-tight">
                                                        <IconExclamationCircle
                                                            size={11}
                                                            stroke={2.5}
                                                            aria-hidden="true"
                                                        />
                                                        <span>{miniBossErrMsg}</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Person */}
                                        <div
                                            className={`border-r border-[#ccc] p-3 flex flex-col justify-center overflow-hidden min-w-0 transition-colors ${rowBg} ${rowDividerClass} ${errorOutlineClass} ${!hasPickerCol ? leftAccentClass : ''
                                                } ${rowCellBorder(anyBossActive)} ${cellBgClass}`}
                                        >
                                            <div className="flex items-center gap-2 min-w-0">
                                                {bossActive && (
                                                    <span className="bg-black text-white text-[0.7rem] font-bold px-1 py-0.5 tracking-wider font-mono select-none shrink-0">
                                                        НАЧ
                                                    </span>
                                                )}
                                                {miniBossActive && (
                                                    <span className="bg-[#555] text-white text-[0.7rem] font-bold px-1 py-0.5 tracking-wider font-mono select-none shrink-0">
                                                        ЗАМ
                                                    </span>
                                                )}
                                                <DebouncedInput
                                                    readOnly={!isAuthenticated}
                                                    value={row?.person}
                                                    onChange={(val) =>
                                                        onFieldChange(depIndex, originalIndex, 'person', val)
                                                    }
                                                    className={`text-[1.15rem] w-full min-w-0 border-0 bg-transparent p-[0.3rem] outline-none text-black box-border font-mono ${isAuthenticated
                                                        ? 'border-b border-[#999] focus:border-[#000]'
                                                        : 'cursor-default'
                                                        } ${bossActive ? 'font-bold' : ''}`}
                                                />
                                            </div>
                                            {rowHasServerError && (
                                                <div className="mt-1 text-red-600 text-[0.7rem] font-bold">
                                                    {bossErrMsg || miniBossErrMsg}
                                                </div>
                                            )}
                                        </div>

                                        {/* Phone */}
                                        <div
                                            className={`border-r border-[#ccc] p-3 flex items-center min-w-0 transition-colors ${rowBg} ${rowDividerClass} ${errorOutlineClass} ${rowCellBorder(
                                                anyBossActive
                                            )} ${cellBgClass}`}
                                        >
                                            <DebouncedInput
                                                readOnly={!isAuthenticated}
                                                value={row?.phone}
                                                onChange={(val) =>
                                                    onFieldChange(depIndex, originalIndex, 'phone', val)
                                                }
                                                className={`text-[1.15rem] w-full min-w-0 border-0 bg-transparent p-[0.3rem] outline-none text-black box-border font-mono ${isAuthenticated
                                                    ? 'border-b border-[#999] focus:border-[#000]'
                                                    : 'cursor-default'
                                                    } ${bossActive ? 'font-bold' : ''}`}
                                            />
                                        </div>

                                        {/* Extension */}
                                        <div
                                            className={`border-r border-[#ccc] p-3 flex items-center min-w-0 transition-colors ${rowBg} ${rowDividerClass} ${errorOutlineClass} ${rowCellBorder(
                                                anyBossActive
                                            )} ${cellBgClass}`}
                                        >
                                            <DebouncedInput
                                                readOnly={!isAuthenticated}
                                                value={row?.extension}
                                                onChange={(val) =>
                                                    onFieldChange(depIndex, originalIndex, 'extension', val)
                                                }
                                                className={`text-[1.15rem] text-center w-full min-w-0 border-0 bg-transparent p-[0.3rem] outline-none text-black box-border font-mono ${isAuthenticated
                                                    ? 'border-b border-[#999] focus:border-[#000]'
                                                    : 'cursor-default'
                                                    } ${bossActive ? 'font-bold' : ''}`}
                                            />
                                        </div>

                                        {/* Cabinet */}
                                        <div
                                            className={`border-r border-[#ccc] p-3 flex items-center min-w-0 transition-colors ${rowBg} ${rowDividerClass} ${errorOutlineClass} ${rowCellBorder(
                                                anyBossActive
                                            )} ${cellBgClass}`}
                                        >
                                            <DebouncedInput
                                                readOnly={!isAuthenticated}
                                                value={row?.cabinet}
                                                onChange={(val) =>
                                                    onFieldChange(depIndex, originalIndex, 'cabinet', val)
                                                }
                                                className={`text-[1.15rem] w-full min-w-0 border-0 bg-transparent p-[0.3rem] outline-none text-black box-border font-mono ${isAuthenticated
                                                    ? 'border-b border-[#999] focus:border-[#000]'
                                                    : 'cursor-default'
                                                    } ${bossActive ? 'font-bold' : ''}`}
                                            />
                                        </div>

                                        {/* IP */}
                                        <div
                                            className={`p-3 flex items-center min-w-0 transition-colors ${rowBg} ${rowDividerClass} ${errorOutlineClass} ${rowCellBorder(
                                                anyBossActive
                                            )} ${cellBgClass}`}
                                        >
                                            <DebouncedInput
                                                readOnly={!isAuthenticated}
                                                value={row?.ip}
                                                onChange={(val) =>
                                                    onFieldChange(depIndex, originalIndex, 'ip', val)
                                                }
                                                className={`text-[1.15rem] w-full min-w-0 border-0 bg-transparent p-[0.3rem] outline-none text-black box-border font-mono ${isAuthenticated
                                                    ? 'border-b border-[#999] focus:border-[#000]'
                                                    : 'cursor-default'
                                                    } ${bossActive ? 'font-bold' : ''}`}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
