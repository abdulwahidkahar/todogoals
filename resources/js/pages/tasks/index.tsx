import { Head } from '@inertiajs/react';
import { Pagination } from '@/components/tasks/shared';
import { TaskForm } from '@/components/tasks/task-form';
import { TaskList } from '@/components/tasks/task-list';
import { TaskWorkspace } from '@/components/tasks/task-workspace';
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
    return (
        <>
            <Head title="Daftar tugas" />
            <TaskWorkspace
                remaining={activeCount}
                pagination={<Pagination page={tasks} />}
            >
                <TaskList
                    composer={<TaskForm />}
                    tasks={tasks.data}
                    total={tasks.total}
                    filter={filter}
                    today={today}
                />
            </TaskWorkspace>
        </>
    );
}
