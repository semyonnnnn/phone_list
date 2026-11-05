// Props live here to keep the component self-contained; move them to ./types if you prefer.
interface TerritorySwitchProps {
    // A tuple, not string[]: the compiler enforces exactly two options.
    options: readonly [string, string];
    value: string;                     // the chosen option, owned by the parent
    onChange: (value: string) => void; // the parent decides what a switch means
    isAuthenticated: boolean;
}

export function TerritorySwitch({ options, value, onChange, isAuthenticated }: TerritorySwitchProps) {
    // The "other" option. If value is the first one, go to the second; for anything
    // else (including an unknown value) go to the first, so a click always lands
    // on a valid option.
    const next = value === options[0] ? options[1] : options[0];

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
                    onChange(next);
                }
            }}
            // The visible text is only the current option, so for a logged-in user the
            // label spells out what the click does. A guest gets no promise of an action.
            aria-label={isAuthenticated ? `Территория: ${value}. Переключить на ${next}` : `Территория: ${value}`}
            title={isAuthenticated ? `Переключить на ${next}` : undefined}
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
            {value}

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