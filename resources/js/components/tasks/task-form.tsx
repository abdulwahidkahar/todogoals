import { useForm } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useId, useRef } from 'react';
import { Field } from '@/components/tasks/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { taskInputErrors } from '@/lib/guest-tasks';
import type { Task, TaskInput } from '@/types/task';

export function TaskForm({
    task,
    onSaved,
    onLocalSave,
}: {
    task?: Task;
    onSaved?: () => void;
    onLocalSave?: (input: TaskInput) => boolean;
}) {
    const id = useId();
    const input = useRef<HTMLInputElement>(null);
    const form = useForm({
        title: task?.title ?? '',
        due_date: task?.due_date ?? '',
    });
    function finish() {
        if (!task) {
            form.reset();
            input.current?.focus();
        }
        onSaved?.();
    }
    const titleInput = (
        <Input
            ref={input}
            id={`${id}-title`}
            required
            maxLength={255}
            autoFocus={!!task}
            placeholder="Tambah tugas baru"
            className={
                task
                    ? 'h-11'
                    : 'h-11 min-w-0 flex-1 rounded-none border-0 border-b border-input bg-transparent px-1 shadow-none focus-visible:border-primary focus-visible:ring-0 md:text-sm dark:bg-transparent'
            }
            value={form.data.title}
            onChange={(e) => form.setData('title', e.target.value)}
            aria-invalid={!!form.errors.title}
            aria-describedby={
                form.errors.title ? `${id}-title-error` : undefined
            }
        />
    );
    const submit = (
        <Button
            disabled={form.processing}
            type="submit"
            aria-label={task ? 'Simpan perubahan' : 'Tambah tugas'}
            className={
                task
                    ? 'h-10 rounded-lg px-4'
                    : 'size-9 shrink-0 rounded-xl p-0 shadow-none sm:size-11'
            }
        >
            {form.processing ? (
                <Spinner />
            ) : task ? (
                'Simpan perubahan'
            ) : (
                <Plus className="size-6" strokeWidth={1.5} />
            )}
        </Button>
    );
    return (
        <form
            onSubmit={(event) => {
                event.preventDefault();
                if (onLocalSave) {
                    form.clearErrors();
                    const errors = taskInputErrors(form.data);
                    if (Object.keys(errors).length) {
                        form.setError(errors);
                        return;
                    }
                    if (onLocalSave(form.data)) finish();
                    return;
                }
                const settings = { preserveScroll: true, onSuccess: finish };
                if (task) form.patch(`/tasks/${task.id}`, settings);
                else form.post('/tasks', settings);
            }}
            className={task ? 'grid gap-5' : 'grid gap-2'}
        >
            {task ? (
                <Field
                    id={`${id}-title`}
                    label="Judul tugas"
                    error={form.errors.title}
                >
                    {titleInput}
                </Field>
            ) : (
                <div>
                    <Label htmlFor={`${id}-title`} className="sr-only">
                        Mau mengerjakan apa?
                    </Label>
                    <div className="flex items-center gap-3 sm:gap-4">
                        {titleInput}
                        {submit}
                    </div>
                    {form.errors.title && (
                        <p
                            id={`${id}-title-error`}
                            role="alert"
                            className="mt-2 text-xs text-destructive"
                        >
                            {form.errors.title}
                        </p>
                    )}
                </div>
            )}
            {task && (
                <div id={`${id}-date-field`} className="grid gap-2">
                    <Label
                        htmlFor={`${id}-due`}
                        className="text-xs font-normal text-muted-foreground"
                    >
                        Tenggat (opsional)
                    </Label>
                    <Input
                        id={`${id}-due`}
                        type="date"
                        className="h-9 max-w-52 text-xs shadow-none md:text-xs"
                        value={form.data.due_date}
                        onChange={(e) =>
                            form.setData('due_date', e.target.value)
                        }
                        aria-invalid={!!form.errors.due_date}
                        aria-describedby={
                            form.errors.due_date ? `${id}-due-error` : undefined
                        }
                    />
                    {form.errors.due_date && (
                        <p
                            id={`${id}-due-error`}
                            role="alert"
                            className="text-xs text-destructive"
                        >
                            {form.errors.due_date}
                        </p>
                    )}
                </div>
            )}
            {task && (
                <div className="flex justify-end border-t pt-4">{submit}</div>
            )}
        </form>
    );
}
