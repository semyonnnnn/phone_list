interface PopUpProps {
    message: string;
    handleClick: () => void;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
}

const PopUp = ({ message, handleClick, onMouseEnter, onMouseLeave }: PopUpProps) => {
    return (
        <div
            onClick={() => handleClick()}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            className="
                fixed bottom-6 right-6 z-100
                w-86
                overflow-hidden
                select-none
                font-mono

                bg-[#d4d4d4]
                text-black

                border
                border-black

                shadow-[5px_5px_0px_#111]

                clip-corner

                animate-[slideIn_0.2s_ease-out_forwards]
            "
        >
            {/* Tactical Corner Overlays */}
            <div
                className="
                    absolute top-0 left-0
                    w-3 h-3
                    border-t-2 border-l-2
                    border-black
                    z-50
                "
            />

            <div
                className="
                    absolute bottom-0 right-0
                    w-3 h-3
                    border-b-2 border-r-2
                    border-black
                    z-50
                "
            />

            {/* Scanline Sweep FX */}
            <div
                className="
                    absolute inset-0
                    pointer-events-none
                    overflow-hidden
                    z-40
                    opacity-[0.045]
                "
            >
                <div
                    className="w-full h-px bg-black"
                    style={{
                        animation: 'staticScanline 4s linear infinite',
                    }}
                />
            </div>

            {/* Header Telemetry Layer */}
            <div
                className="
                    relative z-50

                    flex
                    justify-between
                    items-center

                    px-3
                    py-2

                    bg-[repeating-conic-gradient(#444_0%_25%,#777_0%_50%)_50%/6px_6px]

                    border-b
                    border-black
                "
            >
                <div className="flex items-center gap-2">
                    <div
                        className="
                            w-2 h-2
                            bg-black
                            animate-ping
                            rounded-none
                        "
                    />

                    <span
                        className="
                            text-[9px]
                            font-bold
                            uppercase
                            tracking-[0.12em]
                            text-black
                        "
                    >
                        СИСТ_ОТКЛИК // ТРАНЗАКЦИЯ_ОК
                    </span>
                </div>

                <span
                    className="
                        text-[8px]
                        px-1.5
                        py-0.5

                        bg-[#e8e8e8]
                        text-black

                        border
                        border-black

                        font-bold
                        uppercase
                    "
                >
                    СТАТУС_200
                </span>
            </div>

            {/* Central Core Signal Output */}
            <div
                className="
                    relative z-50

                    mx-3
                    my-3

                    px-3
                    py-3

                    bg-[#e7e7e7]

                    border
                    border-black/25

                    border-l-4
                    border-l-black

                    text-xs
                    font-bold
                    uppercase
                    tracking-wide
                    text-black

                    leading-relaxed
                "
            >
                {message}
            </div>

            {/* Footer Sector Information */}
            <div
                className="
                    relative z-50

                    mx-3
                    pb-2
                    pt-2

                    border-t
                    border-black/40

                    flex
                    justify-between

                    text-[8px]
                    text-black/60
                    font-bold
                    uppercase
                    tracking-tight
                "
            >
                <span>
                    МОДУЛЬ: MEM_STORE
                </span>

                <span className="text-black/70">
                    КОД // ИНЪЕКЦИЯ_УСПЕШНА
                </span>
            </div>
        </div>
    );
}

export { PopUp };