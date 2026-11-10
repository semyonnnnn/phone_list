import { DepartmentGroup } from './partials/DepCard/types';
import { DepartmentValue } from './partials/DepartmentDropdown/types';
import { GlobalTerritoryKey, TerritoryKey } from "@/types";

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