import {
    IconUserCheck,
    IconUser,
    IconPencil,
    IconCheck,
    IconExclamationCircle,
    IconPlus,
    IconX,
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
    handleTerritoryChange,
    departmentNameWidth,
    columnWidths,
    onRequestDelete,
}: DepCardProps) {
    const {
        activeColumn,
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
        <div className="relative">
            <div className="absolute -top-2 -right-2 w-6 h-6 border-2 border-white border-b-0 border-l-0 z-20 pointer-events-none" />
            <div className="absolute -bottom-2 -left-2 w-6 h-6 border-2 border-white border-t-0 border-r-0 z-20 pointer-events-none shadow-[-4px_4px_0px_rgba(0,0,0,0.4)]" />

            <div
                className="bg-[#f5f5f5] shadow-[0px_0px_20px_rgba(0,0,0,.9)] relative overflow-hidden text-[#111]"
                style={{ borderRadius: 0 }}
            >
                <div
                    className="pl-0 pr-2 py-0 text-left relative z-20 flex items-stretch justify-between"
                    style={{
                        background:
                            'conic-gradient(#000 90deg, #667 90deg 180deg, #000 180deg 270deg, #667 270deg)',
                        backgroundSize: '0.5rem 0.5rem',
                    }}
                >
                    <div className="flex items-stretch">
                        <div
                            className="bg-[#f5f5f5] flex flex-col justify-center shrink-0 box-border min-w-[12ch] px-3 py-1 text-[1.15rem] leading-tight font-bold border-r border-[#ccc]"
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
                                            value={dep.group.name}
                                            onCommit={(val) => onGroupNameChange?.(depIndex, val)}
                                            onKeyDown={handleGroupKeyDown}
                                        />

                                        <IconPencil size={20} stroke={2} aria-hidden="true" className="shrink-0" />
                                    </div>

                                    {groupError && (
                                        <div className="mt-0.5 flex items-center gap-1 text-red-600 text-[0.7rem] font-bold">
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

                        {isAuthenticated && (
                            <button
                                type="button"
                                onClick={() => onRequestDelete({
                                    departmentName: dep.group.name,
                                    route: route('departments.destroy', dep.group.id),
                                    territory: dep.group.territory,
                                    message: `Удалить отдел "${dep.group.name}"?`,
                                })}
                                title="Удалить отдел"
                                aria-label="Удалить отдел"
                                className="inline-flex self-stretch items-center justify-center border-r border-[#667] bg-[#222]/50 backdrop-blur-[1.8px] px-2.5 text-base text-[#ddd] outline-none cursor-pointer transition-colors hover:bg-red-600/80 hover:border-red-400 hover:text-white active:bg-red-700 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                            >
                                <IconX size={16} stroke={1.75} aria-hidden="true" />
                            </button>
                        )}
                    </div>

                    {isAuthenticated && (
                        <div className="flex items-center gap-1.5 py-1">
                            <button
                                type="button"
                                onClick={() => onAddPersonClick(dep)}
                                title="Добавить сотрудника"
                                className={`${buttonBaseClass} gap-0! py-0.5! px-2! text-[0.8rem]! leading-none!`}
                                style={buttonStyle}>
                                <IconPlus size={13} stroke={2.5} aria-hidden="true" />
                                <span aria-hidden="true">&#8203;</span>
                            </button>


                            {!isEmpty && (
                                <>
                                    <div className="relative inline-block">
                                        <button
                                            type="button"
                                            onClick={handleBossButtonClick}
                                            disabled={!isAuthenticated}
                                            className={`${buttonBaseClass} py-0.5! px-2.5! text-[0.8rem]! leading-none! gap-1!`}
                                            style={buttonStyle}
                                        >
                                            <IconUserCheck size={13} stroke={2} aria-hidden="true" />
                                            нач
                                            <IconPencil size={11} stroke={2} aria-hidden="true" />
                                        </button>
                                        {bossChanged && (
                                            <span
                                                className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-600 border border-black animate-pulse z-30 shadow-[0_0_8px_#ef4444] pointer-events-none"
                                                style={{ borderRadius: 0 }}
                                            />
                                        )}
                                    </div>

                                    <div className="relative inline-block">
                                        <button
                                            type="button"
                                            onClick={handleIsMiniBossButtonClick}
                                            disabled={!isAuthenticated}
                                            className={`${buttonBaseClass} py-0.5! px-2.5! text-[0.8rem]! leading-none! gap-1!`}
                                            style={buttonStyle}
                                        >
                                            <IconUser size={13} stroke={2} aria-hidden="true" />
                                            зам
                                            <IconPencil size={11} stroke={2} aria-hidden="true" />
                                        </button>
                                        {isMiniBossChanged && (
                                            <span
                                                className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-600 border border-black animate-pulse z-30 shadow-[0_0_8px_#ef4444] pointer-events-none"
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
                    <div className="absolute inset-0 flex flex-wrap content-center justify-center items-center gap-32 z-0 pointer-events-none select-none rotate-[-30deg] opacity-15">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i}>
                                <span className="text-[5.5rem] font-black text-[#d6d6d6] uppercase whitespace-nowrap tracking-wider font-mono">
                                    {dep.group.name || 'ОТДЕЛ'}
                                </span>
                            </div>
                        ))}
                    </div>

                    {isEmpty ? (
                        <div className="relative z-10 py-6 px-6 flex flex-col items-center justify-center text-center font-mono gap-2">
                            <div className="text-[1rem] font-bold text-[#555] uppercase tracking-wider">
                                В этом отделе пока нет сотрудников
                            </div>
                        </div>
                    ) : (
                        <div
                            className="grid w-full font-mono text-[1rem] relative z-10 bg-transparent"
                            style={{ gridTemplateColumns }}>
                            {/* Header Cells */}
                            <div className="contents text-[0.95rem] text-[#333] font-bold">
                                {activeColumn === 'isBoss' && (
                                    <div className="border-b border-r border-[#ccc] bg-[#e5e5e5]/90 border-l-4 border-l-transparent py-1.5 px-1 whitespace-nowrap flex items-center justify-center">
                                        начальник
                                    </div>
                                )}
                                {activeColumn === 'isMiniBoss' && (
                                    <div className="border-b border-r border-[#ccc] bg-[#e5e5e5]/90 border-l-4 border-l-transparent py-1.5 px-1 whitespace-nowrap flex items-center justify-center">
                                        заместитель
                                    </div>
                                )}
                                <div
                                    className={`border-b border-r border-[#ccc] bg-[#e5e5e5]/90 py-1.5 px-2.5 flex items-center whitespace-nowrap ${!hasPickerCol ? 'border-l-4 border-l-transparent' : ''
                                        }`}
                                >
                                    <span className="px-1">ФИО</span>
                                </div>
                                <div className="border-b border-r border-[#ccc] bg-[#e5e5e5]/90 py-1.5 px-2.5 flex items-center whitespace-nowrap">
                                    <span className="px-1">Телефон</span>
                                </div>
                                <div className="border-b border-r border-[#ccc] bg-[#e5e5e5]/90 py-1.5 px-2.5 flex items-center justify-center whitespace-nowrap">
                                    Добавочный
                                </div>
                                <div className="border-b border-r border-[#ccc] bg-[#e5e5e5]/90 py-1.5 px-2.5 flex items-center whitespace-nowrap">
                                    <span className="px-1">Кабинет</span>
                                </div>
                                <div className="border-b border-r border-[#ccc] bg-[#e5e5e5]/90 py-1.5 px-2.5 flex items-center whitespace-nowrap">
                                    <span className="px-1">Должность / Комментарий</span>
                                </div>
                                <div className="border-b border-[#ccc] bg-[#e5e5e5]/90 py-1.5 px-2.5 flex items-center whitespace-nowrap">
                                    <span className="px-1">IP</span>
                                </div>

                                {isAuthenticated && (
                                    <div className="border-b border-l border-[#ccc] bg-[#e5e5e5]/90 py-1.5 px-2" />
                                )}
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

                                const bossInnerBorder = anyBossActive ? "border-[#eee]" : "border-[#ccc]";

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
                                    !anyBossActive && sortedIdx < sortedPhonesWithIndices.length - 1
                                        ? 'border-b border-b-gray-400'
                                        : '';


                                const effectiveRowBorder = anyBossActive
                                    ? rowCellBorder(true)
                                    : rowDividerClass;

                                const errorOutlineClass = rowHasServerError ? 'border-t-2 border-b-2 border-red-600' : '';

                                const personErrMsg = errors?.[`departments.${depIndex}.phones.${originalIndex}.phone`];

                                return (
                                    <div key={row.id ?? originalIndex} className="contents group">
                                        {activeColumn === 'isBoss' && (
                                            <div
                                                className={`border-r border-[#ccc] p-0 flex flex-col items-center justify-center select-none transition-colors ${rowBg} ${errorOutlineClass} ${leftAccentClass} ${effectiveRowBorder} ${bossPickDisabled
                                                    ? 'opacity-40 cursor-not-allowed'
                                                    : 'cursor-pointer hover:bg-black/10'
                                                    } ${cellBgClass}`}
                                                onClick={() => handleBossRadioChange(originalIndex)}
                                                aria-disabled={bossPickDisabled}
                                                title={bossPickDisabled ? 'Уже назначен заместителем' : undefined}
                                            >
                                                <div
                                                    className="w-4 h-4 border-2 border-[#333] bg-white flex items-center justify-center"
                                                    style={{ borderRadius: 0 }}
                                                >
                                                    {bossActive && (
                                                        <IconCheck
                                                            size={12}
                                                            stroke={3}
                                                            className="text-[#111]"
                                                            aria-hidden="true"
                                                        />
                                                    )}
                                                </div>
                                                {bossErrMsg && (
                                                    <div className="mt-0.5 flex items-center justify-center gap-1 text-red-600 text-[0.65rem] font-bold leading-tight">
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
                                                className={`border-r border-[#ccc] p-0 flex flex-col items-center justify-center select-none transition-colors ${rowBg} ${errorOutlineClass} ${leftAccentClass} ${effectiveRowBorder} ${miniBossPickDisabled
                                                    ? 'opacity-40 cursor-not-allowed'
                                                    : 'cursor-pointer hover:bg-black/10'
                                                    } ${cellBgClass}`}
                                                onClick={() => handleMiniBossCheckboxToggle(originalIndex)}
                                                aria-disabled={miniBossPickDisabled}
                                                title={miniBossPickDisabled ? 'Уже назначен начальником' : undefined}
                                            >
                                                <div
                                                    className="w-4 h-4 border-2 border-[#333] bg-white flex items-center justify-center"
                                                    style={{ borderRadius: 0 }}
                                                >
                                                    {miniBossActive && (
                                                        <IconCheck
                                                            size={12}
                                                            stroke={3}
                                                            className="text-[#111]"
                                                            aria-hidden="true"
                                                        />
                                                    )}
                                                </div>
                                                {miniBossErrMsg && (
                                                    <div className="mt-0.5 flex items-center justify-center gap-1 text-red-600 text-[0.65rem] font-bold leading-tight">
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
                                            className={`border-r border-[#ccc] py-1 px-2.5 flex flex-col justify-center overflow-hidden min-w-0 transition-colors ${rowBg} ${errorOutlineClass} ${!hasPickerCol ? leftAccentClass : ''
                                                } ${effectiveRowBorder} ${cellBgClass}`}
                                        >
                                            <div className="flex items-center gap-1.5 min-w-0">
                                                {bossActive && (
                                                    <span className="bg-black text-white text-[0.65rem] font-bold px-1 py-px tracking-wider font-mono select-none shrink-0">
                                                        НАЧ
                                                    </span>
                                                )}
                                                {miniBossActive && (
                                                    <span className="bg-[#555] text-white text-[0.65rem] font-bold px-1 py-px tracking-wider font-mono select-none shrink-0">
                                                        ЗАМ
                                                    </span>
                                                )}
                                                <DebouncedInput
                                                    readOnly={!isAuthenticated}
                                                    value={row?.person}
                                                    onChange={(val) =>
                                                        onFieldChange(depIndex, originalIndex, 'person', val)
                                                    }
                                                    className={`text-[1rem] leading-snug w-full min-w-0 border-0 bg-transparent py-0.5 px-1 outline-none text-black box-border font-mono ${isAuthenticated
                                                        ? 'border-b border-[#999] focus:border-black'
                                                        : 'cursor-default'
                                                        } ${bossActive ? 'font-bold' : ''}`}
                                                />
                                            </div>
                                            {rowHasServerError && (
                                                <div className="mt-0.5 text-red-600 text-[0.7rem] font-bold">
                                                    {bossErrMsg || miniBossErrMsg}
                                                </div>
                                            )}
                                        </div>

                                        {/* Phone */}
                                        <div
                                            className={`border-r border-[#ccc] py-1 px-2.5 flex items-center min-w-0 transition-colors ${rowBg} ${errorOutlineClass} ${effectiveRowBorder} ${cellBgClass}`}
                                        >
                                            <DebouncedInput
                                                readOnly={!isAuthenticated}
                                                value={row?.phone}
                                                onChange={(val) =>
                                                    onFieldChange(depIndex, originalIndex, 'phone', val)
                                                }
                                                className={`text-[1rem] leading-snug w-full min-w-0 border-0 bg-transparent py-0.5 px-1 outline-none text-black box-border font-mono ${isAuthenticated
                                                    ? 'border-b border-[#999] focus:border-black'
                                                    : 'cursor-default'
                                                    } ${bossActive ? 'font-bold' : ''}`}
                                            />
                                        </div>

                                        {/* Extension */}
                                        <div
                                            className={`border-r border-[#ccc] py-1 px-2.5 flex items-center min-w-0 transition-colors ${rowBg} ${errorOutlineClass} ${effectiveRowBorder} ${cellBgClass}`}
                                        >
                                            <DebouncedInput
                                                readOnly={!isAuthenticated}
                                                value={row?.extension}
                                                onChange={(val) =>
                                                    onFieldChange(depIndex, originalIndex, 'extension', val)
                                                }
                                                className={`text-[1rem] leading-snug text-center w-full min-w-0 border-0 bg-transparent py-0.5 px-1 outline-none text-black box-border font-mono ${isAuthenticated
                                                    ? 'border-b border-[#999] focus:border-black'
                                                    : 'cursor-default'
                                                    } ${bossActive ? 'font-bold' : ''}`}
                                            />
                                        </div>

                                        {/* Cabinet */}
                                        <div
                                            className={`border-r border-[#ccc] py-1 px-2.5 flex items-center min-w-0 transition-colors ${rowBg} ${errorOutlineClass} ${effectiveRowBorder} ${cellBgClass}`}
                                        >
                                            <DebouncedInput
                                                readOnly={!isAuthenticated}
                                                value={row?.cabinet}
                                                onChange={(val) =>
                                                    onFieldChange(depIndex, originalIndex, 'cabinet', val)
                                                }
                                                className={`text-[1rem] leading-snug w-full min-w-0 border-0 bg-transparent py-0.5 px-1 outline-none text-black box-border font-mono ${isAuthenticated
                                                    ? 'border-b border-[#999] focus:border-black'
                                                    : 'cursor-default'
                                                    } ${bossActive ? 'font-bold' : ''}`}
                                            />
                                        </div>

                                        {/* Position & Comment */}
                                        <div
                                            className={`border-r border-[#ccc] py-0.5 px-2.5 flex flex-col justify-center min-w-0 transition-colors ${rowBg} ${errorOutlineClass} ${effectiveRowBorder} ${cellBgClass}`}
                                        >
                                            {isAuthenticated ? (
                                                <>
                                                    <DebouncedInput
                                                        value={row?.position}
                                                        placeholder="Должность..."
                                                        onChange={(val) =>
                                                            onFieldChange(depIndex, originalIndex, 'position', val)
                                                        }
                                                        className={`text-[0.82rem] leading-tight w-full min-w-0 border-0 bg-transparent py-0 px-1 outline-none text-[#111] box-border font-mono border-b focus:border-black ${bossInnerBorder}`}
                                                    />
                                                    <DebouncedInput
                                                        value={row?.comment}
                                                        placeholder="Комментарий..."
                                                        onChange={(val) =>
                                                            onFieldChange(depIndex, originalIndex, 'comment', val)
                                                        }
                                                        className="text-[0.74rem] leading-tight w-full min-w-0 border-0 bg-transparent py-0 px-1 mt-0.5 outline-none text-[#555] italic box-border font-mono border-b border-[#ccc] focus:border-black"
                                                    />
                                                </>
                                            ) : (
                                                <>
                                                    <div
                                                        className={`text-[0.82rem] leading-tight w-full min-w-0 py-0 px-1 text-[#111] font-mono wrap-break-word border-b ${bossInnerBorder}`}
                                                    >
                                                        {row?.position}
                                                    </div>
                                                    <div className="text-[0.74rem] leading-tight w-full min-w-0 py-0 px-1 mt-0.5 text-[#555] italic font-mono wrap-break-word">
                                                        {row?.comment}
                                                    </div>
                                                </>
                                            )}
                                        </div>


                                        {/* IP */}
                                        <div
                                            className={`py-1 px-2.5 border-r border-[#ccc] flex items-center min-w-0 transition-colors ${rowBg} ${errorOutlineClass} ${effectiveRowBorder} ${cellBgClass}`}>
                                            <DebouncedInput
                                                readOnly={!isAuthenticated}
                                                value={row?.ip}
                                                onChange={(val) =>
                                                    onFieldChange(depIndex, originalIndex, 'ip', val)
                                                }
                                                className={`text-[1rem] leading-snug w-full min-w-0 border-0 bg-transparent py-0.5 px-1 outline-none text-black box-border font-mono ${isAuthenticated
                                                    ? 'border-b border-[#999] focus:border-black'
                                                    : 'cursor-default'
                                                    } ${bossActive ? 'font-bold' : ''}`}
                                            />
                                        </div>
                                        {isAuthenticated && (
                                            <div className={`flex items-center justify-center py-1 px-2 transition-colors ${rowBg} ${errorOutlineClass} ${effectiveRowBorder} ${cellBgClass}`}>
                                                <button
                                                    type="button"
                                                    onClick={() => onRequestDelete({
                                                        departmentName: dep.group.name,
                                                        route: route('phones.destroy', row.id),
                                                        territory: dep.group.territory,
                                                        message: 'Удалить запись?',
                                                        phoneDetails: {
                                                            person: row.person,
                                                            phone: row.phone,
                                                            extension: row.extension
                                                        }
                                                    })}
                                                    title="Удалить запись"
                                                    aria-label="Удалить запись"
                                                    className="inline-flex self-stretch items-center justify-center border border-r-0 border-b-0 border-[#667] backdrop-blur-[1.8px] px-2.5 text-gray-600 outline-none cursor-pointer transition-colors hover:bg-gray-200/80 hover:border-red-400 hover:text-red-500 active:bg-gray-300 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black hover:shadow-xl">
                                                    <IconX size={16} stroke={1.75} aria-hidden="true" />
                                                </button>
                                            </div>
                                        )}
                                        {personErrMsg && (
                                            <div
                                                className={`col-span-full px-4 py-1 bg-red-50/95 text-red-600 text-[0.75rem] font-bold flex items-center gap-1.5 border-l-4 border-l-red-600 ${rowDividerClass}`}
                                            >
                                                <IconExclamationCircle size={14} stroke={2.5} aria-hidden="true" className="shrink-0" />
                                                <span>{personErrMsg}</span>
                                            </div>
                                        )}
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
