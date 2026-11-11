
import { DepartmentDropdownProps } from './types';
import { useDepartmentDropdown } from './useDepartmentDropdown';

export default function DepartmentDropdown({
    options,
    selectedOption,
    onSelect,
}: DepartmentDropdownProps) {
    const {
        isOpen,
        searchQuery,
        dynamicOptions,
        dropdownRef,
        inputRef,
        handleTriggerClick,
        handleInputChange,
        handleInputFocus,
        handleArrowClick,
        handleOptionClick,
    } = useDepartmentDropdown(options, onSelect);

    return (
        <div className="relative w-[300px] z-50" ref={dropdownRef}>
            <div
                className="relative flex items-center border border-black cursor-pointer bg-black"
                style={{ fontFamily: '"Courier New", Courier, monospace' }}
                onClick={handleTriggerClick}
            >
                <input
                    ref={inputRef}
                    type="text"
                    value={isOpen ? searchQuery : selectedOption}
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                    placeholder="Все отделы..."
                    className="w-full text-[1.15rem] p-2 pr-8 bg-transparent text-[#f5f5f5] outline-none cursor-pointer placeholder-[#aaa]"
                    style={{ fontFamily: '"Courier New", Courier, monospace' }}
                />

                <span
                    onClick={handleArrowClick}
                    className={`absolute right-2 text-white transition-transform duration-200 text-sm select-none ${isOpen ? 'rotate-180' : ''}`}
                >
                    ▼
                </span>
            </div>

            {isOpen && (
                <div
                    className="absolute left-1/2 -translate-x-1/2 w-[500px] max-w-[90vw] mt-1 border border-black shadow-[4px_4px_0px_rgba(0,0,0,0.4)] z-50 max-h-[80vh] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-[#1c1c1c] [&::-webkit-scrollbar-thumb]:bg-[#667]"
                    style={{
                        background: '#1c1c1c',
                        fontFamily: '"Courier New", Courier, monospace',
                    }}
                >
                    {dynamicOptions.length > 0 ? (
                        dynamicOptions.map((opt) => {
                            const isKrg = opt.value.id !== 0 && opt.value.territory === 'krg';

                            return (
                                <div
                                    key={opt.value.id || 'all'}
                                    onClick={() => handleOptionClick(opt)}
                                    className={`flex justify-between items-center gap-4 p-2.5 text-[1.15rem] cursor-pointer border-b border-[#333] last:border-b-0 text-[#f5f5f5] hover:bg-[#667] hover:text-white transition-colors ${isKrg ? 'bg-[#25232b]' : 'bg-[#1c1c1c]'
                                        }`}
                                >
                                    <span className="min-w-0 truncate">
                                        {opt.label}
                                    </span>

                                    {opt.value.id !== 0 && (
                                        <span className={`shrink-0 text-sm ${isKrg ? 'text-[#c4b5fd]' : 'text-[#aaa]'
                                            }`}>
                                            {isKrg ? 'КРГ' : 'ЕКБ'}
                                        </span>
                                    )}
                                </div>
                            );
                        })
                    ) : (
                        <div className="p-3 text-[1rem] text-[#888] text-center">
                            Ничего не найдено
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
