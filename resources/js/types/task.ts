export type Task = {
    id: number | string;
    title: string;
    due_date: string | null;
    completed_at: string | null;
};
export type Paginated<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
};

export type TaskInput = { title: string; due_date: string };
export type LocalTaskActions = {
    save: (task: Task, input: TaskInput) => boolean;
    complete: (task: Task) => void;
    remove: (task: Task) => boolean;
    removeMany: (ids: Task['id'][]) => boolean;
};
