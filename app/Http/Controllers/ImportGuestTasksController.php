<?php

namespace App\Http\Controllers;

use App\Http\Requests\ImportGuestTasksRequest;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;

class ImportGuestTasksController extends Controller
{
    public function __invoke(ImportGuestTasksRequest $request): JsonResponse
    {
        // One atomic statement; the unique key makes retries and concurrent tabs safe.
        $rows = array_map(fn (array $task) => [
            'guest_id' => $task['id'],
            'title' => $task['title'],
            'due_date' => $task['due_date'],
            'completed_at' => $task['completed_at'] === null
                ? null
                : CarbonImmutable::parse($task['completed_at'])->utc()->format('Y-m-d H:i:s'),
        ], $request->validated('tasks'));

        // Only touch guest_id on a duplicate: never overwrite subsequent account edits.
        $request->user()->tasks()->upsert($rows, ['user_id', 'guest_id'], ['guest_id']);

        return response()->json(['imported_ids' => array_column($rows, 'guest_id')]);
    }
}
