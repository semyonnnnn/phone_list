import { useState, useMemo, useEffect } from 'react';
import { Department, DepCardProps } from './types';
import { isBoss, isMiniBoss, sortWithIndices } from '../../phoneRoles';

export function useDepCard(
    dep: Department,
    depIndex: number,
    isAuthenticated: boolean,
    errors: Record<string, string> | undefined,
    onFieldChange: DepCardProps['onFieldChange'],
    onBossChange: DepCardProps['onBossChange'],
    onGroupNameChange?: DepCardProps['onGroupNameChange'],
    onEditBoss?: (depIndex: number) => void,
    onEditIsMiniBoss?: (depIndex: number) => void
) {
    const phones = dep.phones || [];
    const [activeColumn, setActiveColumn] = useState<'isBoss' | 'isMiniBoss' | null>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);

    // dep.group is { name, territory }; only the name is text that gets edited,
    // so only the name goes into this string state.
    const [groupName, setGroupName] = useState(dep.group.name);

    // Pull the name in when the server (or Cancel) sends a new one. It depends on
    // dep.group.name, not dep.group: a territory click replaces the group object but
    // leaves the name unchanged, so this effect doesn't fire and nothing resets.
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

    const isBossPickDisabled = (rowIndex: number) =>
        !isBossChecked(rowIndex) && isMiniBossChecked(rowIndex);

    const isMiniBossPickDisabled = (rowIndex: number) =>
        !isMiniBossChecked(rowIndex) && isBossChecked(rowIndex);

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

    const hasServerError = (rowIndex: number) =>
        Boolean(bossServerError(rowIndex) || miniBossServerError(rowIndex));

    // Same dependency as before ([phones]); the sort itself now lives in phoneRoles.ts
    const sortedPhonesWithIndices = useMemo(() => sortWithIndices(phones), [phones]);

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
    };
}