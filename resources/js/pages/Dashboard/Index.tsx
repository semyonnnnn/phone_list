import React, { useState, useRef, useEffect } from 'react';
import { Head, usePage, useForm, router, Link } from '@inertiajs/react';
import DepCard from './Partials/DepCard';
import DepartmentDropdown from './Partials/DepartmentDropdown';

export interface PhoneRecord {
    id?: number;
    person: string;
    phone: string;
    extension: string;
    cabinet: string | null;
    ip: string | null;
    file_id: string;
    [key: string]: any;
}

interface DepartmentValue {
    number: string;
    name: string;
}

interface DepartmentOption {
    label: string;
    value: DepartmentValue;
}

export default function Index() {
    const { auth, departments } = usePage().props as unknown as {
        auth: { is_authenticated: boolean; user_id?: number | null };
        departments?: Array<{ group: string; phones: PhoneRecord[] }>;
    };

    const initialDeps = departments && departments.length > 0 ? departments : [];
    const [originalDeps, setOriginalDeps] = useState(initialDeps);
    const [selectedOption, setSelectedOption] = useState('Все отделы');
    const [searchQuery, setSearchQuery] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data, setData, processing } = useForm({
        departments: initialDeps,
    });

    // Synchronize form state if props update post-hydration
    useEffect(() => {
        if (departments && departments.length > 0) {
            setData('departments', departments);
            setOriginalDeps(JSON.parse(JSON.stringify(departments)));
        }
    }, [departments]);

    const hasChanges = JSON.stringify(data.departments) !== JSON.stringify(originalDeps);

    const handleFieldChangeByIndices = (depIndex: number, rowIndex: number, field: keyof PhoneRecord, value: string) => {
        const updatedDeps = [...data.departments];
        const updatedPhones = [...updatedDeps[depIndex].phones];
        updatedPhones[rowIndex] = {
            ...updatedPhones[rowIndex],
            [field]: value,
        };
        updatedDeps[depIndex] = {
            ...updatedDeps[depIndex],
            phones: updatedPhones,
        };
        setData('departments', updatedDeps);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        router.put(route('phones.update'), data, {
            onSuccess: () => {
                setOriginalDeps(JSON.parse(JSON.stringify(data.departments)));
            },
        });
    };

    const handleCancel = () => {
        setData('departments', JSON.parse(JSON.stringify(originalDeps)));
    };

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

    const dropdownOptions: DepartmentOption[] = [
        { label: 'Все отделы', value: { number: '', name: '' } },
        ...initialDeps.map((dep, i) => ({
            label: dep.group,
            value: { number: String(i), name: dep.group }
        }))
    ];

    const filteredDepartments = data.departments.filter((dep) => {
        if (selectedOption === 'Все отделы') return true;
        return dep.group === selectedOption;
    });

    const searchResults = searchQuery.trim() === '' ? [] : data.departments.flatMap((dep, depIndex) =>
        dep.phones
            .map((phone, rowIndex) => ({ phone, depIndex, rowIndex, groupName: dep.group }))
            .filter(({ phone }) =>
                phone.person.toLowerCase().includes(searchQuery.toLowerCase())
            )
    );

    const getResultWord = (count: number) => {
        const mod10 = count % 10;
        const mod100 = count % 100;
        if (mod100 >= 11 && mod100 <= 19) return 'результатов';
        if (mod10 === 1) return 'результат';
        if (mod10 >= 2 && mod10 <= 4) return 'результата';
        return 'результатов';
    };

    return (
        <div
            className="min-h-screen text-[#111] p-16 min-w-[1200px] text-[1.15rem] bg-[#000000]"
            style={{
                fontFamily: '"Courier New", Courier, monospace',
                backgroundImage: `
                    linear-gradient(#4d1a1a 1px, transparent 1px), linear-gradient(90deg, #4d1a1a 1px, transparent 1px),
                    linear-gradient(#260d0d 1px, transparent 1px), linear-gradient(90deg, #260d0d 1px, transparent 1px),
                    linear-gradient(#4d331a 1px, transparent 1px), linear-gradient(90deg, #4d331a 1px, transparent 1px),
                    linear-gradient(#4d4d1a 1px, transparent 1px), linear-gradient(90deg, #4d4d1a 1px, transparent 1px),
                    linear-gradient(#1a4d1a 1px, transparent 1px), linear-gradient(90deg, #1a4d1a 1px, transparent 1px),
                    linear-gradient(#0d260d 1px, transparent 1px), linear-gradient(90deg, #0d260d 1px, transparent 1px),
                    linear-gradient(#1a4d4d 1px, transparent 1px), linear-gradient(90deg, #1a4d4d 1px, transparent 1px),
                    linear-gradient(#1a264d 1px, transparent 1px), linear-gradient(90deg, #1a264d 1px, transparent 1px),
                    linear-gradient(#0d0d26 1px, transparent 1px), linear-gradient(90deg, #0d0d26 1px, transparent 1px),
                    linear-gradient(#331a4d 1px, transparent 1px), linear-gradient(90deg, #331a4d 1px, transparent 1px),
                    linear-gradient(#4d1a33 1px, transparent 1px), linear-gradient(90deg, #4d1a33 1px, transparent 1px)
                `,
                backgroundSize: '11rem 11rem, 11rem 11rem, 11rem 11rem, 11rem 11rem, 11rem 11rem, 11rem 11rem, 11rem 11rem, 11rem 11rem, 11rem 11rem, 11rem 11rem, 11rem 11rem',
                backgroundPosition: `
                    0 0, 0 0,
                    1.1rem 1.1rem, 1.1rem 1.1rem,
                    2.2rem 2.2rem, 2.2rem 2.2rem,
                    3.3rem 3.3rem, 3.3rem 3.3rem,
                    4.4rem 4.4rem, 4.4rem 4.4rem,
                    5.5rem 5.5rem, 5.5rem 5.5rem,
                    6.6rem 6.6rem, 6.6rem 6.6rem,
                    7.7rem 7.7rem, 7.7rem 7.7rem,
                    8.8rem 8.8rem, 8.8rem 8.8rem,
                    9.9rem 9.9rem, 9.9rem 9.9rem,
                    1.1rem 0, 0 1.1rem
                `
            }}
        >
            <Head title="Справочник" />

            {/* Hidden File Input for Excel Upload */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".xlsx, .xls"
                className="hidden"
            />

            {/* Embedded Header Bar */}
            <div
                className="p-5 border border-[#ccc] flex justify-between items-center mb-14 shadow-[6px_6px_0px_rgba(0,0,0,0.4)] relative z-40"
                style={{
                    background: 'conic-gradient(#000 90deg, #666 90deg 180deg, #000 180deg 270deg, #666 270deg)',
                    backgroundSize: '0.5rem 0.5rem',
                }}
            >
                <div
                    className="absolute inset-y-0 left-0 w-[45%] z-0 pointer-events-none"
                    style={{
                        background: 'linear-gradient(to right, #f5f5f5 0%, rgba(245, 245, 245, 0.8) 70%, transparent 100%)',
                    }}
                />

                <div className="relative z-10 flex items-center gap-5">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="text-[1.15rem] p-2 border-0 border-b border-[#999] w-[300px] outline-none bg-transparent focus:border-[#000]"
                        style={{ fontFamily: '"Courier New", Courier, monospace' }}
                        placeholder="Поиск по ФИО..."
                    />

                    <DepartmentDropdown
                        options={dropdownOptions}
                        selectedOption={selectedOption}
                        onSelect={(opt) => setSelectedOption(opt.label)}
                    />
                </div>

                <div className="relative z-10 flex items-center gap-2">
                    {auth.is_authenticated ? (
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
                                onClick={() => router.post(route('files.download'))}
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

            {/* Dynamic Content Container */}
            <main className="mt-12 space-y-12">
                {/* Disclaimer / Empty State Notification */}
                {data.departments.length === 0 ? (
                    <div className="border-2 border-[#888] p-8 text-center bg-black/90 shadow-[6px_6px_0px_rgba(255,255,255,0.15)] text-[#f0f0f0]">
                        <div className="text-[1.25rem] font-bold tracking-wider uppercase mb-2 text-[#ffcc00]">
                            [!]  Справочник пуст!
                        </div>
                        <div className="text-[1.1rem] text-[#aaa]">
                            Загрузите файл через панель администратора!
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Search Results Dynamic Block with Slow, Subtle CRT Scanline */}
                        {searchQuery.trim() !== '' && (
                            <div
                                className="border-2 border-[#888] p-6 shadow-[6px_6px_0px_rgba(255,255,255,0.15)] relative overflow-hidden"
                                style={{
                                    backgroundImage: `
                                        radial-gradient(circle at 50% 50%, rgba(100, 100, 100, 0.25) 0%, transparent 70%),
                                        repeating-radial-gradient(circle at 50% 50%, #111 0, #111 2px, #222 3px, #444 4px, #111 5px)
                                    `,
                                    backgroundSize: '4px 4px, 2px 2px',
                                    backgroundColor: '#0a0a0a',
                                    fontFamily: '"Courier New", Courier, monospace',
                                }}
                            >
                                {/* Slow CRT Scanline Beam */}
                                <div
                                    className="absolute inset-y-0 w-[1px] bg-white pointer-events-none z-0 shadow-[0_0_6px_rgba(255,255,255,0.4)]"
                                    style={{
                                        animation: 'crt-sweep 10s ease-in-out infinite alternate, crt-flash 6s ease-in-out infinite'
                                    }}
                                />

                                <style>{`
                                    @keyframes crt-sweep {
                                        0% { left: 40%; }
                                        100% { left: 98%; }
                                    }
                                    @keyframes crt-flash {
                                        0%, 90%, 100% { opacity: 0.03; }
                                        93%, 95% { opacity: 0.45; }
                                    }
                                `}</style>

                                <div className="relative z-10 text-[1.1rem] font-bold text-[#f0f0f0] mb-4 border-b border-[#666]/40 pb-2 uppercase tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                                    Результаты поиска: [ {searchQuery} ] &nbsp;[ _ {searchResults.length} {getResultWord(searchResults.length)} _ ]
                                </div>

                                <div className="relative z-10">
                                    {searchResults.length === 0 ? (
                                        <div className="text-[#aaa] italic py-4 bg-black/80 p-4 border border-[#555]/30">Сотрудников не найдено.</div>
                                    ) : (
                                        <DepCard
                                            dep={{
                                                group: 'Найденные совпадения',
                                                phones: searchResults.map(r => r.phone)
                                            }}
                                            depIndex={0}
                                            isAuthenticated={auth.is_authenticated}
                                            onFieldChange={(_, searchRowIndex, field, value) => {
                                                const target = searchResults[searchRowIndex];
                                                handleFieldChangeByIndices(target.depIndex, target.rowIndex, field, value);
                                            }}
                                        />
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Standard Department Cards (Filtered by Dropdown) */}
                        <div className="space-y-8">
                            {filteredDepartments.map((dep) => {
                                const realDepIndex = data.departments.findIndex(d => d.group === dep.group);
                                return (
                                    <DepCard
                                        key={realDepIndex}
                                        dep={dep}
                                        depIndex={realDepIndex}
                                        isAuthenticated={auth.is_authenticated}
                                        onFieldChange={handleFieldChangeByIndices}
                                    />
                                );
                            })}
                        </div>
                    </>
                )}
            </main>

            {/* Floating Action Window */}
            {hasChanges && auth.is_authenticated && (
                <div
                    className="fixed bottom-6 left-6 z-50 bg-[#222] text-white border-2 border-white p-4 shadow-[6px_6px_0px_rgba(0,0,0,0.6)] flex flex-col gap-3"
                    style={{ fontFamily: '"Courier New", Courier, monospace' }}
                >
                    <div className="text-[0.95rem] tracking-wide text-[#ccc]">
                        [!] ИЗМЕНЕНИЯ НЕ СОХРАНЕНЫ
                    </div>
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="bg-[#555] hover:bg-[#666] text-white px-4 py-2 text-[1rem] border border-white transition-colors cursor-pointer"
                        >
                            Отмена
                        </button>
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={processing}
                            className="bg-white hover:bg-[#e0e0e0] text-black font-bold px-4 py-2 text-[1rem] border border-white transition-colors cursor-pointer disabled:opacity-50"
                        >
                            {processing ? 'Сохранение...' : 'Сохранить'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}