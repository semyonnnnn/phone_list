import React from 'react';
import { Head, usePage } from '@inertiajs/react';
import Header from './Partials/Header';

export default function Index() {
    const { auth } = usePage().props as unknown as {
        auth: { is_authenticated: boolean }
    };

    console.log(auth);
    const rows = [
        { name: 'Дзекунскас Владислав Станиславович', phone: '371-22-23', ext: '101', room: '417', ip: '66010' },
        { name: 'Пугин Константин Владимирович', phone: '371-22-23', ext: '105', room: '409', ip: '66030' },
        { name: 'Иванов Алексей Петрович', phone: '371-22-24', ext: '102', room: '411', ip: '66012' },
        { name: 'Смирнова Елена Сергеевна', phone: '371-22-25', ext: '103', room: '412', ip: '66014' },
        { name: 'Кузнецов Дмитрий Олегович', phone: '371-22-26', ext: '104', room: '413', ip: '66016' },
        { name: 'Васильева Ольга Николаевна', phone: '371-22-27', ext: '106', room: '414', ip: '66018' },
        { name: 'Попов Сергей Викторович', phone: '371-22-28', ext: '107', room: '415', ip: '66020' },
        { name: 'Соколова Анна Михайловна', phone: '371-22-29', ext: '108', room: '416', ip: '66022' },
        { name: 'Михайлов Павел Андреевич', phone: '371-22-30', ext: '109', room: '418', ip: '66024' },
        { name: 'Федорова Татьяна Игоревна', phone: '371-22-31', ext: '110', room: '419', ip: '66026' },
    ];

    return (
        <div
            className="min-h-screen text-[#111] p-16 min-w-[1200px] text-[1.15rem] bg-[#333333] bg-[linear-gradient(#000000_1px,transparent_1px),linear-gradient(90deg,#000000_1px,transparent_1px)] bg-[size:1.5rem_1.5rem]"
            style={{ fontFamily: '"Courier New", Courier, monospace' }}
        >
            <Head title="Справочник - Руководство" />

            {/* Extracted Header Component */}
            <Header isAuthenticated={auth.is_authenticated} />

            {/* Outer Frame with White HUD Angles */}
            <div className="relative mb-12">
                <div className="absolute -top-3 -right-3 w-[35px] h-[35px] border-4 border-white border-b-0 border-l-0 z-20 pointer-events-none" />
                <div className="absolute -bottom-3 -left-3 w-[35px] h-[35px] border-4 border-white border-t-0 border-r-0 z-20 pointer-events-none shadow-[-6px_6px_0px_rgba(0,0,0,0.4)]" />

                <div className="bg-[#f5f5f5] border border-[#ccc] shadow-[6px_6px_0px_rgba(0,0,0,0.4)] relative overflow-hidden">

                    {/* Repeating Watermark Layer */}
                    <div className="absolute -top-1/2 -left-[20%] w-[150%] h-[200%] flex flex-wrap justify-center items-center gap-8 z-0 pointer-events-none select-none -rotate-[30deg]">
                        {Array.from({ length: 12 }).map((_, i) => (
                            <span
                                key={i}
                                className="text-[3.5rem] font-bold text-[#ebebeb] uppercase whitespace-nowrap"
                                style={{ fontFamily: '"Courier New", Courier, monospace' }}
                            >
                                РУКОВОДСТВО
                            </span>
                        ))}
                    </div>

                    {/* Chess Pattern Header Bar */}
                    <div
                        className="p-2 text-left relative z-20"
                        style={{
                            background: 'conic-gradient(#000 90deg, #666 90deg 180deg, #000 180deg 270deg, #666 270deg)',
                            backgroundSize: '0.5rem 0.5rem',
                        }}
                    >
                        <div className="bg-[#f5f5f5] inline-block px-4 py-2 text-[1.35rem] font-bold border border-[#ccc]">
                            Руководство
                        </div>
                    </div>

                    {/* Data Table */}
                    <table className="w-full border-collapse relative z-10">
                        <thead>
                            <tr>
                                <th className="border border-[#ccc] p-3 text-left bg-[#e5e5e5] text-[1.1rem] text-[#333]">ФИО</th>
                                <th className="border border-[#ccc] p-3 text-left bg-[#e5e5e5] text-[1.1rem] text-[#333]">Телефон</th>
                                <th className="border border-[#ccc] p-3 text-left bg-[#e5e5e5] text-[1.1rem] text-[#333]">Добавочный</th>
                                <th className="border border-[#ccc] p-3 text-left bg-[#e5e5e5] text-[1.1rem] text-[#333]">Кабинет</th>
                                <th className="border border-[#ccc] p-3 text-left bg-[#e5e5e5] text-[1.1rem] text-[#333]">IP</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#ccc]">
                            {rows.map((row, index) => {
                                const rowBg = index % 2 === 0 ? 'bg-[#f5f5f5]' : 'bg-[#efefef]';

                                return (
                                    <tr key={index} className={`${rowBg} transition-colors`}>
                                        {/* Column 1: ФИО (Fit Content Width via inline-block input) */}
                                        <td className="border border-[#ccc] p-3 text-left">
                                            <input
                                                type="text"
                                                readOnly
                                                className="text-[1.15rem] border-0 bg-transparent p-[0.3rem] outline-none text-black cursor-default"
                                                style={{
                                                    fontFamily: '"Courier New", Courier, monospace',
                                                    width: `${row.name.length + 2}ch`
                                                }}
                                                defaultValue={row.name}
                                            />
                                        </td>
                                        {/* Column 2: Телефон (Fit Content Width via inline-block input) */}
                                        <td className="border border-[#ccc] p-3 text-left">
                                            <input
                                                type="text"
                                                readOnly
                                                className="text-[1.15rem] border-0 bg-transparent p-[0.3rem] outline-none text-black cursor-default"
                                                style={{
                                                    fontFamily: '"Courier New", Courier, monospace',
                                                    width: `${row.phone.length + 2}ch`
                                                }}
                                                defaultValue={row.phone}
                                            />
                                        </td>
                                        {/* Uneditable Column 3: Добавочный */}
                                        <td className="border border-[#ccc] p-3 text-left">
                                            <input
                                                type="text"
                                                readOnly
                                                className="text-[1.15rem] w-full border-0 bg-transparent p-[0.3rem] outline-none text-black box-border cursor-default"
                                                style={{ fontFamily: '"Courier New", Courier, monospace' }}
                                                defaultValue={row.ext}
                                            />
                                        </td>
                                        {/* Column 4: Кабинет (Editable only if authenticated) */}
                                        <td className="border border-[#ccc] p-3 text-left">
                                            <input
                                                type="text"
                                                readOnly={!auth.is_authenticated}
                                                className={`text-[1.15rem] w-full border-0 bg-transparent p-[0.3rem] outline-none text-black box-border ${auth.is_authenticated
                                                    ? 'border-b border-[#999] focus:border-[#000]'
                                                    : 'cursor-default'
                                                    }`}
                                                style={{ fontFamily: '"Courier New", Courier, monospace' }}
                                                defaultValue={row.room}
                                            />
                                        </td>
                                        {/* Column 5: IP (Editable only if authenticated) */}
                                        <td className="border border-[#ccc] p-3 text-left">
                                            <input
                                                type="text"
                                                readOnly={!auth.is_authenticated}
                                                className={`text-[1.15rem] w-full border-0 bg-transparent p-[0.3rem] outline-none text-black box-border ${auth.is_authenticated
                                                    ? 'border-b border-[#999] focus:border-[#000]'
                                                    : 'cursor-default'
                                                    }`}
                                                style={{ fontFamily: '"Courier New", Courier, monospace' }}
                                                defaultValue={row.ip}
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