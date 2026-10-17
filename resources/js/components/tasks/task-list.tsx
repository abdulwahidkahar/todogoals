import { router, useForm } from '@inertiajs/react';
import { MoreHorizontal, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { TaskWorkspaceHeader } from '@/components/tasks/task-workspace';
import { EmptyState } from '@/components/tasks/shared';
import { TaskRow } from '@/components/tasks/task-row';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuItem,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import type { LocalTaskActions, Task } from '@/types/task';

const filters = [
    { key: 'all', label: 'Semua' },
    { key: 'active', label: 'Belum selesai' },
    { key: 'completed', label: 'Selesai' },
];
type TaskListProps = {
    composer: ReactNode;
    issue?: string | null;
    tasks: Task[];
    total: number;
    filter: string;
    today: string;
    onFilter?: (filter: string) => void;
    localActions?: LocalTaskActions;
};

export function TaskList(props: TaskListProps) {
    return (
        <SelectableTaskList
            key={JSON.stringify([
                props.filter,
                props.tasks.map((task) => task.id),
            ])}
            {...props}
        />
    );
}

function SelectableTaskList({
    composer,
    issue,
    tasks,
    total,
    filter,
    today,
    onFilter,
    localActions,
}: TaskListProps) {
    const [selected, setSelected] = useState<Task['id'][]>([]);
    const [selectionMode, setSelectionMode] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const form = useForm({ task_ids: [] as Task['id'][], filter });
    const allSelected = tasks.length > 0 && selected.length === tasks.length;
    function toggleTask(id: Task['id'], checked: boolean) {
        form.clearErrors();
        setSelected((current) =>
            checked
                ? [...current, id]
                : current.filter((value) => value !== id),
        );
    }
    function cancelSelection() {
        setSelected([]);
        setSelectionMode(false);
        form.clearErrors();
    }
    function deleteSelected() {
        if (!selected.length) return;
        if (localActions) {
            if (localActions.removeMany(selected)) {
                setConfirmOpen(false);
                cancelSelection();
            }
            return;
        }
        form.transform(() => ({ task_ids: selected, filter }));
        form.delete('/tasks/bulk', {
            preserveScroll: true,
            onSuccess: () => {
                cancelSelection();
                setConfirmOpen(false);
            },
        });
    }
    return (
        <section
            aria-label="Daftar tugas"
            onKeyDown={(e) => {
                if (e.key === 'Escape' && !confirmOpen && !form.processing)
                    cancelSelection();
            }}
        >
            <TaskWorkspaceHeader
                composer={composer}
                issue={issue}
                options={
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="size-11 shrink-0 text-muted-foreground"
                                aria-label="Opsi daftar"
                            >
                                <MoreHorizontal className="size-5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>
                                Tampilkan tugas
                            </DropdownMenuLabel>
                            <DropdownMenuRadioGroup
                                value={filter}
                                onValueChange={(value) => {
                                    if (onFilter) onFilter(value);
                                    else router.get(`/tasks?filter=${value}`);
                                }}
                            >
                                {filters.map((item) => (
                                    <DropdownMenuRadioItem
                                        key={item.key}
                                        value={item.key}
                                    >
                                        {item.label}
                                    </DropdownMenuRadioItem>
                                ))}
                            </DropdownMenuRadioGroup>
                            {tasks.length > 0 && (
                                <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        disabled={form.processing}
                                        onSelect={() =>
                                            selectionMode
                                                ? cancelSelection()
                                                : setSelectionMode(true)
                                        }
                                    >
                                        {selectionMode
                                            ? 'Batal memilih'
                                            : 'Pilih tugas untuk hapus'}
                                    </DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                }
            />
            <span className="sr-only">{total} tugas</span>
            {selectionMode && tasks.length > 0 && (
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-muted/60 px-3 py-2">
                    <label className="flex min-h-8 cursor-pointer items-center gap-2.5 text-xs font-medium">
                        <Checkbox
                            checked={
                                allSelected
                                    ? true
                                    : selected.length
                                      ? 'indeterminate'
                                      : false
                            }
                            disabled={form.processing}
                            onCheckedChange={(checked) => {
                                form.clearErrors();
                                setSelected(
                                    checked === true
                                        ? tasks.map((task) => task.id)
                                        : [],
                                );
                            }}
                            aria-label="Pilih semua tugas di halaman ini"
                        />
                        Pilih semua{' '}
                        <span className="hidden font-normal text-muted-foreground sm:inline">
                            di halaman ini
                        </span>
                    </label>
                    <div className="flex items-center gap-3">
                        <span
                            role="status"
                            className="text-xs text-muted-foreground"
                        >
                            {selected.length} dipilih
                        </span>
                        <Dialog
                            open={confirmOpen}
                            onOpenChange={(open) => {
                                if (!form.processing) {
                                    setConfirmOpen(open);
                                    if (!open) form.clearErrors();
                                }
                            }}
                        >
                            <DialogTrigger asChild>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    className="h-8 gap-1.5 rounded-md px-2.5 text-xs"
                                    disabled={
                                        !selected.length || form.processing
                                    }
                                >
                                    <Trash2 className="size-3.5" />
                                    Hapus terpilih
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>
                                        Hapus {selected.length} tugas terpilih?
                                    </DialogTitle>
                                    <DialogDescription>
                                        Tugas yang dipilih akan dihapus.
                                        Tindakan ini tidak dapat dibatalkan.
                                    </DialogDescription>
                                </DialogHeader>
                                {Object.values(form.errors).length > 0 && (
                                    <div
                                        role="alert"
                                        className="text-sm text-destructive"
                                    >
                                        {Object.values(form.errors).map(
                                            (error, index) => (
                                                <p key={index}>{error}</p>
                                            ),
                                        )}
                                    </div>
                                )}
                                <DialogFooter>
                                    <Button
                                        variant="outline"
                                        disabled={form.processing}
                                        onClick={() => setConfirmOpen(false)}
                                    >
                                        Batal
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        disabled={
                                            form.processing || !selected.length
                                        }
                                        onClick={deleteSelected}
                                    >
                                        {form.processing && <Spinner />}Ya,
                                        hapus {selected.length} tugas
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            )}
            {tasks.length ? (
                <div className="space-y-4 sm:space-y-5">
                    {tasks.map((task) => (
                        <TaskRow
                            key={task.id}
                            task={task}
                            today={today}
                            localActions={localActions}
                            selected={selected.includes(task.id)}
                            onSelectedChange={(checked) =>
                                toggleTask(task.id, checked)
                            }
                            selectionDisabled={form.processing}
                            selectionMode={selectionMode}
                        />
                    ))}
                </div>
            ) : (
                <EmptyState
                    title={
                        filter === 'completed'
                            ? 'Belum ada tugas selesai.'
                            : filter === 'active'
                              ? 'Semua sudah beres!'
                              : 'Mulai dengan satu tugas.'
                    }
                    description={
                        filter === 'completed'
                            ? 'Tugas yang kamu selesaikan akan muncul di sini.'
                            : filter === 'active'
                              ? 'Nikmati jedanya, atau tambahkan rencana berikutnya.'
                              : 'Tulis yang perlu dikerjakan pada kolom di atas.'
                    }
                />
            )}
        </section>
    );
}
