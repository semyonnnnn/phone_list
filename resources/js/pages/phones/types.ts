import { GlobalTerritoryKey, TerritoryKey } from '@/types';
import { DepartmentGroup } from './partials/DepCard/types';
import { DepartmentValue } from './partials/DepartmentDropdown/types';

export interface PhoneRecord {
    id?: number;
    person: string;
    phone: string;
    extension: string;
    cabinet: string | null;
    ip: string | null;
    file_id: string;
    is_boss?: boolean;
    is_miniboss?: boolean;
    [key: string]: any;
}

// One department card: its group plus its phone rows. Defined once so
// PageProps and PhoneForm can't drift apart.
export interface Department {
    group: DepartmentGroup;
    phones: PhoneRecord[];
}

export interface DepartmentOption {
    label: string;
    value: DepartmentValue;
}

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface PageProps {
    auth: {
        is_authenticated: boolean;
        user_id?: number | null;
    };
    departments: Department[];
    flash?: {
        success?: {
            message: string;
            id: number;
        };
        error?: string;
    };
    allGroups?: DepartmentValue[];
    totalDatabaseCount?: number;
    pagination?: {
        current_page: number;
        last_page: number;
        links: PaginationLink[];
        total: number;
    };
    filters?: {
        search?: string;
        department?: string;
        territory?: GlobalTerritoryKey;
    };
    [key: string]: any;
}

// Form shape for useForm<PhoneForm>. Without this export, `data` in the hook
// became `any`, and that caused the "implicitly has an 'any' type" errors.
// `territory` is TerritoryKey, not GlobalTerritoryKey: it is the upload target,
// and 'all' is not a valid target.
export interface PhoneForm {
    departments: Department[];
    territory: TerritoryKey;
    [key: string]: any; // satisfies Inertia's FormDataType constraint
}

export const PAGE_STYLE: React.CSSProperties = {
    fontFamily: '"Courier New", Courier, monospace',
    backgroundImage: `
        linear-gradient(#4d1a1a 1px, transparent 1px), linear-gradient(90deg, #4d1a1a 1px, transparent 1px),
        linear-gradient(#260d0d 1px, transparent 1px), linear-gradient(90deg, #260d0d 1px, transparent 1px),
        linear-gradient(#4d331a 1px, transparent 1px), linear-gradient(90deg, #4d331a 1px, transparent 1px),
        linear-gradient(#4d4d1a 1px, transparent 1px), linear-gradient(90deg, #4d4d1a 1px, transparent 1px),
        linear-gradient(#1a4d1a 1px, transparent 1px), linear-gradient(90deg, #1a4d1a 1px, transparent 1px),
        linear-gradient(#0d260d 1px, transparent 1px), linear-gradient(90deg, #0d260d 1px, transparent 1px),
        linear-gradient(#1a4d4d 1px, transparent 1px), linear-gradient(90deg, #1a4d4d 1px, transparent 1px),
        linear-gradient(#1a264d 1px, transparent 1px), linear-gradient(90deg, #1a264d 1px, transparent 1px),
        linear-gradient(#0d0d26 1px, transparent 1px), linear-gradient(90deg, #0d0d26 1px, transparent 1px),
        linear-gradient(#331a4d 1px, transparent 1px), linear-gradient(90deg, #331a4d 1px, transparent 1px),
        linear-gradient(#4d1a33 1px, transparent 1px), linear-gradient(90deg, #4d1a33 1px, transparent 1px)
    `,
    backgroundSize:
        '11rem 11rem, 11rem 11rem, 11rem 11rem, 11rem 11rem, 11rem 11rem, 11rem 11rem, 11rem 11rem, 11rem 11rem, 11rem 11rem, 11rem 11rem, 11rem 11rem',
    backgroundPosition: `
        0 0, 0 0,
        1.1rem 1.1rem, 1.1rem 1.1rem,
        2.2rem 2.2rem, 2.2rem 2.2rem,
        3.3rem 3.3rem, 3.3rem 3.3rem,
        4.4rem 4.4rem, 4.4rem 4.4rem,
        5.5rem 5.5rem, 5.5rem 5.5rem,
        6.6rem 6.6rem, 6.6rem 6.6rem,
        7.7rem 7.7rem, 7.7rem 7.7rem,
        8.8rem 8.8rem, 8.8rem 8.8rem,
        9.9rem 9.9rem, 9.9rem 9.9rem,
        1.1rem 0, 0 1.1rem
    `,
};

export type PickerColumn = 'isBoss' | 'isMiniBoss';
export type ActivePicker = { depKey: string | number; column: PickerColumn } | null;

export interface PhoneRecordDetails {
    person: string;
    phone: string;
    extension: string;
}

export type DeleteTarget = {
    route: string;
    departmentName: string;
    territory: string;
    message: string;
    phoneDetails?: PhoneRecordDetails;
} | null;

export interface DeleteConfirmModalProps {
    target: DeleteTarget;
    onClose: () => void;
}
