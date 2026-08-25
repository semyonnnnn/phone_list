import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

interface LoginForm {
    email: string;
    password: string;
    [key: string]: any;
}

interface LoginProps {
    status?: string;
}

export default function Login({ status }: LoginProps) {
    const { data, setData, post, processing, errors, reset } = useForm<LoginForm>({
        email: '',
        password: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div
            className="min-h-screen text-[#111] p-16 min-w-[1200px] text-[1.15rem] bg-[#333333] bg-[linear-gradient(#000000_1px,transparent_1px),linear-gradient(90deg,#000000_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] flex justify-center items-center"
            style={{ fontFamily: '"Courier New", Courier, monospace' }}
        >
            <Head title="Вход в систему" />

            {/* Main Window Frame */}
            <div className="relative w-[500px]">
                {/* HUD White Corner Accents */}
                <div className="absolute -top-3 -right-3 w-[35px] h-[35px] border-4 border-white border-b-0 border-l-0 z-20 pointer-events-none" />
                <div className="absolute -bottom-3 -left-3 w-[35px] h-[35px] border-4 border-white border-t-0 border-r-0 z-20 pointer-events-none shadow-[-6px_6px_0px_rgba(0,0,0,0.4)]" />

                <div className="bg-[#f5f5f5] border border-[#ccc] shadow-[6px_6px_0px_rgba(0,0,0,0.4)] relative overflow-hidden">

                    {/* Repeating Watermark Layer */}
                    <div className="absolute -top-1/2 -left-[20%] w-[150%] h-[200%] flex flex-wrap justify-center items-center gap-8 z-0 pointer-events-none select-none -rotate-[30deg]">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <span
                                key={i}
                                className="text-[3rem] font-bold text-[#ebebeb] uppercase whitespace-nowrap"
                                style={{ fontFamily: '"Courier New", Courier, monospace' }}
                            >
                                АВТОРИЗАЦИЯ
                            </span>
                        ))}
                    </div>

                    {/* Chess Pattern Header Bar */}
                    <div
                        className="p-3 text-left relative z-20"
                        style={{
                            background: 'conic-gradient(#000 90deg, #666 90deg 180deg, #000 180deg 270deg, #666 270deg)',
                            backgroundSize: '0.5rem 0.5rem',
                        }}
                    >
                        <div className="bg-[#f5f5f5] inline-block px-4 py-2 text-[1.25rem] font-bold border border-[#ccc]">
                            Авторизация
                        </div>
                    </div>

                    {/* Form Container */}
                    <form className="p-8 flex flex-col gap-6 relative z-10" onSubmit={submit}>
                        {status && (
                            <div className="p-2 border border-[#999] bg-[#e5e5e5] text-sm font-medium text-black">
                                {status}
                            </div>
                        )}

                        <div className="flex flex-col gap-2">
                            <label htmlFor="email" className="text-[1.1rem] font-bold text-[#333]">
                                Логин
                            </label>
                            <input
                                id="email"
                                type="email"
                                required
                                autoFocus
                                tabIndex={1}
                                autoComplete="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="email@example.com"
                                className="text-[1.15rem] p-2 border-0 border-b border-[#999] w-full outline-none bg-transparent focus:border-[#000]"
                                style={{ fontFamily: '"Courier New", Courier, monospace' }}
                            />
                            {errors.email && <span className="text-sm text-red-600 mt-1">{errors.email}</span>}
                        </div>

                        <div className="flex flex-col gap-2">
                            <label htmlFor="password" className="text-[1.1rem] font-bold text-[#333]">
                                Пароль
                            </label>
                            <input
                                id="password"
                                type="password"
                                required
                                tabIndex={2}
                                autoComplete="current-password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder="Пароль"
                                className="text-[1.15rem] p-2 border-0 border-b border-[#999] w-full outline-none bg-transparent focus:border-[#000]"
                                style={{ fontFamily: '"Courier New", Courier, monospace' }}
                            />
                            {errors.password && <span className="text-sm text-red-600 mt-1">{errors.password}</span>}
                        </div>

                        {/* Submit Button with Custom Cut Corners */}
                        <button
                            type="submit"
                            tabIndex={3}
                            disabled={processing}
                            className="w-full text-[1.15rem] py-3 bg-black text-[#f5f5f5] cursor-pointer font-bold hover:bg-[#222] transition-colors flex justify-center items-center gap-2 mt-2 disabled:opacity-50"
                            style={{
                                fontFamily: '"Courier New", Courier, monospace',
                                clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))'
                            }}
                        >
                            {processing && <LoaderCircle className="h-5 w-5 animate-spin" />}
                            Войти в систему
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}