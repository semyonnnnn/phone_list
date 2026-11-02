export interface DepartmentValue {
    number: string;
    name: string;
}

export interface Option {
    label: string;
    value: DepartmentValue;
}

export interface DepartmentDropdownProps {
    options: Option[];
    selectedOption: string;
    onSelect: (option: Option) => void;
    onSearch?: (query: string) => Promise<Option[]> | void;
}