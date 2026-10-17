<?php

use App\Models\User;

function guestTask(array $overrides = []): array
{
    return array_replace([
        'id' => 'guest-123',
        'title' => 'Tugas dari browser',
        'due_date' => '2026-12-01',
        'completed_at' => '2026-10-17T10:00:00+07:00',
    ], $overrides);
}

it('requires authentication to import guest tasks', function () {
    $this->postJson('/tasks/import', ['tasks' => [guestTask()]])->assertUnauthorized();
    $this->assertDatabaseCount('tasks', 0);
});

it('imports tasks into the authenticated account and preserves dates and completion in UTC', function () {
    $user = User::factory()->create();
    $other = User::factory()->create();
    $this->actingAs($user)->postJson('/tasks/import', [
        'user_id' => $other->id,
        'tasks' => [guestTask(), guestTask(['id' => 'guest-456', 'due_date' => null, 'completed_at' => null])],
    ])->assertOk()->assertExactJson(['imported_ids' => ['guest-123', 'guest-456']]);
    $this->assertDatabaseHas('tasks', [
        'user_id' => $user->id, 'guest_id' => 'guest-123', 'title' => 'Tugas dari browser',
        'due_date' => '2026-12-01', 'completed_at' => '2026-10-17 03:00:00',
    ]);
    $this->assertDatabaseHas('tasks', [
        'user_id' => $user->id, 'guest_id' => 'guest-456', 'due_date' => null, 'completed_at' => null,
    ]);
    expect($other->tasks()->count())->toBe(0);
});

it('makes retries idempotent without overwriting account edits or completion', function () {
    $user = User::factory()->create();
    $this->actingAs($user)->postJson('/tasks/import', ['tasks' => [guestTask()]])->assertOk();
    $task = $user->tasks()->firstOrFail();
    $task->title = 'Diubah di akun';
    $task->completed_at = null;
    $task->save();
    $this->postJson('/tasks/import', ['tasks' => [guestTask()]])->assertOk();
    expect($user->tasks()->count())->toBe(1)
        ->and($task->fresh()->title)->toBe('Diubah di akun')
        ->and($task->fresh()->completed_at)->toBeNull();
});

it('scopes guest identifiers to each owner and never modifies another users tasks', function () {
    $first = User::factory()->create();
    $second = User::factory()->create();
    $this->actingAs($first)->postJson('/tasks/import', ['tasks' => [guestTask()]])->assertOk();
    $this->actingAs($second)->postJson('/tasks/import', ['tasks' => [guestTask(['title' => 'Milik kedua'])]])->assertOk();
    expect($first->tasks()->sole()->title)->toBe('Tugas dari browser')
        ->and($second->tasks()->sole()->title)->toBe('Milik kedua');
});

it('rejects invalid batches without importing any tasks', function (array $tasks, string $field) {
    $user = User::factory()->create();
    $this->actingAs($user)->postJson('/tasks/import', ['tasks' => $tasks])
        ->assertUnprocessable()->assertJsonValidationErrors($field);
    $this->assertDatabaseCount('tasks', 0);
})->with([
    [[], 'tasks'],
    [[guestTask(), guestTask()], 'tasks.0.id'],
    [[guestTask(['id' => str_repeat('a', 101)])], 'tasks.0.id'],
    [[guestTask(['title' => '   '])], 'tasks.0.title'],
    [[guestTask(), guestTask(['id' => 'other', 'title' => str_repeat('a', 256)])], 'tasks.1.title'],
    [[guestTask(['due_date' => '2026-02-30'])], 'tasks.0.due_date'],
    [[guestTask(['completed_at' => 'invalid'])], 'tasks.0.completed_at'],
    [[guestTask(['completed_at' => '2026-10-17 10:00:00'])], 'tasks.0.completed_at'],
    [[guestTask(['user_id' => 99])], 'tasks.0'],
    [array_map(fn ($i) => guestTask(['id' => 'task-'.$i]), range(1, 101)), 'tasks'],
]);
