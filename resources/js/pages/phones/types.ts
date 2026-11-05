import { DepartmentGroup } from './partials/DepCard/types';
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

export interface DepartmentValue {
    number: string;
    name: string;
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
    departments: Array<{
        group: DepartmentGroup;          // was: group: string
        phones: PhoneRecord[];
    }>;
    territories: [string, string];       // NEW: the two options, sent by the backend
    flash?: {
        success?: {
            message: string;
            id: number;
        };
        error?: string;
    };
    allGroups?: string[];
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
    };
    [key: string]: any;
}