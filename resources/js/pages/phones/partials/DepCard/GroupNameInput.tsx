import { useEffect, useRef, useState } from "react";
import { GroupNameInputProps } from "./types";

type Props = Omit<GroupNameInputProps, 'departmentNameWidth'>;

export function GroupNameInput({ value, onCommit, onKeyDown, onBlur }: Props) {
    const [local, setLocal] = useState(value ?? '');

    // Last value sent to the parent. This distinguishes our own updates
    // from external changes such as Cancel or new server data.
    const lastSent = useRef(value ?? '');
    const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    // Pull external changes without overwriting newer local typing.
    useEffect(() => {
        const incoming = value ?? '';

        if (incoming !== lastSent.current) {
            lastSent.current = incoming;
            setLocal(incoming);
        }
    }, [value]);

    // Don't fire a stale timer after unmount.
    useEffect(() => () => clearTimeout(timer.current), []);

    const commit = (next: string) => {
        clearTimeout(timer.current);

        if (next === lastSent.current) return;

        lastSent.current = next;
        onCommit(next);
    };

    return (
        <input
            className="flex-1 min-w-0 w-full bg-transparent outline-none font-bold text-[1.35rem] text-inherit p-0"
            type="text"
            value={local}
            onChange={(e) => {
                const next = e.target.value;
                setLocal(next);

                clearTimeout(timer.current);
                timer.current = setTimeout(() => commit(next), 300);
            }}
            onKeyDown={onKeyDown}
            onBlur={(e) => {
                commit(local);
                onBlur?.(e);
            }}
        />
    );
}
