import { Head } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { AppFrame } from '@/components/app-frame';
import { TaskForm } from '@/components/tasks/task-form';
import { TaskList } from '@/components/tasks/task-list';
import {
    TaskWorkspace,
    TaskWorkspaceHeader,
} from '@/components/tasks/task-workspace';
import { Button } from '@/components/ui/button';
import { useGuestTasks } from '@/hooks/use-guest-tasks';

export default function GuestTasks({ today }: { today: string }) {
    const { tasks, ready, issue, add, actions } = useGuestTasks();
    const [filter, setFilter] = useState('all');
    const [page, setPage] = useState(1);
    const filtered = tasks.filter((task) =>
        filter === 'active'
            ? !task.completed_at
            : filter === 'completed'
              ? !!task.completed_at
              : true,
    );
    const lastPage = Math.max(1, Math.ceil(filtered.length / 15));
    const currentPage = Math.min(page, lastPage);
    return (
        <>
            <Head title="Daftar tugas" />
            <AppFrame>
                <TaskWorkspace
                    guest
                    remaining={
                        tasks.filter((task) => !task.completed_at).length
                    }
                    pagination={
                        lastPage > 1 && (
                            <nav
                                aria-label="Navigasi halaman"
                                className="mt-5 flex items-center justify-between gap-3 text-xs"
                            >
                                <span className="text-muted-foreground">
                                    Halaman {currentPage} dari {lastPage}
                                </span>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={currentPage === 1}
                                        onClick={() => setPage(currentPage - 1)}
                                    >
                                        <ChevronLeft />
                                        Sebelumnya
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={currentPage === lastPage}
                                        onClick={() => setPage(currentPage + 1)}
                                    >
                                        Berikutnya
                                        <ChevronRight />
                                    </Button>
                                </div>
                            </nav>
                        )
                    }
                >
                    {ready ? (
                        <TaskList
                            issue={issue}
                            composer={
                                <TaskForm
                                    onLocalSave={(input) => {
                                        setPage(1);
                                        return add(input);
                                    }}
                                />
                            }
                            tasks={filtered.slice(
                                (currentPage - 1) * 15,
                                currentPage * 15,
                            )}
                            total={filtered.length}
                            filter={filter}
                            today={today}
                            onFilter={(value) => {
                                setFilter(value);
                                setPage(1);
                            }}
                            localActions={actions}
                        />
                    ) : (
                        <>
                            <TaskWorkspaceHeader
                                issue={issue}
                                composer={
                                    <div
                                        role="status"
                                        className="h-11 animate-pulse rounded-xl bg-muted motion-reduce:animate-none"
                                    >
                                        <span className="sr-only">
                                            Memuat tugas…
                                        </span>
                                    </div>
                                }
                            />
                            <div aria-hidden="true" className="grid gap-4 p-6">
                                {[0, 1, 2].map((row) => (
                                    <div
                                        key={row}
                                        className="h-10 animate-pulse rounded-lg bg-muted motion-reduce:animate-none"
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </TaskWorkspace>
            </AppFrame>
        </>
    );
}
