import { useState, useRef, useEffect } from 'react';
import { Option } from './types';

export function useDepartmentDropdown(
    options: Option[],
    onSelect: (option: Option) => void
) {
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

    const handleTriggerClick = () => {
        if (!isOpen) {
            setIsOpen(true);
            inputRef.current?.focus();
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        if (!isOpen) setIsOpen(true);
    };

    const handleInputFocus = () => {
        setIsOpen(true);
        setSearchQuery('');
    };

    const handleArrowClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsOpen(!isOpen);
        if (!isOpen) {
            setSearchQuery('');
            inputRef.current?.focus();
        }
    };

    const handleOptionClick = (opt: Option) => {
        onSelect(opt);
        setIsOpen(false);
        setSearchQuery('');
    };

    return {
        isOpen,
        searchQuery,
        dynamicOptions,
        dropdownRef,
        inputRef,
        handleTriggerClick,
        handleInputChange,
        handleInputFocus,
        handleArrowClick,
        handleOptionClick,
    };
}