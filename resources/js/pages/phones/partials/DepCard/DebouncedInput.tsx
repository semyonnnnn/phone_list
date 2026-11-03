import { useEffect, useState } from "react";
//////////////////////////////////////////////////
import { DebouncedInputProps } from "./types";

export function DebouncedInput({ value, onChange, readOnly, className }: DebouncedInputProps) {
    const [localValue, setLocalValue] = useState(value ?? '');

    // Keep local state in sync if parent resets (e.g. Cancel button)
    useEffect(() => {
        setLocalValue(value ?? '');
    }, [value]);

    // Debounce the update to parent state
    useEffect(() => {
        // Skip if the value hasn't actually changed from the parent prop
        if (localValue === (value ?? '')) return;

        const timer = setTimeout(() => {
            onChange(localValue);
        }, 300);

        return () => clearTimeout(timer);
    }, [localValue]);

    if (readOnly) {
        return <input type="text" readOnly className={className} value={value ?? ''} />;
    }

    return (
        <input
            type="text"
            className={className}
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)} // Instant typing response
        />
    );
}