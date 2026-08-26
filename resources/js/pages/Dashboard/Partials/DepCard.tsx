import React from 'react';

interface PhoneRecord {
    id?: number;
    person: string;
    phone: string;
    extension: string;
    cabinet: string | null;
    ip: string | null;
    file_id: string;
    [key: string]: any;
}

interface Department {
    group: string;
    phones: PhoneRecord[];
}

interface DepCardProps {
    dep: Department;
    depIndex: number;
    isAuthenticated: boolean;
    onFieldChange: (depIndex: number, rowIndex: number, field: keyof PhoneRecord, value: string) => void;
}

export default function DepCard({ dep, depIndex, isAuthenticated, onFieldChange }: DepCardProps) {
    const phones = dep.phones || [];

    // Calculate maximum length of all names plus a safety buffer for padding/fonts
    const maxNameLen = Math.max(
        5, // Minimum length for "ФИО" header + padding
        ...phones.map((r) => (r.person || '').length)
    ) + 2;

    return (
        <div className="relative mb-12">
            {/* Outer Frame with White HUD Angles */}
            <div className="absolute -top-3 -right-3 w-[35px] h-[35px] border-4 border-white border-b-0 border-l-0 z-20 pointer-events-none" />
            <div className="absolute -bottom-3 -left-3 w-[35px] h-[35px] border-4 border-white border-t-0 border-r-0 z-20 pointer-events-none shadow-[-6px_6px_0px_rgba(0,0,0,0.4)]" />

            <div className="bg-[#f5f5f5] border border-[#ccc] shadow-[6px_6px_0px_rgba(0,0,0,0.4)] relative overflow-hidden text-[#111]">

                {/* Chess Pattern Header Bar (0.5rem size) */}
                <div
                    className="p-2 text-left relative z-20"
                    style={{
                        background: 'conic-gradient(#000 90deg, #666 90deg 180deg, #000 180deg 270deg, #666 270deg)',
                        backgroundSize: '0.5rem 0.5rem',
                    }}
                >
                    <div className="bg-[#f5f5f5] inline-block px-4 py-2 text-[1.35rem] font-bold border border-[#ccc]">
                        {dep.group}
                    </div>
                </div>

                {/* Table Container with Watermark Spanning Across Whole Table Background */}
                <div className="relative overflow-hidden">
                    {/* Repeating Watermark Layer: fewer items, bigger font, more spacing, more obscure */}
                    <div className="absolute inset-0 flex flex-wrap content-center justify-center items-center gap-32 z-0 pointer-events-none select-none -rotate-[30deg] opacity-15">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <span
                                key={i}
                                className="text-[5.5rem] font-black text-[#d6d6d6] uppercase whitespace-nowrap tracking-wider"
                                style={{ fontFamily: '"Courier New", Courier, monospace' }}
                            >
                                {dep.group || 'ОТДЕЛ'}
                            </span>
                        ))}
                    </div>

                    {/* Native HTML Table with Explicit Track Sizing */}
                    <table className="w-full border-collapse relative z-10 table-auto bg-transparent">
                        <thead>
                            <tr className="border-b border-[#ccc] bg-[#e5e5e5]/90 text-[1.1rem] text-[#333] font-bold">
                                <th
                                    className="border-r border-[#ccc] p-3 text-left whitespace-nowrap"
                                    style={{ width: `${maxNameLen}ch` }}
                                >
                                    ФИО
                                </th>
                                <th className="border-r border-[#ccc] p-3 text-left">Телефон</th>
                                <th className="border-r border-[#ccc] p-3 text-left">Добавочный</th>
                                <th className="border-r border-[#ccc] p-3 text-left">Кабинет</th>
                                <th className="p-3 text-left">IP</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#ccc]/50">
                            {phones.map((row, rowIndex) => {
                                const rowBg = 'bg-transparent';

                                return (
                                    <tr key={row.id ?? rowIndex} className={`${rowBg} transition-colors hover:bg-white/40`}>
                                        {/* Column 1: ФИО */}
                                        <td
                                            className="border-r border-[#ccc] p-3 whitespace-nowrap overflow-hidden"
                                            style={{ width: `${maxNameLen}ch` }}
                                        >
                                            <input
                                                type="text"
                                                readOnly
                                                className="text-[1.15rem] border-0 bg-transparent p-[0.3rem] outline-none text-black cursor-default block"
                                                style={{
                                                    fontFamily: '"Courier New", Courier, monospace',
                                                    width: `${maxNameLen}ch`
                                                }}
                                                value={row?.person || ''}
                                            />
                                        </td>
                                        {/* Column 2: Телефон */}
                                        <td className="border-r border-[#ccc] p-3">
                                            <input
                                                type="text"
                                                readOnly
                                                className="text-[1.15rem] border-0 bg-transparent p-[0.3rem] outline-none text-black cursor-default w-full"
                                                style={{ fontFamily: '"Courier New", Courier, monospace' }}
                                                value={row?.phone || ''}
                                            />
                                        </td>
                                        {/* Column 3: Добавочный */}
                                        <td className="border-r border-[#ccc] p-3">
                                            <input
                                                type="text"
                                                readOnly
                                                className="text-[1.15rem] w-full border-0 bg-transparent p-[0.3rem] outline-none text-black box-border cursor-default"
                                                style={{ fontFamily: '"Courier New", Courier, monospace' }}
                                                value={row?.extension || ''}
                                            />
                                        </td>
                                        {/* Column 4: Кабинет (Editable) */}
                                        <td className="border-r border-[#ccc] p-3">
                                            <input
                                                type="text"
                                                readOnly={!isAuthenticated}
                                                onChange={(e) => onFieldChange(depIndex, rowIndex, 'cabinet', e.target.value)}
                                                className={`text-[1.15rem] w-full border-0 bg-transparent p-[0.3rem] outline-none text-black box-border ${isAuthenticated
                                                    ? 'border-b border-[#999] focus:border-[#000]'
                                                    : 'cursor-default'
                                                    }`}
                                                style={{ fontFamily: '"Courier New", Courier, monospace' }}
                                                value={row?.cabinet ?? ''}
                                            />
                                        </td>
                                        {/* Column 5: IP (Editable) */}
                                        <td className="p-3">
                                            <input
                                                type="text"
                                                readOnly={!isAuthenticated}
                                                onChange={(e) => onFieldChange(depIndex, rowIndex, 'ip', e.target.value)}
                                                className={`text-[1.15rem] w-full border-0 bg-transparent p-[0.3rem] outline-none text-black box-border ${isAuthenticated
                                                    ? 'border-b border-[#999] focus:border-[#000]'
                                                    : 'cursor-default'
                                                    }`}
                                                style={{ fontFamily: '"Courier New", Courier, monospace' }}
                                                value={row?.ip ?? ''}
                                            />
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}