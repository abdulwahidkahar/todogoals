import { Link, usePage } from '@inertiajs/react';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserMenuContent } from '@/components/user-menu-content';
import type { User } from '@/types';

export function Brand() {
    return (
        <Link
            href="/"
            className="rounded text-sm font-semibold tracking-tight text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
        >
            Todogoals
        </Link>
    );
}

export function AppFrame({
    children,
    settings = false,
}: {
    children: ReactNode;
    settings?: boolean;
}) {
    const { auth } = usePage<{ auth: { user: User | null } }>().props;
    const user = auth.user;
    return (
        <div className="min-h-svh bg-card">
            <a
                href="#main-content"
                className="sr-only rounded-md bg-primary p-3 text-primary-foreground focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50"
            >
                Langsung ke daftar tugas
            </a>
            <div className="relative min-h-svh w-full bg-card">
                <header className="absolute inset-x-0 top-0 flex h-20 items-center justify-between gap-4 px-6 sm:px-8">
                    <Brand />
                    <nav
                        aria-label="Navigasi utama"
                        className="flex items-center gap-1"
                    >
                        {user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="gap-1.5 text-xs text-muted-foreground"
                                        aria-label={`Menu akun ${user.name}`}
                                    >
                                        <span className="max-w-36 truncate">
                                            {user.name}
                                        </span>
                                        <ChevronDown className="size-3" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="end"
                                    className="w-60"
                                >
                                    <UserMenuContent user={user} />
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-xs"
                                    asChild
                                >
                                    <Link href="/login">Masuk</Link>
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="rounded-lg text-xs shadow-none"
                                    asChild
                                >
                                    <Link href="/register">Daftar</Link>
                                </Button>
                            </>
                        )}
                    </nav>
                </header>
                <main id="main-content" tabIndex={-1} className="outline-none">
                    {settings && (
                        <div className="mx-auto max-w-4xl px-4 pt-28 sm:px-6">
                            <Link
                                href="/tasks"
                                className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
                            >
                                <ArrowLeft className="size-3.5" />
                                Kembali ke tugas
                            </Link>
                        </div>
                    )}
                    {children}
                </main>
            </div>
        </div>
    );
}
