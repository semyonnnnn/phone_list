import React from 'react';
import { Head, Link } from '@inertiajs/react';
import DepCard from './partials/DepCard';
import DepartmentDropdown from './partials/DepartmentDropdown';
import { PopUp } from './partials/PopUp';
import { usePhoneDirectory } from './usePhoneDirectory';
import { PageProps } from './types';
import { UploadIcon } from "lucide-react";

// Static, so it lives outside the component: built once instead of on every render.
const PAGE_STYLE: React.CSSProperties = {
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
    `,
};

// Pure helper: uses no props or state, so it doesn't belong inside the component.
const translatePaginationLabel = (label: string) => {
    if (label.includes('Previous') || label.includes('&laquo;')) {
        return '« Назад';
    }
    if (label.includes('Next') || label.includes('&raquo;')) {
        return 'Вперед »';
    }
    return label;
};

export default function Index({
    auth,
    departments,
    allGroups,
    totalDatabaseCount,
    pagination,
    filters,
    flash,
    territories,
}: PageProps) {
    // `departments` goes in as the backend sent it: the same array object on every
    // render, which is what keeps the sync effect in the hook from looping.
    const {
        data,
        searchQuery,
        setSearchQuery,
        selectedOption,
        setSelectedOption,
        fileInputRef,
        showSuccess,
        setShowSuccess,
        processing,
        errors,
        hasChanges,
        bossChanged,
        isMiniBossChanged,
        dropdownOptions,
        handleBossChange,
        handleDownload,
        handleFieldChangeByIndices,
        handleSave,
        handleCancel,
        handleFileChange,
        pausePopupTimer,
        resumePopupTimer,
        handleGroupNameChange,
        handleTerritoryChange,
        handleTerritoryUpload,
    } = usePhoneDirectory(departments, filters, flash, allGroups);

    const isDatabaseEmpty = (totalDatabaseCount ?? 0) === 0;
    const isSearchActive = Boolean(filters?.search && filters.search.trim() !== '');

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
                                : 'bg-[#2d2d2d] text-[#e0e0e0] border-[#667] hover:bg-[#3d3d3d]'
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
            style={PAGE_STYLE}
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
                    background: 'conic-gradient(#000 90deg, #667 90deg 180deg, #000 180deg 270deg, #667 270deg)',
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
                    <div className="relative w-[300px]">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="text-[1.15rem] p-2 pr-9 border-0 border-b border-[#999] w-full outline-none bg-transparent focus:border-[#000]"
                            style={{ fontFamily: '"Courier New", Courier, monospace' }}
                            placeholder="Поиск по ФИО / телефону..."
                        />

                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => setSearchQuery('')}
                                className="absolute right-1 top-1/2 -translate-y-1/2 w-6 h-6 border border-[#555] bg-transparent text-[#222] flex items-center justify-center text-[1rem] leading-none cursor-pointer hover:bg-[#222] hover:text-white transition-colors"
                                aria-label="Очистить поиск"
                            >
                                ×
                            </button>
                        )}
                    </div>

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
                        <div className='flex gap-1'>
                            <button
                                type="button"
                                onClick={() => handleTerritoryUpload('ekb')}
                                className="flex gap-2 text-[1.15rem] px-5 py-2 bg-black text-[#f5f5f5] border border-black cursor-pointer font-bold hover:bg-[#222]"
                                style={{ fontFamily: '"Courier New", Courier, monospace' }}
                            >
                                <div>ЕКБ</div>
                                <UploadIcon />
                            </button>
                            <button
                                type="button"
                                onClick={() => handleTerritoryUpload('krg')}
                                className="flex gap-2 text-[1.15rem] px-5 py-2 bg-black text-[#f5f5f5] border border-black cursor-pointer font-bold hover:bg-[#222]"
                                style={{ fontFamily: '"Courier New", Courier, monospace' }}
                            >
                                <div>КРГ</div>
                                <UploadIcon />
                            </button>
                        </div>
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
                ) : data.departments.length === 0 ? (
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
                            {/* .map already supplies the index, so there is no findIndex by name.
                                That lookup returned the FIRST card with the same name, so two
                                departments sharing a name got the same depIndex and the same key,
                                and edits and server errors landed on the wrong card. */}
                            {data.departments.map((dep, depIndex) => (
                                <DepCard
                                    key={depIndex}
                                    bossChanged={bossChanged}
                                    isMiniBossChanged={isMiniBossChanged}
                                    dep={dep}
                                    depIndex={depIndex}
                                    isAuthenticated={auth.is_authenticated}
                                    onFieldChange={handleFieldChangeByIndices}
                                    onBossChange={handleBossChange}
                                    errors={errors}
                                    onGroupNameChange={handleGroupNameChange}
                                    territories={territories}
                                    handleTerritoryChange={handleTerritoryChange}
                                />
                            ))}
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
                            className="bg-[#555] hover:bg-[#667] text-white px-4 py-2 text-[1rem] border border-white transition-colors cursor-pointer"
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

            {showSuccess && flash?.success && (
                <PopUp
                    key={flash.success.id}
                    message={flash.success.message}
                    handleClick={() => setShowSuccess(false)}
                    onMouseEnter={pausePopupTimer}
                    onMouseLeave={resumePopupTimer}
                />
            )}
        </div>
    );
}