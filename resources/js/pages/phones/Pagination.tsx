import { Link } from "@inertiajs/react";
import { PaginationLink } from "./types";
import { GlobalSwitch } from "./GlobalSwitch";
import { GlobalTerritoryKey } from "@/types";

interface PaginationProps {
    pagination: {
        current_page: number;
        last_page: number;
        links: PaginationLink[];
        total: number;
    } | undefined;
    globalTerritoryValue: GlobalTerritoryKey,
    onChangeGlobalTerritoryValue: (globalTerritoryValue: GlobalTerritoryKey) => void
}

const translatePaginationLabel = (label: string) => {
    if (label.includes('Previous') || label.includes('&laquo;')) {
        return '« Назад';
    }
    if (label.includes('Next') || label.includes('&raquo;')) {
        return 'Вперед »';
    }
    return label;
};

export const Pagination = ({ pagination, globalTerritoryValue, onChangeGlobalTerritoryValue }: PaginationProps) => {
    if (!pagination || pagination.last_page <= 1) return null;

    return (
        <div className="flex justify-between pr-20 pl-10 py-4 bg-[#1a1a1a]/90 border border-[#555] shadow-[4px_4px_0px_rgba(0,0,0,0.5)]">
            <GlobalSwitch
                globalTerritoryValue={globalTerritoryValue}
                onChangeGlobalTerritoryValue={onChangeGlobalTerritoryValue}
            />
            <div className="flex justify-center items-center gap-2">
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
        </div>
    );
};