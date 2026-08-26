import React, { useState, useRef } from 'react';
import { Link, router } from '@inertiajs/react';
import DepartmentDropdown from '../pages/Dashboard/Partials/DepartmentDropdown';

interface DepartmentValue {
    number: string;
    name: string;
}

interface DepartmentOption {
    label: string;
    value: DepartmentValue;
}

interface HeaderProps {
    isAuthenticated: boolean;
    options?: DepartmentOption[];
}

export default function Header({ isAuthenticated, options = [] }: HeaderProps) {
    const [selectedOption, setSelectedOption] = useState('Все отделы');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        router.post(route('files.upload'), formData, {
            forceFormData: true,
            onSuccess: () => {
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            },
        });
    };

    return (
        <div
            className="p-5 border border-[#ccc] flex justify-between items-center mb-14 shadow-[6px_6px_0px_rgba(0,0,0,0.4)] relative z-40"
            style={{
                background: 'conic-gradient(#000 90deg, #666 90deg 180deg, #000 180deg 270deg, #666 270deg)',
                backgroundSize: '0.5rem 0.5rem',
            }}
        >
            {/* Left Absolute Light Gray Gradient Overlay */}
            <div
                className="absolute inset-y-0 left-0 w-[45%] z-0 pointer-events-none"
                style={{
                    background: 'linear-gradient(to right, #f5f5f5 0%, rgba(245, 245, 245, 0.8) 70%, transparent 100%)',
                }}
            />

            {/* Hidden File Input for Excel Upload */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".xlsx, .xls"
                className="hidden"
            />

            {/* Left Side: Search & Department Dropdown grouped together */}
            <div className="relative z-10 flex items-center gap-5">
                <input
                    type="text"
                    className="text-[1.15rem] p-2 border-0 border-b border-[#999] w-[300px] outline-none bg-transparent focus:border-[#000]"
                    style={{ fontFamily: '"Courier New", Courier, monospace' }}
                    placeholder="Поиск по ФИО..."
                />

                <DepartmentDropdown
                    options={options}
                    selectedOption={selectedOption}
                    onSelect={(opt: DepartmentOption) => setSelectedOption(opt.label)}
                />
            </div>

            {/* Right Side: Action Buttons / Authentication */}
            <div className="relative z-10 flex items-center gap-2">
                {isAuthenticated ? (
                    <>
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="text-[1.15rem] px-5 py-2 bg-black text-[#f5f5f5] border border-black cursor-pointer font-bold hover:bg-[#222]"
                            style={{ fontFamily: '"Courier New", Courier, monospace' }}
                        >
                            Загрузить
                        </button>
                        <button
                            type="button"
                            className="text-[1.15rem] px-5 py-2 bg-[#e5e5e5] text-[#000] border border-black cursor-pointer font-bold hover:bg-[#d5d5d5] mr-4"
                            style={{ fontFamily: '"Courier New", Courier, monospace' }}
                        >
                            Скачать
                        </button>
                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            className="inline-block text-[1.15rem] px-7 py-2 bg-[#333] text-white border border-black cursor-pointer font-bold hover:bg-[#444] transition-colors text-center no-underline"
                            style={{
                                fontFamily: '"Courier New", Courier, monospace',
                                clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))'
                            }}
                        >
                            Выйти
                        </Link>
                    </>
                ) : (
                    <Link
                        href={route('login')}
                        className="inline-block text-[1.15rem] px-7 py-2 bg-black text-[#f5f5f5] cursor-pointer font-bold hover:bg-[#222] transition-colors text-center no-underline"
                        style={{
                            fontFamily: '"Courier New", Courier, monospace',
                            clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))'
                        }}
                    >
                        Войти
                    </Link>
                )}
            </div>
        </div>
    );
}