import { DepartmentOption } from "../../types";

export interface DepartmentValue {
    id: number,
    number: string;
    name: string;
    territory: string;
}

export interface Option {
    label: string;
    value: DepartmentValue;
}

export interface DepartmentDropdownProps {
    options: DepartmentOption[];
    selectedOption: string;
    onSelect: (option: DepartmentOption) => void;
    onSearch?: (query: string) => Promise<Option[]> | void;
}