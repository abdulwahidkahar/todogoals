import { Head, usePage } from '@inertiajs/react';
import { Pagination } from '@/components/tasks/shared';
import { TaskForm } from '@/components/tasks/task-form';
import { TaskList } from '@/components/tasks/task-list';
import { TaskWorkspace } from '@/components/tasks/task-workspace';
import { useImportGuestTasks } from '@/hooks/use-import-guest-tasks';
import { Button } from '@/components/ui/button';
import type { Auth } from '@/types/auth';
import type { Paginated, Task } from '@/types/task';

export default function Tasks({
    tasks,
    filter,
    today,
    activeCount,
}: {
    tasks: Paginated<Task>;
    filter: string;
    today: string;
    activeCount: number;
}) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const { status, retry } = useImportGuestTasks(auth.user.id);
    return (
        <>
            <Head title="Daftar tugas" />
            <TaskWorkspace
                remaining={activeCount}
                pagination={<Pagination page={tasks} />}
            >
                <TaskList
                    composer={
                        <>
                            <TaskForm />
                            {status === 'loading' && (
                                <p
                                    role="status"
                                    className="mt-3 text-sm text-muted-foreground"
                                >
                                    Memindahkan tugas tamu ke akun…
                                </p>
                            )}
                            {status === 'error' && (
                                <div role="alert" className="mt-3 text-sm">
                                    <p>
                                        Tugas tamu belum selesai dipindahkan.
                                        Data di browser tetap disimpan.
                                    </p>
                                    <Button
                                        variant="link"
                                        className="h-auto px-0 py-2"
                                        onClick={retry}
                                    >
                                        Coba lagi
                                    </Button>
                                </div>
                            )}
                        </>
                    }
                    tasks={tasks.data}
                    total={tasks.total}
                    filter={filter}
                    today={today}
                />
            </TaskWorkspace>
        </>
    );
}
