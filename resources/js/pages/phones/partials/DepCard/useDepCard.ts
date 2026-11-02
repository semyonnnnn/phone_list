import { useState, useMemo, useEffect } from 'react';
import { PhoneRecord, Department, DepCardProps } from './types';

export const isTruthy = (v: any) => v === true || v === 'true' || v === 1 || v === '1';

export const getBossField = (row: PhoneRecord): keyof PhoneRecord => {
    if (row && ('is_boss' in row || row.is_boss !== undefined)) return 'is_boss';
    return 'isBoss';
};

export const getMiniBossField = (row: PhoneRecord): keyof PhoneRecord => {
    if (row && ('is_miniboss' in row || row.is_miniboss !== undefined)) return 'is_miniboss';
    if (row && ('is_isMiniBoss' in row || row.is_isMiniBoss !== undefined)) return 'is_isMiniBoss';
    return 'isMiniBoss';
};

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

    // Local state for department group name editing
    const [groupName, setGroupName] = useState(dep.group);

    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        setGroupName(dep.group);
    }, [dep.group]);

    const handleGroupSubmit = () => {
        if (groupName.trim() !== dep.group) {
            onGroupNameChange?.(depIndex, groupName);
        }
    };

    const handleGroupKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.currentTarget.blur(); // Triggers blur which commits the change
            handleGroupSubmit();
        }
    };

    const isBossChecked = (rowIndex: number) => {
        const row = phones[rowIndex];
        if (!row) return false;
        const field = getBossField(row);
        return isTruthy(row[field] ?? row.isBoss ?? row.is_boss);
    };

    const isMiniBossChecked = (rowIndex: number) => {
        const row = phones[rowIndex];
        if (!row) return false;
        const field = getMiniBossField(row);
        return isTruthy(row[field] ?? row.isMiniBoss ?? row.is_miniboss ?? row.is_isMiniBoss);
    };

    const isBossPickDisabled = (rowIndex: number) =>
        !isBossChecked(rowIndex) && isMiniBossChecked(rowIndex);

    const isMiniBossPickDisabled = (rowIndex: number) =>
        !isMiniBossChecked(rowIndex) && isBossChecked(rowIndex);

    const bossServerError = (rowIndex: number) => {
        const row = phones[rowIndex];
        if (!row) return undefined;
        const field = getBossField(row) as string;
        return errors?.[`departments.${depIndex}.phones.${rowIndex}.${field}`] ||
            errors?.[`departments.${depIndex}.phones.${rowIndex}.isBoss`] ||
            errors?.[`departments.${depIndex}.phones.${rowIndex}.is_boss`];
    };

    const miniBossServerError = (rowIndex: number) => {
        const row = phones[rowIndex];
        if (!row) return undefined;
        const field = getMiniBossField(row) as string;
        return errors?.[`departments.${depIndex}.phones.${rowIndex}.${field}`] ||
            errors?.[`departments.${depIndex}.phones.${rowIndex}.isMiniBoss`] ||
            errors?.[`departments.${depIndex}.phones.${rowIndex}.is_miniboss`] ||
            errors?.[`departments.${depIndex}.phones.${rowIndex}.is_isMiniBoss`];
    };

    const hasServerError = (rowIndex: number) =>
        Boolean(bossServerError(rowIndex) || miniBossServerError(rowIndex));

    const sortedPhonesWithIndices = useMemo(() => {
        return phones
            .map((row, originalIndex) => ({ row, originalIndex }))
            .sort((a, b) => {
                const aBoss = isTruthy(a.row[getBossField(a.row)] ?? a.row.isBoss ?? a.row.is_boss);
                const bBoss = isTruthy(b.row[getBossField(b.row)] ?? b.row.isBoss ?? b.row.is_boss);
                if (aBoss && !bBoss) return -1;
                if (!aBoss && bBoss) return 1;

                const aMini = isTruthy(a.row[getMiniBossField(a.row)] ?? a.row.isMiniBoss ?? a.row.is_miniboss);
                const bMini = isTruthy(b.row[getMiniBossField(b.row)] ?? b.row.isMiniBoss ?? b.row.is_miniboss);
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

        const targetRow = phones[targetOriginalIndex];
        if (!targetRow) return;

        const bossField = getBossField(targetRow);
        if (isTruthy(targetRow[bossField])) return;

        onBossChange(depIndex, targetOriginalIndex);
    };

    const handleMiniBossCheckboxToggle = (targetOriginalIndex: number) => {
        if (!isAuthenticated) return;
        if (isMiniBossPickDisabled(targetOriginalIndex)) return;

        const targetRow = phones[targetOriginalIndex];
        if (!targetRow) return;

        const miniBossField = getMiniBossField(targetRow);
        const currentlyMiniBoss = isTruthy(targetRow[miniBossField]);

        onFieldChange(depIndex, targetOriginalIndex, miniBossField, !currentlyMiniBoss);
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