import React, { FormEventHandler } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { LoaderCircle, ArrowLeft } from 'lucide-react';

interface LoginForm {
    email: string;
    password: string;
    [key: string]: any;
}

interface LoginProps {
    status?: string;
}

export default function Login({ status }: LoginProps) {
    const { auth } = usePage().props as unknown as {
        auth: { is_authenticated: boolean };
    };

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
            className="min-h-screen text-[#111] p-16 min-w-[1200px] text-[1.15rem] bg-[#000000]"
            onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                e.currentTarget.style.setProperty('--cursor-x', `${x}px`);
                e.currentTarget.style.setProperty('--cursor-y', `${y}px`);
            }}
            style={{
                fontFamily: '"Courier New", Courier, monospace',
                backgroundImage: `
                    radial-gradient(circle 60px at var(--cursor-x, -1000px) var(--cursor-y, -1000px), rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.08) 60%, transparent 100%),
                    linear-gradient(#4d1a1a 1px, transparent 1px), linear-gradient(90deg, #4d1a1a 1px, transparent 1px),
                    linear-gradient(#260d0d 1px, transparent 1px), linear-gradient(90deg, #260d0d 1px, transparent 1px),
                    linear-gradient(#4d331a 1px, transparent 1px), linear-gradient(90deg, #4d331a 1px, transparent 1px),
                    linear-gradient(#4d4d1a 1px, transparent 1px), linear-gradient(90deg, #4d4d1a 1px, transparent 1px),
                    linear-gradient(#1a4d1a 1px, transparent 1px), linear-gradient(90deg, #1a4d1a 1px, transparent 1px),
                    linear-gradient(#0d260d 1px, transparent 1px), linear-gradient(90deg, #0d260d 1px, transparent 1px),
                    linear-gradient(#1a4d4d 1px, transparent 1px), linear-gradient(90deg, #1a4d4d 1px, transparent 1px),
                    linear-gradient(#1a264d 1px, transparent 1px), linear-gradient(90deg, #1a264d 1px, transparent 1px),
                    linear-gradient(#0d0d26 1px, transparent 1px), linear-gradient(90deg, #0d0d26 1px, transparent 1px),
                    linear-gradient(#331a4d 1px, transparent 1px), linear-gradient(90deg, #331a4d 1px, transparent 1px),
                    linear-gradient(#4d1a33 1px, transparent 1px), linear-gradient(90deg, #4d1a33 1px, transparent 1px)
                `,
                backgroundSize: 'auto, 11rem 11rem, 11rem 11rem, 11rem 11rem, 11rem 11rem, 11rem 11rem, 11rem 11rem, 11rem 11rem, 11rem 11rem, 11rem 11rem, 11rem 11rem, 11rem 11rem',
                backgroundPosition: `
                    0 0,
                    0 0, 0 0,
                    1.1rem 1.1rem, 1.1rem 1.1rem,
                    2.2rem 2.2rem, 2.2rem 2.2rem,
                    3.3rem 3.3rem, 3.3rem 3.3rem,
                    4.4rem 4.4rem, 4.4rem 4.4rem,
                    5.5rem 5.5rem, 5.5rem 5.5rem,
                    6.6rem 6.6rem, 6.6rem 6.6rem,
                    7.7rem 7.7rem, 7.7rem 7.7rem,
                    8.8rem 8.8rem, 8.8rem 8.8rem,
                    9.9rem 9.9rem, 9.9rem 9.9rem,
                    1.1rem 0, 0 1.1rem
                `
            }}
        >
            <Head title="Вход в систему" />

            {/* Centered Layout Container */}
            <div className="flex justify-center items-center w-full min-h-[75vh]">
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

                            {/* Action Buttons Container */}
                            <div className="flex flex-col gap-3 mt-2">
                                <button
                                    type="submit"
                                    tabIndex={3}
                                    disabled={processing}
                                    className="w-full text-[1.15rem] py-3 bg-black text-[#f5f5f5] cursor-pointer font-bold hover:bg-[#222] transition-colors flex justify-center items-center gap-2 disabled:opacity-50"
                                    style={{
                                        fontFamily: '"Courier New", Courier, monospace',
                                        clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))'
                                    }}
                                >
                                    {processing && <LoaderCircle className="h-5 w-5 animate-spin" />}
                                    Войти в систему
                                </button>

                                <Link
                                    href="/"
                                    className="w-full text-[1.1rem] py-2.5 bg-[#e5e5e5] border border-[#bbb] text-black font-bold hover:bg-[#d5d5d5] transition-colors flex justify-center items-center gap-2"
                                    style={{ fontFamily: '"Courier New", Courier, monospace' }}
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    На главную
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}