import { Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { Brand } from '@/components/app-frame';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="flex min-h-svh flex-col bg-background">
            <header className="mx-auto flex h-18 w-full max-w-4xl items-center px-6">
                <Brand />
            </header>
            <main className="flex flex-1 items-start justify-center px-4 pt-6 pb-12 sm:items-center sm:pt-0">
                <div className="w-full max-w-[420px]">
                    <div className="rounded-2xl border bg-card p-6 shadow-[0_2px_12px_-6px_rgb(15_23_42_/_0.12)] sm:p-8">
                        <header className="mb-7">
                            <h1 className="text-2xl font-semibold tracking-tight">
                                {title}
                            </h1>
                            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                {description}
                            </p>
                        </header>
                        {children}
                    </div>
                    <Link
                        href="/"
                        className="mx-auto mt-6 flex w-fit items-center gap-2 rounded text-xs text-muted-foreground hover:text-foreground"
                    >
                        <ArrowLeft className="size-3.5" />
                        Kembali ke daftar tugas
                    </Link>
                </div>
            </main>
        </div>
    );
}
