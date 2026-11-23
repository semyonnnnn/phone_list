import { useEffect, useMemo, useState } from 'react';
//////////////////////////////////////////////////////////
import { usePhoneContext } from '@/pages/phones/context/PhonesContext';
import { Department, DepCardProps } from '@/pages/phones/partials/DepCard/types';
import { isBoss, isMiniBoss, sortWithIndices } from '@/pages/phones/partials/phoneRoles';

export function useDepCard(
    dep: Department,
    depIndex: number,
    isAuthenticated: boolean,
    errors: Partial<Record<string, string>>,
    onFieldChange: DepCardProps['onFieldChange'],
    onBossChange: DepCardProps['onBossChange'],
    columnWidths: {
        personWidth: number;
        phoneWidth: number;
        cabinetWidth: number;
        ipWidth: number;
    },
    onGroupNameChange?: DepCardProps['onGroupNameChange'],
    onEditBoss?: (depIndex: number) => void,
    onEditIsMiniBoss?: (depIndex: number) => void,
) {
    const phones = dep.phones || [];
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [groupName, setGroupName] = useState(dep.group.name);

    const { activePicker, togglePicker } = usePhoneContext();

    const activeColumn = activePicker?.depKey === depIndex ? activePicker.column : null;

    useEffect(() => {
        setGroupName(dep.group.name);
    }, [dep.group.name]);

    const handleGroupSubmit = () => {
        if (groupName.trim() !== dep.group.name) {
            onGroupNameChange?.(depIndex, groupName);
        }
    };

    // Enter just leaves the field. GroupNameInput's own onBlur sends the pending
    // text to the parent, so nothing else has to run here.
    const handleGroupKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.currentTarget.blur();
        }
    };

    const isBossChecked = (rowIndex: number) => {
        const row = phones[rowIndex];
        return row ? isBoss(row) : false;
    };

    const isMiniBossChecked = (rowIndex: number) => {
        const row = phones[rowIndex];
        return row ? isMiniBoss(row) : false;
    };

    const isBossPickDisabled = (rowIndex: number) => !isBossChecked(rowIndex) && isMiniBossChecked(rowIndex);

    const isMiniBossPickDisabled = (rowIndex: number) => !isMiniBossChecked(rowIndex) && isBossChecked(rowIndex);

    // Keys match what PhoneUpdateRequest::withValidator() adds:
    // departments.{dep}.phones.{row}.isBoss / .isMiniBoss
    const bossServerError = (rowIndex: number) => {
        if (!phones[rowIndex]) return undefined;
        return errors?.[`departments.${depIndex}.phones.${rowIndex}.isBoss`];
    };

    const miniBossServerError = (rowIndex: number) => {
        if (!phones[rowIndex]) return undefined;
        return errors?.[`departments.${depIndex}.phones.${rowIndex}.isMiniBoss`];
    };

    const hasServerError = (rowIndex: number) => Boolean(bossServerError(rowIndex) || miniBossServerError(rowIndex));

    // Same dependency as before ([phones]); the sort itself now lives in phoneRoles.ts
    const sortedPhonesWithIndices = useMemo(() => sortWithIndices(phones), [phones]);

    const handleBossButtonClick = () => togglePicker(depIndex, 'isBoss');
    const handleIsMiniBossButtonClick = () => togglePicker(depIndex, 'isMiniBoss');

    const handleBossRadioChange = (targetOriginalIndex: number) => {
        if (!isAuthenticated) return;
        if (isBossPickDisabled(targetOriginalIndex)) return;

        const targetRow = phones[targetOriginalIndex];
        if (!targetRow) return;

        // a radio can't be unchecked: clicking the current boss does nothing
        if (isBoss(targetRow)) return;

        onBossChange(depIndex, targetOriginalIndex);
    };

    const handleMiniBossCheckboxToggle = (targetOriginalIndex: number) => {
        if (!isAuthenticated) return;
        if (isMiniBossPickDisabled(targetOriginalIndex)) return;

        const targetRow = phones[targetOriginalIndex];
        if (!targetRow) return;

        // 'isMiniBoss' is the only field that was ever written here
        onFieldChange(depIndex, targetOriginalIndex, 'isMiniBoss', !isMiniBoss(targetRow));
    };

    const maxNameLen = Math.max(5, ...phones.map((r) => (r.person || '').length)) + 6;

    const buttonBaseClass =
        'relative bg-white text-[#111] border border-[#ccc] px-3 py-2 text-[0.95rem] font-bold flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 shadow-[3px_3px_0px_#000] hover:shadow-[1px_1px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all duration-100';

    const buttonStyle = {
        fontFamily: '"Courier New", Courier, monospace',
        clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)',
        borderRadius: 0,
    } as const;

    const rowCellBorder = (active: boolean) => (active ? 'border-b border-white' : '');

    const groupError = errors?.[`departments.${depIndex}.group.name`];
    const pencilSpace = isAuthenticated ? '27px + 0.5rem' : '0px';

    const hasPickerCol = activeColumn === 'isBoss' || activeColumn === 'isMiniBoss';
    const deleteColWidth = isAuthenticated ? '3.5rem' : '0rem';

    const gridTemplateColumns = [
        ...(hasPickerCol ? ['13ch'] : []),
        `minmax(0, calc(${columnWidths.personWidth}ch + 4.5rem - ${deleteColWidth}))`,
        `calc(${columnWidths.phoneWidth}ch + 2rem)`,
        '12ch',
        'minmax(8ch, 1fr)',
        `calc(${columnWidths.ipWidth}ch + 2rem)`,
        ...(isAuthenticated ? [deleteColWidth] : []),
    ].join(' ');

    // const onAddPersonClick = () => {
    //     console.log('hi');
    // };

    return {
        phones,
        activeColumn,
        groupName,
        setGroupName,
        setIsModalOpen,
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
        pencilSpace,
        groupError,
        buttonBaseClass,
        buttonStyle,
        gridTemplateColumns,
        hasPickerCol,
        rowCellBorder,
        // onAddPersonClick,
    };
}
