import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { GUEST_TASKS_KEY, readGuestTasks } from '@/lib/guest-tasks';
import type { LocalTaskActions, Task, TaskInput } from '@/types/task';

export function useGuestTasks() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [ready, setReady] = useState(false);
    const [issue, setIssue] = useState<string | null>(null);

    useEffect(() => {
        function load() {
            try {
                setTasks(readGuestTasks(localStorage.getItem(GUEST_TASKS_KEY)));
                setIssue(null);
            } catch {
                setIssue(
                    'Tugas di browser belum dapat dibaca. Tugas baru hanya tersimpan selama halaman ini terbuka jika penyimpanan browser tidak tersedia.',
                );
            }
            setReady(true);
        }
        load();
        function onStorage(event: StorageEvent) {
            if (event.key === GUEST_TASKS_KEY || event.key === null) load();
        }
        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }, []);

    function commit(next: Task[], success: string): boolean {
        try {
            localStorage.setItem(GUEST_TASKS_KEY, JSON.stringify(next));
            setIssue(null);
        } catch {
            setIssue(
                'Penyimpanan browser tidak tersedia atau penuh. Perubahan hanya tersimpan sementara selama halaman ini terbuka.',
            );
        }
        setTasks(next);
        toast.success(success);
        return true;
    }

    function add(input: TaskInput): boolean {
        return commit(
            [
                {
                    id: crypto.randomUUID(),
                    title: input.title.trim(),
                    due_date: input.due_date || null,
                    completed_at: null,
                },
                ...tasks,
            ],
            'Tugas ditambahkan.',
        );
    }

    const actions: LocalTaskActions = {
        save: (task, input) =>
            commit(
                tasks.map((item) =>
                    item.id === task.id
                        ? {
                              ...item,
                              title: input.title.trim(),
                              due_date: input.due_date || null,
                          }
                        : item,
                ),
                'Tugas diperbarui.',
            ),
        complete: (task) => {
            commit(
                tasks.map((item) =>
                    item.id === task.id
                        ? {
                              ...item,
                              completed_at: item.completed_at
                                  ? null
                                  : new Date().toISOString(),
                          }
                        : item,
                ),
                task.completed_at
                    ? 'Tugas dibuka kembali.'
                    : 'Tugas selesai. Kerja bagus!',
            );
        },
        removeMany: (ids) =>
            commit(
                tasks.filter((item) => !ids.includes(item.id)),
                `${ids.length} tugas dihapus.`,
            ),
        remove: (task) =>
            commit(
                tasks.filter((item) => item.id !== task.id),
                'Tugas dihapus.',
            ),
    };
    return { tasks, ready, issue, add, actions };
}
