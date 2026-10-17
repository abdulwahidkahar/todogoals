<?php

namespace App\Http\Controllers;

use App\Http\Requests\BulkDeleteTasksRequest;
use App\Http\Requests\CompletionRequest;
use App\Http\Requests\TaskIndexRequest;
use App\Http\Requests\TaskRequest;
use App\Models\Task;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class TaskController extends Controller
{
    public function index(TaskIndexRequest $request): Response
    {
        $filter = (string) $request->validated('filter', 'all');

        return Inertia::render('tasks/index', [
            'tasks' => $request->user()->tasks()->filtered($filter)->latest('id')->paginate(15)->withQueryString(),
            'activeCount' => $request->user()->tasks()->whereNull('completed_at')->count(),
            'filter' => $filter,
            'today' => now('Asia/Jakarta')->toDateString(),
        ]);
    }

    public function store(TaskRequest $request): RedirectResponse
    {
        $request->user()->tasks()->create($request->validated());

        return back()->with('success', 'Tugas ditambahkan.');
    }

    public function update(TaskRequest $request, Task $task): RedirectResponse
    {
        Gate::authorize('update', $task);
        $task->update($request->validated());

        return back()->with('success', 'Tugas diperbarui.');
    }

    public function complete(CompletionRequest $request, Task $task): RedirectResponse
    {
        Gate::authorize('update', $task);
        $task->completed_at = $request->boolean('completed') ? ($task->completed_at ?? now()) : null;
        $task->save();

        return back()->with('success', $task->completed_at ? 'Tugas selesai. Kerja bagus!' : 'Tugas dibuka kembali.');
    }

    public function bulkDestroy(BulkDeleteTasksRequest $request): RedirectResponse
    {
        $count = $request->user()->tasks()->whereKey($request->array('task_ids'))->delete();

        return to_route('tasks.index', ['filter' => $request->validated('filter', 'all')])
            ->with('success', $count.' tugas dihapus.');
    }

    public function destroy(Task $task): RedirectResponse
    {
        Gate::authorize('delete', $task);
        $task->delete();

        return back()->with('success', 'Tugas dihapus.');
    }
}
