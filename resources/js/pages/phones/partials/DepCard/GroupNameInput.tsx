import { useEffect, useRef, useState } from "react";
import { GroupNameInputProps } from "./types";

const MAX_VISIBLE = 50;

export function GroupNameInput({ value, onCommit, onKeyDown, onBlur }: GroupNameInputProps) {
    const [local, setLocal] = useState(value ?? '');
    // Last value we sent to the parent. Comparing against this (not against `local`)
    // is what tells our own echo apart from a real outside change.
    const lastSent = useRef(value ?? '');
    const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    // Pull from the parent only when it changed to something we did NOT send
    // (Cancel, a save, new server data). If we synced on every `value` change,
    // the echo of an older keystroke could overwrite what you typed since.
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
        if (next === lastSent.current) return; // nothing new to tell the parent
        lastSent.current = next;
        onCommit(next);
    };

    return (
        <div className="inline-grid">
            {/* Hidden mirror span: the input grows with the text. It reads `local`,
                not the prop, so the width follows your typing instantly. */}
            <span
                aria-hidden="true"
                className="invisible whitespace-pre col-start-1 row-start-1 font-bold text-[1.35rem]"
            >
                {local.slice(0, MAX_VISIBLE) || ' '}{' '}
            </span>
            <input
                className="col-start-1 row-start-1 w-full min-w-0 bg-transparent outline-none font-bold text-[1.35rem] text-inherit p-0"
                type="text"
                value={local}
                onChange={(e) => {
                    const next = e.target.value;
                    setLocal(next); // instant: only this tiny component re-renders
                    clearTimeout(timer.current);
                    timer.current = setTimeout(() => commit(next), 300);
                }}
                onKeyDown={onKeyDown}
                onBlur={(e) => {
                    commit(local); // flush right away so leaving the field never loses an edit
                    onBlur?.(e);
                }}
            />
        </div>
    );
}