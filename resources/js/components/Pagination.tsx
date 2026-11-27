import { Link } from "@inertiajs/react";
import { PaginationLink } from "@/pages/phones/types";
import { GlobalSwitch } from "@/pages/phones/partials/GlobalSwitch";

interface PaginationProps {
    pagination: {
        current_page: number;
        last_page: number;
        links: PaginationLink[];
        total: number;
    } | undefined;
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

export const Pagination = ({ pagination }: PaginationProps) => {
    if (!pagination || pagination.last_page <= 1) return null;

    return (
        <div className="flex justify-between items-center pr-20 pl-10 py-1  bg-[#1a1a1a]/90  shadow-[0px_0px_5px_rgba(60,180,20,0.5)]">
            <GlobalSwitch />
            <div className="flex justify-center items-center gap-1.5">
                {pagination.links.map((link, idx) => {
                    const translatedLabel = translatePaginationLabel(link.label);
                    if (!link.url) {
                        return (
                            <span
                                key={idx}
                                className="inline-flex items-center justify-center h-7 px-2.5 text-[#777] bg-[#222] border border-[#444] cursor-not-allowed text-[0.9rem] leading-none"
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
                            className={`inline-flex items-center justify-center h-7 px-2.5 border text-[0.9rem] leading-none transition-colors ${link.active
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
