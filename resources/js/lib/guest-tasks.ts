import type { Task, TaskInput } from '@/types/task';

export const GUEST_TASKS_KEY = 'todogoals.guest-tasks.v1';

export function validDueDate(value: string): boolean {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const date = new Date(`${value}T12:00:00Z`);
    return (
        !Number.isNaN(date.getTime()) &&
        date.toISOString().slice(0, 10) === value
    );
}

export function taskInputErrors(
    input: TaskInput,
): Partial<Record<keyof TaskInput, string>> {
    const errors: Partial<Record<keyof TaskInput, string>> = {};
    if (!input.title.trim()) errors.title = 'Judul wajib diisi.';
    else if (Array.from(input.title.trim()).length > 255)
        errors.title = 'Judul maksimal 255 karakter.';
    if (input.due_date && !validDueDate(input.due_date))
        errors.due_date = 'Gunakan tanggal yang valid.';
    return errors;
}

export function readGuestTasks(raw: string | null): Task[] {
    if (raw === null) return [];
    const data: unknown = JSON.parse(raw);
    if (!Array.isArray(data)) throw new Error('Format tugas tidak valid.');
    const ids = new Set<string>();
    return data.map((item: unknown) => {
        if (typeof item !== 'object' || item === null)
            throw new Error('Tugas tidak valid.');
        const task = item as Record<string, unknown>;
        if (
            typeof task.id !== 'string' ||
            !task.id ||
            ids.has(task.id) ||
            typeof task.title !== 'string' ||
            !task.title.trim() ||
            Array.from(task.title).length > 255 ||
            (task.due_date !== null &&
                (typeof task.due_date !== 'string' ||
                    !validDueDate(task.due_date))) ||
            (task.completed_at !== null &&
                (typeof task.completed_at !== 'string' ||
                    Number.isNaN(Date.parse(task.completed_at))))
        ) {
            throw new Error('Tugas tidak valid.');
        }
        ids.add(task.id);
        return {
            id: task.id,
            title: task.title,
            due_date: task.due_date as string | null,
            completed_at: task.completed_at as string | null,
        };
    });
}
