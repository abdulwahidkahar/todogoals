import { Link, useForm } from '@inertiajs/react';
import { X } from 'lucide-react';
import { useId, useState } from 'react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import type { Paginated } from '@/types/task';

export function Field({
    id,
    label,
    error,
    children,
}: {
    id: string;
    label: string;
    error?: string;
    children: ReactNode;
}) {
    return (
        <div className="grid gap-2">
            <Label htmlFor={id}>{label}</Label>
            {children}
            {error && (
                <p
                    id={`${id}-error`}
                    role="alert"
                    className="text-sm text-destructive"
                >
                    {error}
                </p>
            )}
        </div>
    );
}
export function EmptyState({
    title,
    description,
}: {
    title: string;
    description: string;
}) {
    return (
        <div className="rounded-xl border border-dashed px-5 py-10 text-center">
            <p className="text-sm font-medium">{title}</p>
            <p className="mx-auto mt-2 max-w-xs text-xs leading-relaxed text-muted-foreground">
                {description}
            </p>
        </div>
    );
}
export function Pagination({
    page,
}: {
    page: Omit<Paginated<unknown>, 'data'>;
}) {
    if (page.last_page <= 1) return null;
    return (
        <nav
            aria-label="Navigasi halaman"
            className="mt-5 flex flex-wrap items-center justify-between gap-3 text-xs"
        >
            <span className="text-muted-foreground">
                Halaman {page.current_page} dari {page.last_page} · {page.total}{' '}
                entri
            </span>
            <div className="flex gap-2">
                {page.prev_page_url && (
                    <Button variant="outline" size="sm" asChild>
                        <Link href={page.prev_page_url} preserveScroll>
                            Sebelumnya
                        </Link>
                    </Button>
                )}
                {page.next_page_url && (
                    <Button variant="outline" size="sm" asChild>
                        <Link href={page.next_page_url} preserveScroll>
                            Berikutnya
                        </Link>
                    </Button>
                )}
            </div>
        </nav>
    );
}
export function DeleteButton({
    url,
    title,
    description,
    onLocalDelete,
}: {
    url: string;
    title: string;
    description: string;
    onLocalDelete?: () => boolean;
}) {
    const [open, setOpen] = useState(false);
    const form = useForm({});
    const id = useId();
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Hapus ${title}`}
                    className="size-7 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                    <X className="size-4" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Hapus {title}?</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                {form.errors && Object.keys(form.errors).length > 0 && (
                    <p id={id} role="alert" className="text-destructive">
                        Belum dapat menghapus. Silakan coba lagi.
                    </p>
                )}
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => setOpen(false)}
                        disabled={form.processing}
                    >
                        Batal
                    </Button>
                    <Button
                        variant="destructive"
                        disabled={form.processing}
                        onClick={() => {
                            if (onLocalDelete) {
                                if (onLocalDelete()) setOpen(false);
                                return;
                            }
                            form.delete(url, {
                                preserveScroll: true,
                                onSuccess: () => setOpen(false),
                            });
                        }}
                    >
                        {form.processing && <Spinner />}Ya, hapus
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
export const pageClass =
    'mx-auto w-full max-w-[532px] px-8 pt-28 pb-12 sm:px-6 sm:pt-22 sm:pb-20 lg:pt-22';
