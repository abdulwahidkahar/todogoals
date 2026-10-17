import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { AppFrame } from '@/components/app-frame';
import type { BreadcrumbItem } from '@/types';

export default function AppLayout({
    children,
}: {
    breadcrumbs?: BreadcrumbItem[];
    children: React.ReactNode;
}) {
    const { flash } = usePage<{ flash: { success: string | null } }>().props;
    const { url } = usePage();
    useEffect(() => {
        if (flash.success) toast.success(flash.success);
    }, [flash]);
    return (
        <AppFrame settings={url.startsWith('/settings')}>
            <div
                className={
                    url.startsWith('/settings')
                        ? 'mx-auto max-w-4xl px-2 pb-12 sm:px-4'
                        : undefined
                }
            >
                {children}
            </div>
        </AppFrame>
    );
}
