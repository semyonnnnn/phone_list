import { Head, Link } from '@inertiajs/react';
import { UploadIcon } from "lucide-react";
import { useEffect } from 'react';
//////////////////////////////////////////////////
import DepCard from '@/pages/phones/partials/DepCard';
import { PopUp } from '@/pages/phones/partials/PopUp';
import DepartmentDropdown from '@/pages/phones/partials/DepartmentDropdown';
import { usePhoneDirectory } from '@/pages/phones/usePhoneDirectory';
import { DepartmentOption, PageProps, PAGE_STYLE } from '@/pages/phones/types';
import { Pagination } from '@/components/Pagination';
import { PhoneProvider } from '@/pages/phones/context/PhonesContext';
import { AddDepartmentModal } from "@/pages/phones/partials/AddDepartmentModal";
import { AddPersonModal } from '@/pages/phones/partials/AddPersonModal';
import { DeleteConfirmModal } from '@/pages/phones/partials/DeleteConfirmModal';

export default function Index(props: PageProps) {
    return (
        <PhoneProvider
            initialTerritory={props.filters?.territory ?? 'all'}>
            <PhonesContent {...props} />
        </PhoneProvider>
    );
}


function PhonesContent({
    auth,
    departments,
    allGroups,
    totalDatabaseCount,
    pagination,
    filters,
    flash,
    territories,
}: PageProps) {
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
        departmentNameWidth,
        columnWidths,
        isDatabaseEmpty,
        isSearchActive,
        onAddDepartmentClick,
        isAddDepModalOpen,
        setIsAddDepModalOpen,
        personModal,
        setPersonModal,
        setDeleteTarget,
        deleteTarget
    } = usePhoneDirectory(filters, flash, departments, allGroups, totalDatabaseCount, pagination);

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
                        onAddDepartmentClick={onAddDepartmentClick}
                        isAuthenticated={auth.is_authenticated}
                        options={dropdownOptions}
                        selectedOption={selectedOption}
                        onSelect={(option: DepartmentOption) => {
                            setSelectedOption(option.label);
                        }} />
                </div>
                <AddDepartmentModal onClose={() => setIsAddDepModalOpen(false)} isOpen={isAddDepModalOpen} />
                <AddPersonModal
                    department={personModal.department}
                    onClose={() => setPersonModal({ isOpen: false, department: null })}
                    isOpen={personModal.isOpen} />
                <DeleteConfirmModal
                    deleteRoute={deleteTarget?.route ?? null}
                    target={deleteTarget}
                    onClose={() => setDeleteTarget(null)}
                />


                <div className="relative z-10 flex items-center gap-2">
                    {auth.is_authenticated &&
                        <div className='flex gap-1'>
                            <button
                                type="button"
                                onClick={() => handleTerritoryUpload('ekb')}
                                className="flex gap-2 text-[1.15rem] px-5 py-2 bg-black text-[#f5f5f5] border border-black cursor-pointer font-bold hover:bg-[#222]"
                                style={{ fontFamily: '"Courier New", Courier, monospace' }}>
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
                ) : (
                    <>
                        <Pagination
                            pagination={pagination}
                        />

                        <div className="space-y-8">
                            {/* .map passes two positional arguments: the element and its index.
                                `dep` is inferred as Department ({ group, phones }) from
                                data.departments, which is exactly what DepCard's `dep` prop
                                expects, so no annotation is needed. */}
                            {data.departments.map((dep, depIndex) => (
                                <DepCard
                                    onAddPersonClick={() => setPersonModal({ isOpen: true, department: dep })}
                                    columnWidths={columnWidths}
                                    departmentNameWidth={departmentNameWidth}
                                    // both are needed, because react strips key away
                                    key={depIndex}
                                    depIndex={depIndex}
                                    bossChanged={bossChanged}
                                    isMiniBossChanged={isMiniBossChanged}
                                    dep={dep}
                                    isAuthenticated={auth.is_authenticated}
                                    onFieldChange={handleFieldChangeByIndices}
                                    onBossChange={handleBossChange}
                                    errors={errors}
                                    onGroupNameChange={handleGroupNameChange}
                                    territories={territories}
                                    handleTerritoryChange={handleTerritoryChange}
                                    onRequestDelete={setDeleteTarget}
                                />
                            ))}
                        </div>

                        <div className="mt-8">
                            <Pagination
                                pagination={pagination}
                            />
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