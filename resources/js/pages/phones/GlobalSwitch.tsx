import { GLOBAL_TERRITORIES, GlobalTerritoryKey, GlobalSwitchProps } from "@/types";

export function GlobalSwitch({ globalTerritoryValue, onChangeGlobalTerritoryValue }: GlobalSwitchProps) {
    // Keys of the object, in declaration order: ekb -> krg -> all.
    // Cast is needed because Object.keys always returns string[].
    // It must be GlobalTerritoryKey[] (not TerritoryKey[]) so 'all' is part of the cycle.
    const keys = Object.keys(GLOBAL_TERRITORIES) as GlobalTerritoryKey[];

    // Next key in the cycle; % wraps from the last one ('all') back to the first ('ekb').
    const nextKey = keys[(keys.indexOf(globalTerritoryValue) + 1) % keys.length];

    // No type annotation on purpose: these are display strings ('ЕКБ' | 'КРГ' | 'ВСЕ'),
    // not keys, and inference gets that right.
    const label = GLOBAL_TERRITORIES[globalTerritoryValue];
    const nextLabel = GLOBAL_TERRITORIES[nextKey];

    return (
        <button
            type="button"
            onClick={() => {
                onChangeGlobalTerritoryValue(nextKey);
            }}
            aria-label={`Территория: ${label}. Переключить на ${nextLabel}`}
            title={`Переключить на ${nextLabel}`}
            className={[
                'inline-flex min-w-[6.5rem] self-stretch items-center justify-center gap-3 border border-[#667] bg-[#222] backdrop-blur-[1.8px] px-3 text-base text-[#ddd] outline-none',
                'cursor-pointer transition-colors hover:bg-[#667] hover:text-white active:bg-[#333] focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black',
            ].join(' ')}
            style={{ fontFamily: '"Courier New", Courier, monospace' }}
        >
            {label}
            <svg
                aria-hidden="true"
                viewBox="0 0 16 12"
                className="h-3 w-4 shrink-0 fill-none stroke-current"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M1 3h12M10 0l3 3-3 3" />
                <path d="M15 9H3M6 6l-3 3 3 3" />
            </svg>
        </button>
    );
}