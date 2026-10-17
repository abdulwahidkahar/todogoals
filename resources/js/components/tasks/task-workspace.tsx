import { Link } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { pageClass } from '@/components/tasks/shared';

export function TaskWorkspace({
    guest = false,
    remaining,
    children,
    pagination,
}: {
    guest?: boolean;
    remaining: number;
    children: ReactNode;
    pagination?: ReactNode;
}) {
    return (
        <div className={pageClass}>
            {children}
            {pagination}
            <footer className="mt-6 space-y-3">
                <p className="text-sm font-medium italic">
                    {remaining} tugas belum selesai.
                </p>
                <p className="text-sm leading-relaxed text-muted-foreground italic">
                    Selesaikan yang penting, satu per satu.
                </p>
                <p className="sr-only">
                    {guest ? (
                        <>
                            Tersimpan di browser ini.{' '}
                            <Link
                                href="/login"
                                className="rounded underline underline-offset-3 hover:text-foreground"
                            >
                                Masuk untuk memakai daftar akun.
                            </Link>
                        </>
                    ) : (
                        'Tersimpan di akunmu.'
                    )}
                </p>
            </footer>
        </div>
    );
}

export function TaskWorkspaceHeader({
    composer,
    options,
    issue,
}: {
    composer: ReactNode;
    options?: ReactNode;
    issue?: string | null;
}) {
    return (
        <>
            <div className="mb-7 flex items-center justify-between gap-4">
                <h1 className="text-[26px] leading-tight font-bold tracking-tight sm:text-[30px]">
                    Daftar tugas
                </h1>
                {options}
            </div>
            {issue && (
                <p
                    role="alert"
                    className="mb-4 rounded-lg border p-3 text-xs leading-relaxed"
                >
                    {issue}
                </p>
            )}
            <section aria-label="Tambah tugas" className="mb-7">
                {composer}
            </section>
        </>
    );
}
