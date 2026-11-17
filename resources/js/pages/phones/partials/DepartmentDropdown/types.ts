import { DepartmentOption } from '../../types';

export interface DepartmentValue {
    id: number;
    name: string;
    territory: string;
}

export interface Option {
    label: string;
    value: DepartmentValue;
}

export interface DepartmentDropdownProps {
    isAuthenticated: boolean;
    options: DepartmentOption[];
    selectedOption: string;
    onSelect: (option: DepartmentOption) => void;
    onSearch?: (query: string) => Promise<Option[]> | void;
    onAddDepartmentClick: () => void;
}
