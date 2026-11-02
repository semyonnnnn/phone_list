import React, { useState, useRef, useEffect } from 'react';

interface DepartmentValue {
    number: string;
    name: string;
}

interface Option {
    label: string;
    value: DepartmentValue;
}

interface DepartmentDropdownProps {
    options: Option[];
    selectedOption: string;
    onSelect: (option: Option) => void;
    onSearch?: (query: string) => Promise<Option[]> | void;
}

export default function DepartmentDropdown({
    options,
    selectedOption,
    onSelect,
}: DepartmentDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [dynamicOptions, setDynamicOptions] = useState<Option[]>(options);

    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Keep internal options synchronized if props update
    useEffect(() => {
        setDynamicOptions(options);
    }, [options]);

    // Filter options locally and immediately whenever searchQuery or isOpen changes
    useEffect(() => {
        if (!isOpen) {
            setDynamicOptions(options);
            return;
        }

        if (!searchQuery.trim()) {
            setDynamicOptions(options);
        } else {
            setDynamicOptions(
                options.filter((opt) =>
                    opt.label.toLowerCase().includes(searchQuery.toLowerCase())
                )
            );
        }
    }, [searchQuery, isOpen, options]);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSearchQuery('');
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative w-[300px] z-50" ref={dropdownRef}>
            {/* Main Trigger as a Black Search Input */}
            <div
                className="relative flex items-center border border-black cursor-pointer bg-black"
                style={{ fontFamily: '"Courier New", Courier, monospace' }}
                onClick={() => {
                    if (!isOpen) {
                        setIsOpen(true);
                        inputRef.current?.focus();
                    }
                }}
            >
                <input
                    ref={inputRef}
                    type="text"
                    value={isOpen ? searchQuery : selectedOption}
                    onChange={(e) => {
                        setSearchQuery(e.target.value);
                        if (!isOpen) setIsOpen(true);
                    }}
                    onFocus={() => {
                        setIsOpen(true);
                        setSearchQuery('');
                    }}
                    placeholder="Все отделы..."
                    className="w-full text-[1.15rem] p-2 pr-8 bg-transparent text-[#f5f5f5] outline-none cursor-pointer placeholder-[#aaa]"
                    style={{ fontFamily: '"Courier New", Courier, monospace' }}
                />
                <span
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsOpen(!isOpen);
                        if (!isOpen) {
                            setSearchQuery('');
                            inputRef.current?.focus();
                        }
                    }}
                    className={`absolute right-2 text-white transition-transform duration-200 text-sm select-none ${isOpen ? 'rotate-180' : ''}`}
                >
                    ▼
                </span>
            </div>

            {/* Dropdown Menu */}
            {isOpen && (
                <div
                    className="absolute left-0 right-0 mt-1 border border-black shadow-[4px_4px_0px_rgba(0,0,0,0.4)] z-50 max-h-[80vh] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-[#1c1c1c] [&::-webkit-scrollbar-thumb]:bg-[#666]"
                    style={{
                        background: '#1c1c1c',
                        fontFamily: '"Courier New", Courier, monospace',
                    }}
                >
                    {dynamicOptions.length > 0 ? (
                        dynamicOptions.map((opt, idx) => (
                            <div
                                key={idx}
                                onClick={() => {
                                    onSelect(opt);
                                    setIsOpen(false);
                                    setSearchQuery('');
                                }}
                                className="p-2.5 text-[1.15rem] cursor-pointer border-b border-[#333] last:border-b-0 text-[#f5f5f5] hover:bg-[#666] hover:text-white transition-colors"
                            >
                                {opt.label}
                            </div>
                        ))
                    ) : (
                        <div className="p-3 text-[1rem] text-[#888] text-center">
                            Ничего не найдено
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}