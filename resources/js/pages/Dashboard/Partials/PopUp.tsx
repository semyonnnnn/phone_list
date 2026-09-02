interface PopUpProps {
    message: string;
    handleClick: () => void;
}

const PopUp = ({ message, handleClick }: PopUpProps) => {
    return (
        <div onClick={() => handleClick()}
            className="bottom-6 right-6 z-100 w-86 bg-zinc-100 border border-amber-600/40 p-4 text-amber-800 font-mono shadow-[4px_4px_0px_rgba(100,100,100,1)] clip-corner ac-scanline fixed overflow-hidden select-none animate-[slideIn_0.2s_ease-out_forwards]">

            {/* Tactical Corner Overlays */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-amber-600 z-50"></div>
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-amber-600 z-50"></div>

            {/* Scanline Sweep FX */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-40 opacity-[0.06]">
                <div
                    className="w-full h-0.5 bg-amber-600"
                    style={{ animation: 'staticScanline 4s linear infinite' }}
                ></div>
            </div>

            {/* Header Telemetry Layer */}
            <div className="flex justify-between items-center border-b border-zinc-300 pb-2 mb-2 relative z-50">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-amber-500 animate-ping rounded-none"></div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-amber-800/90">
                        СИСТ_ОТКЛИК // ТРАНЗАКЦИЯ_ОК
                    </span>
                </div>
                <span className="text-[8px] px-1.5 py-0.5 bg-amber-600/10 text-amber-800 border border-amber-600/30 font-bold uppercase tracking-tight">
                    СТАТУС_200
                </span>
            </div>

            {/* Central Core Signal Output */}
            <div className="text-xs font-black uppercase tracking-wider text-zinc-950 py-1 pl-2 border-l-2 border-amber-500 relative z-50 leading-relaxed">
                {message}
            </div>

            {/* Footer Sector Information */}
            <div className="mt-3 pt-1.5 border-t border-zinc-300 flex justify-between text-[8px] text-zinc-500 font-bold tracking-tight uppercase relative z-50">
                <span>МОДУЛЬ: MEM_STORE</span>
                <span className="text-amber-700/90">КОД // ИНЪЕКЦИЯ_УСПЕШНА</span>
            </div>
        </div>
    );
}

export { PopUp };