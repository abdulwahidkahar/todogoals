import { useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';
import { DeleteButton } from '@/components/tasks/shared';
import { TaskForm } from '@/components/tasks/task-form';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import { calendarDate } from '@/lib/dates';
import type { LocalTaskActions, Task } from '@/types/task';

export function TaskRow({
    task,
    today,
    localActions,
    selected,
    onSelectedChange,
    selectionDisabled,
    selectionMode = false,
}: {
    task: Task;
    today: string;
    localActions?: LocalTaskActions;
    selected: boolean;
    onSelectedChange: (selected: boolean) => void;
    selectionDisabled?: boolean;
    selectionMode?: boolean;
}) {
    const form = useForm({ completed: !task.completed_at });
    const [open, setOpen] = useState(false);
    const titleButton = useRef<HTMLButtonElement>(null);
    const overdue =
        !!task.due_date && task.due_date < today && !task.completed_at;
    const textClass = `text-left text-sm leading-relaxed sm:text-[15px] break-words ${task.completed_at ? 'text-muted-foreground line-through decoration-muted-foreground/60' : 'font-medium text-foreground'}`;
    return (
        <div
            className={`flex min-h-12 items-center gap-3 rounded-2xl border border-input/70 px-4 py-3 sm:min-h-16 ${selected && selectionMode ? 'bg-muted/60' : 'bg-card'}`}
        >
            <label className="flex size-6 shrink-0 cursor-pointer items-center justify-center">
                {form.processing ? (
                    <Spinner />
                ) : (
                    <Checkbox
                        className="size-4 rounded-[2px] shadow-none sm:size-5"
                        checked={selectionMode ? selected : !!task.completed_at}
                        onCheckedChange={(checked) => {
                            if (selectionMode) {
                                onSelectedChange(checked === true);
                                return;
                            }
                            if (localActions) {
                                localActions.complete(task);
                                return;
                            }
                            form.transform(() => ({
                                completed: checked === true,
                            }));
                            form.patch(`/tasks/${task.id}/completion`, {
                                preserveScroll: true,
                            });
                        }}
                        disabled={
                            selectionMode ? selectionDisabled : form.processing
                        }
                        aria-label={
                            selectionMode
                                ? `Pilih tugas ${task.title}`
                                : `${task.completed_at ? 'Buka kembali' : 'Selesaikan'} tugas ${task.title}`
                        }
                    />
                )}
            </label>
            <div className="min-w-0 flex-1">
                {selectionMode ? (
                    <p className={textClass}>{task.title}</p>
                ) : (
                    <button
                        ref={titleButton}
                        type="button"
                        onClick={() => setOpen(true)}
                        className={`w-full rounded outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${textClass}`}
                        aria-label={`Ubah tugas ${task.title}`}
                        title="Ubah tugas"
                    >
                        {task.title}
                    </button>
                )}
                {task.due_date && (
                    <p
                        className={`mt-0.5 text-[11px] ${overdue ? 'text-destructive' : 'text-muted-foreground'}`}
                    >
                        {overdue ? 'Terlewat · ' : ''}
                        {calendarDate(task.due_date)}
                    </p>
                )}
                {form.errors.completed && (
                    <p role="alert" className="mt-1 text-xs text-destructive">
                        {form.errors.completed}
                    </p>
                )}
            </div>
            {!selectionMode && (
                <DeleteButton
                    url={`/tasks/${task.id}`}
                    onLocalDelete={
                        localActions
                            ? () => localActions.remove(task)
                            : undefined
                    }
                    title={`tugas “${task.title}”`}
                    description="Tugas yang dihapus tidak dapat dikembalikan."
                />
            )}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent
                    onCloseAutoFocus={(event) => {
                        event.preventDefault();
                        titleButton.current?.focus();
                    }}
                >
                    <DialogHeader>
                        <DialogTitle>Ubah tugas</DialogTitle>
                        <DialogDescription>
                            Perbarui judul atau tenggat tugasmu.
                        </DialogDescription>
                    </DialogHeader>
                    <TaskForm
                        key={`${task.id}-${open}`}
                        task={task}
                        onSaved={() => setOpen(false)}
                        onLocalSave={
                            localActions
                                ? (input) => localActions.save(task, input)
                                : undefined
                        }
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}
