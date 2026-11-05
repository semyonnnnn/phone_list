export interface PhoneRecord {
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

export interface Department {
    group: DepartmentGroup;
    phones: PhoneRecord[];
}

export interface DepCardProps {
    territories: [string, string];
    dep: Department;
    depIndex: number;
    isAuthenticated: boolean;
    onFieldChange: (
        depIndex: number,
        rowIndex: number,
        field: keyof PhoneRecord,
        value: string | boolean
    ) => void;
    onBossChange: (
        depIndex: number,
        targetRowIndex: number
    ) => void;
    onEditBoss?: (depIndex: number) => void;
    onEditIsMiniBoss?: (depIndex: number) => void;
    bossChanged: boolean;
    isMiniBossChanged: boolean;
    errors?: Record<string, string>;
    onGroupNameChange?: (depIndex: number, newGroupName: string) => void;
    handleTerritoryChange: (depIndex: number, territory: string) => void; // NEW
}

export interface GroupNameInputProps {
    value: string | null;
    onCommit: (val: string) => void;
    onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
    onBlur?: React.FocusEventHandler<HTMLInputElement>;
}

export interface DebouncedInputProps {
    value: string | null;
    onChange: (val: string) => void;
    readOnly?: boolean;
    className?: string;
}

// `type`, not `interface`: see the note above. PageProps and the form data reuse this.
export type DepartmentGroup = {
    name: string;
    territory: string;
};