import React, { useState, useRef, useEffect, useMemo } from 'react';
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
    is_boss?: boolean;      // Or your exact schema key for 'нач'
    is_miniboss?: boolean;  // Or your exact schema key for 'зам'
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

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PageProps {
    auth: { is_authenticated: boolean; user_id?: number | null };
    departments?: Array<{ group: string; phones: PhoneRecord[] }>;
    allGroups?: string[];
    totalDatabaseCount?: number;
    pagination?: {
        current_page: number;
        last_page: number;
        links: PaginationLink[];
        total: number;
    };
    filters?: {
        search?: string;
        department?: string;
    };
    [key: string]: any;
}

export default function Index() {
    const { auth, departments, allGroups, totalDatabaseCount, pagination, filters } = usePage().props as unknown as PageProps;

    const initialDeps = departments && departments.length > 0 ? departments : [];
    const [originalDeps, setOriginalDeps] = useState(initialDeps);
    const [selectedOption, setSelectedOption] = useState(filters?.department || 'Все отделы');
    const [searchQuery, setSearchQuery] = useState(filters?.search || '');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data, setData, processing } = useForm({
        departments: initialDeps,
    });

    useEffect(() => {
        if (departments) {
            setData('departments', departments);
            setOriginalDeps(JSON.parse(JSON.stringify(departments)));
        }
    }, [departments]);

    useEffect(() => {
        const timer = setTimeout(() => {
            const currentSearch = filters?.search || '';
            const currentDep = filters?.department || 'Все отделы';

            if (searchQuery !== currentSearch || selectedOption !== currentDep) {
                router.get(
                    route('phones.index'),
                    {
                        search: searchQuery,
                        department: selectedOption === 'Все отделы' ? '' : selectedOption
                    },
                    {
                        preserveState: true,
                        preserveScroll: true,
                        replace: true,
                    }
                );
            }
        }, 350);

        return () => clearTimeout(timer);
    }, [searchQuery, selectedOption]);

    const hasChanges = JSON.stringify(data.departments) !== JSON.stringify(originalDeps);

    // Meticulously evaluate deep diffs for 'нач' (boss) and 'зам' (miniboss) columns
    const { bossChanged, isMiniBossChanged } = useMemo(() => {
        let boss = false;
        let miniBoss = false;

        data.departments.forEach((dep, depIndex) => {
            const origDep = originalDeps[depIndex];
            if (!origDep) return;

            dep.phones.forEach((phone, phoneIndex) => {
                const origPhone = origDep.phones?.[phoneIndex];
                if (!origPhone) return;

                // Normalize boss flag comparison
                const currentBoss = Boolean(phone.is_boss ?? phone.nach);
                const origBoss = Boolean(origPhone.is_boss ?? origPhone.nach);
                if (currentBoss !== origBoss) {
                    boss = true;
                }

                // Normalize zam flag comparison across possible field keys (is_miniboss, zam, is_zam)
                const currentZam = Boolean(phone.is_miniboss ?? phone.zam ?? phone.is_zam);
                const origZam = Boolean(origPhone.is_miniboss ?? origPhone.zam ?? origPhone.is_zam);
                if (currentZam !== origZam) {
                    miniBoss = true;
                }
            });
        });

        return { bossChanged: boss, isMiniBossChanged: miniBoss };
    }, [data.departments, originalDeps]);

    const hasLeadershipChanges = bossChanged || isMiniBossChanged;

    const handleDownload = () => {
        const form = document.createElement('form');
        form.method = 'GET';
        form.action = route('files.download');
        form.style.display = 'none';

        const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;
        if (csrfToken) {
            const csrfInput = document.createElement('input');
            csrfInput.type = 'hidden';
            csrfInput.name = '_token';
            csrfInput.value = csrfToken;
            form.appendChild(csrfInput);
        }

        document.body.appendChild(form);
        form.submit();
        form.remove();
    };

    const handleFieldChangeByIndices = (depIndex: number, rowIndex: number, field: keyof PhoneRecord, value: string | boolean) => {
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
        ...(allGroups || []).map((groupName, i) => ({
            label: groupName,
            value: { number: String(i), name: groupName }
        }))
    ];

    const filteredDepartments = data.departments;
    const isDatabaseEmpty = (totalDatabaseCount ?? 0) === 0;
    const isSearchActive = Boolean(filters?.search && filters.search.trim() !== '');

    const translatePaginationLabel = (label: string) => {
        if (label.includes('Previous') || label.includes('&laquo;')) {
            return '« Назад';
        }
        if (label.includes('Next') || label.includes('&raquo;')) {
            return 'Вперед »';
        }
        return label;
    };

    const renderPagination = () => {
        if (!pagination || pagination.last_page <= 1) return null;

        return (
            <div className="flex justify-center items-center gap-2 py-4 bg-[#1a1a1a]/90 border border-[#555] shadow-[4px_4px_0px_rgba(0,0,0,0.5)]">
                {pagination.links.map((link, idx) => {
                    const translatedLabel = translatePaginationLabel(link.label);
                    if (!link.url) {
                        return (
                            <span
                                key={idx}
                                className="px-3 py-1 text-[#777] bg-[#222] border border-[#444] cursor-not-allowed text-[1rem]"
                                dangerouslySetInnerHTML={{ __html: translatedLabel }}
                            />
                        );
                    }
                    return (
                        <Link
                            key={idx}
                            href={link.url}
                            preserveState
                            preserveScroll
                            className={`px-3 py-1 border text-[1rem] transition-colors ${link.active
                                ? 'bg-white text-black font-bold border-white'
                                : 'bg-[#2d2d2d] text-[#e0e0e0] border-[#666] hover:bg-[#3d3d3d]'
                                }`}
                            dangerouslySetInnerHTML={{ __html: translatedLabel }}
                        />
                    );
                })}
            </div>
        );
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

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".xlsx, .xls"
                className="hidden"
            />

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
                        placeholder="Поиск по ФИО / телефону..."
                    />

                    <DepartmentDropdown
                        options={dropdownOptions}
                        selectedOption={selectedOption}
                        onSelect={(option) => {
                            setSelectedOption(option.label);
                        }}
                    />
                </div>

                <div className="relative z-10 flex items-center gap-2">
                    {auth.is_authenticated &&
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="text-[1.15rem] px-5 py-2 bg-black text-[#f5f5f5] border border-black cursor-pointer font-bold hover:bg-[#222]"
                            style={{ fontFamily: '"Courier New", Courier, monospace' }}
                        >
                            Загрузить
                        </button>
                    }
                    <button
                        type="button"
                        onClick={handleDownload}
                        className="text-[1.15rem] px-5 py-2 bg-[#e5e5e5] text-[#000] border border-black cursor-pointer font-bold hover:bg-[#d5d5d5] mr-4"
                        style={{ fontFamily: '"Courier New", Courier, monospace' }}
                    >
                        Скачать
                    </button>
                    {auth.is_authenticated ?
                        (<Link
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
                        </Link>) :
                        (<Link
                            href={route('login')}
                            className="inline-block text-[1.15rem] px-7 py-2 bg-black text-[#f5f5f5] cursor-pointer font-bold hover:bg-[#222] transition-colors text-center no-underline"
                            style={{
                                fontFamily: '"Courier New", Courier, monospace',
                                clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))'
                            }}
                        >
                            Войти
                        </Link>)}
                </div>
            </div>

            <main className="mt-12 space-y-12">
                {isDatabaseEmpty ? (
                    <div className="border-2 border-[#888] p-8 text-center bg-black/90 shadow-[6px_6px_0px_rgba(255,255,255,0.15)] text-[#f0f0f0]">
                        <div className="text-[1.25rem] font-bold tracking-wider uppercase mb-2 text-[#ffcc00]">
                            [!]  Справочник пуст!
                        </div>
                        <div className="text-[1.1rem] text-[#aaa]">
                            Загрузите файл через панель администратора!
                        </div>
                    </div>
                ) : filteredDepartments.length === 0 ? (
                    <div className="border-2 border-[#888] p-8 text-center bg-black/90 shadow-[6px_6px_0px_rgba(255,255,255,0.15)] text-[#f0f0f0]">
                        <div className="text-[1.25rem] font-bold tracking-wider uppercase mb-2 text-[#ffcc00]">
                            [!]  Ничего не найдено
                        </div>
                        <div className="text-[1.1rem] text-[#aaa]">
                            {isSearchActive ? `По запросу "${filters?.search}" совпадений не обнаружено.` : 'В выбранном отделе нет записей.'}
                        </div>
                    </div>
                ) : (
                    <>
                        {renderPagination()}

                        <div className="space-y-8">
                            {filteredDepartments.map((dep) => {
                                const realDepIndex = data.departments.findIndex(d => d.group === dep.group);
                                return (
                                    <DepCard
                                        bossChanged={bossChanged}
                                        isMiniBossChanged={isMiniBossChanged}
                                        key={realDepIndex >= 0 ? realDepIndex : dep.group}
                                        dep={dep}
                                        depIndex={realDepIndex >= 0 ? realDepIndex : 0}
                                        isAuthenticated={auth.is_authenticated}
                                        onFieldChange={handleFieldChangeByIndices}
                                    />
                                );
                            })}
                        </div>

                        <div className="mt-8">
                            {renderPagination()}
                        </div>
                    </>
                )}
            </main>

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
                            className="bg-white hover:bg-[#e0e0e0] text-black font-bold px-4 py-2 text-[1rem] border border-white transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
                        >
                            {processing ? 'Сохранение...' : 'Сохранить'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}