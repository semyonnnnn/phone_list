import { TERRITORIES, TerritoryKey } from "@/pages/phones/types";

interface TerritorySwitchProps {
    // `typeof` turns the runtime object into its type: { readonly ekb: 'ЕКБ'; readonly krg: 'КРГ' }.
    // A bare TERRITORIES here is a value, and values can't be used as types.
    options: typeof TERRITORIES;
    value: TerritoryKey;                       // 'ekb' | 'krg', the key, never the label
    onChange: (value: TerritoryKey) => void;   // passes the key up; the parent decides what it means
    isAuthenticated: boolean;
}

export function TerritorySwitch({ options, value, onChange, isAuthenticated }: TerritorySwitchProps) {
    // Object.keys() is typed string[]; the cast is safe because options is TERRITORIES.
    const keys = Object.keys(options) as TerritoryKey[];

    // The next key, wrapping around. Replaces the options[0]/options[1] logic, which
    // only worked for exactly two entries. An unknown value gives indexOf = -1,
    // so (-1 + 1) % length = 0 and a click still lands on the first valid key.
    const nextKey = keys[(keys.indexOf(value) + 1) % keys.length];

    // Labels for display and screen readers. The key is only ever passed to onChange.
    const label = options[value];
    const nextLabel = options[nextKey];

    return (
        <button
            type="button"
            // disabled makes the guard structural: no click, no Enter/Space, no Tab stop,
            // and screen readers announce it as unavailable. The check inside onClick
            // below stays as a second line of defense. The real protection is the `auth`
            // middleware on PUT /phones, because anything in the browser can be bypassed.
            disabled={!isAuthenticated}
            onClick={() => {
                if (isAuthenticated) {
                    onChange(nextKey); // the key ('krg'), not the label ('КРГ')
                }
            }}
            // The visible text is only the current label, so for a logged-in user the
            // aria-label spells out what the click does. A guest gets no promise of an action.
            aria-label={isAuthenticated ? `Территория: ${label}. Переключить на ${nextLabel}` : `Территория: ${label}`}
            title={isAuthenticated ? `Переключить на ${nextLabel}` : undefined}
            // Same recipe as the pager buttons: dark fill, thin gray border, light text.
            // self-stretch: same height as the row it sits in (the row must be a flex
            // container). min-w stops the width from jumping when the two labels differ
            // in length, and also when the arrows disappear for a guest.
            // Everything that signals "clickable" (hover and press colors, pointer cursor,
            // focus ring) is only added for a logged-in user.
            className={[
                'inline-flex min-w-[6.5rem] self-stretch items-center justify-center gap-3 border border-[#667] bg-[#222]/50 backdrop-blur-[1.8px] px-3 text-base text-[#ddd] outline-none',
                isAuthenticated
                    ? 'cursor-pointer transition-colors hover:bg-[#667] hover:text-white active:bg-[#333] focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black'
                    : 'cursor-default',
            ].join(' ')}
            style={{ fontFamily: '"Courier New", Courier, monospace' }}
        >
            {label}

            {/* Swap icon as an SVG: a font glyph for arrows can render differently
                depending on which fallback font the browser picks. Guests don't get it,
                since there is nothing for them to swap. */}
            {isAuthenticated && (
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
            )}
        </button>
    );
}