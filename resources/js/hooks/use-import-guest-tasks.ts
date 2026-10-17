import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { GUEST_TASKS_KEY, readGuestTasks } from '@/lib/guest-tasks';

export function useImportGuestTasks(userId: number) {
    const [attempt, setAttempt] = useState(0);
    const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');

    useEffect(() => {
        const controller = new AbortController();
        async function transfer() {
            let acknowledged = false;
            try {
                const snapshot = readGuestTasks(
                    localStorage.getItem(GUEST_TASKS_KEY),
                );
                if (!snapshot.length) return;
                setStatus('loading');
                for (let offset = 0; offset < snapshot.length; offset += 100) {
                    const batch = snapshot.slice(offset, offset + 100);
                    const csrfCookie = document.cookie
                        .split('; ')
                        .find((cookie) => cookie.startsWith('XSRF-TOKEN='));
                    if (!csrfCookie) throw new Error('Session unavailable');
                    const response = await fetch('/tasks/import', {
                        method: 'POST',
                        credentials: 'same-origin',
                        signal: controller.signal,
                        headers: {
                            'Content-Type': 'application/json',
                            Accept: 'application/json',
                            'X-XSRF-TOKEN': decodeURIComponent(
                                csrfCookie.slice('XSRF-TOKEN='.length),
                            ),
                        },
                        body: JSON.stringify({ tasks: batch }),
                    });
                    if (!response.ok) throw new Error('Import failed');
                    const result: { imported_ids: string[] } =
                        await response.json();
                    if (controller.signal.aborted) return;
                    if (
                        !Array.isArray(result.imported_ids) ||
                        batch.some(
                            (task) =>
                                !result.imported_ids.includes(String(task.id)),
                        )
                    ) {
                        throw new Error('Incomplete acknowledgement');
                    }
                    acknowledged = true;
                    // Preserve tasks added or edited in another tab while the request was running.
                    const imported = new Map(
                        batch.map((task) => [task.id, JSON.stringify(task)]),
                    );
                    const remaining = readGuestTasks(
                        localStorage.getItem(GUEST_TASKS_KEY),
                    ).filter(
                        (task) =>
                            imported.get(task.id) !== JSON.stringify(task),
                    );
                    if (remaining.length)
                        localStorage.setItem(
                            GUEST_TASKS_KEY,
                            JSON.stringify(remaining),
                        );
                    else localStorage.removeItem(GUEST_TASKS_KEY);
                }
                setStatus('idle');
                toast.success('Tugas tamu berhasil ditambahkan ke akun.');
                router.reload({ only: ['tasks', 'activeCount'] });
            } catch {
                if (controller.signal.aborted) return;
                setStatus('error');
                if (acknowledged)
                    router.reload({ only: ['tasks', 'activeCount'] });
            }
        }
        void transfer();
        return () => controller.abort();
    }, [attempt, userId]);

    return { status, retry: () => setAttempt((value) => value + 1) };
}
