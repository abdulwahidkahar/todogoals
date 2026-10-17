<?php

use App\Models\User;
use Carbon\CarbonImmutable;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->other = User::factory()->create();
    $this->task = $this->user->tasks()->create(['title' => 'Belajar Laravel']);
});

it('requires authentication for every task route', function (string $method, string $path) {
    $this->{$method}($path)->assertRedirect('/login');
})->with([
    ['get', '/tasks'], ['post', '/tasks'], ['patch', '/tasks/1'],
    ['delete', '/tasks/1'], ['patch', '/tasks/1/completion'],
]);

it('creates a task with optional due date and ignores client ownership or completion', function () {
    $this->actingAs($this->user)->post('/tasks', [
        'title' => 'Latihan ujian', 'due_date' => '2026-12-01',
        'user_id' => $this->other->id, 'completed_at' => now(),
    ])->assertSessionHasNoErrors()->assertSessionHas('success');
    $this->assertDatabaseHas('tasks', [
        'title' => 'Latihan ujian', 'user_id' => $this->user->id,
        'due_date' => '2026-12-01', 'completed_at' => null,
    ]);
    $this->post('/tasks', ['title' => 'Tanpa tenggat'])->assertSessionHasNoErrors();
    $this->assertDatabaseHas('tasks', ['title' => 'Tanpa tenggat', 'due_date' => null]);
});

it('updates title and clears optional date without changing owner', function () {
    $this->task->update(['due_date' => '2026-12-01']);
    $this->actingAs($this->user)->patch('/tasks/'.$this->task->id, [
        'title' => 'Latihan soal', 'due_date' => '', 'user_id' => $this->other->id,
    ])->assertSessionHasNoErrors()->assertSessionHas('success');
    expect($this->task->fresh()->title)->toBe('Latihan soal')
        ->and($this->task->fresh()->due_date)->toBeNull()
        ->and($this->task->fresh()->user_id)->toBe($this->user->id);
});

it('validates task input on both create and update', function (array $payload, string $field) {
    $this->actingAs($this->user)->post('/tasks', $payload)->assertSessionHasErrors($field);
    $this->patch('/tasks/'.$this->task->id, $payload)->assertSessionHasErrors($field);
    expect($this->task->fresh()->title)->toBe('Belajar Laravel');
})->with([
    [['title' => ''], 'title'], [['title' => '   '], 'title'],
    [['title' => str_repeat('a', 256)], 'title'],
    [['title' => ['invalid']], 'title'],
    [['title' => 'A', 'due_date' => '2026-02-30'], 'due_date'],
    [['title' => 'A', 'due_date' => 'besok'], 'due_date'],
]);

it('completes reopens and preserves completion time on repeated requests', function () {
    $this->travelTo(CarbonImmutable::parse('2026-10-17T18:00:00Z'));
    $url = '/tasks/'.$this->task->id.'/completion';
    $this->actingAs($this->user)->patch($url, ['completed' => true])->assertSessionHasNoErrors();
    $completed = $this->task->fresh()->completed_at;
    expect($completed?->toIso8601String())->toBe('2026-10-17T18:00:00+00:00');
    $this->travel(1)->hour();
    $this->patch($url, ['completed' => true]);
    expect($this->task->fresh()->completed_at->equalTo($completed))->toBeTrue();
    $this->patch($url, ['completed' => false])->assertSessionHas('success');
    expect($this->task->fresh()->completed_at)->toBeNull();
});

it('rejects invalid completion input', function () {
    $this->actingAs($this->user)->patch('/tasks/'.$this->task->id.'/completion', ['completed' => 'invalid'])->assertSessionHasErrors('completed');
    $this->patch('/tasks/'.$this->task->id.'/completion', [])->assertSessionHasErrors('completed');
    expect($this->task->fresh()->completed_at)->toBeNull();
});

it('deletes an owned task', function () {
    $this->actingAs($this->user)->delete('/tasks/'.$this->task->id)->assertSessionHas('success');
    $this->assertModelMissing($this->task);
});

it('forbids cross user mutations', function (string $method, string $suffix, array $payload) {
    $this->actingAs($this->other)->{$method}('/tasks/'.$this->task->id.$suffix, $payload)->assertForbidden();
    expect($this->task->fresh()->title)->toBe('Belajar Laravel')->and($this->task->fresh()->completed_at)->toBeNull();
})->with([
    ['patch', '', ['title' => 'Diubah']], ['delete', '', []],
    ['patch', '/completion', ['completed' => true]],
]);

it('lists only owned tasks and applies completion filters', function (string $filter, int $count) {
    $done = $this->user->tasks()->create(['title' => 'Selesai']);
    $done->completed_at = now();
    $done->save();
    $this->other->tasks()->create(['title' => 'Rahasia']);
    $this->actingAs($this->user)->get('/tasks?filter='.$filter)->assertInertia(fn (Assert $page) => $page
        ->component('tasks/index')->has('tasks.data', $count)->where('tasks.total', $count));
    if ($filter === 'completed') {
        $this->get('/tasks?filter=completed')->assertInertia(fn (Assert $page) => $page->where('tasks.data.0.title', 'Selesai'));
    }
    $this->actingAs($this->other)->get('/tasks')->assertInertia(fn (Assert $page) => $page->has('tasks.data', 1)->where('tasks.data.0.title', 'Rahasia'));
})->with([['all', 2], ['active', 1], ['completed', 1]]);

it('paginates tasks and uses the Jakarta calendar date', function () {
    $this->travelTo(CarbonImmutable::parse('2026-10-17T18:00:00Z'));
    for ($i = 0; $i < 20; $i++) {
        $this->user->tasks()->create(['title' => 'Tugas '.$i]);
    }
    $this->actingAs($this->user)->get('/tasks')->assertInertia(fn (Assert $page) => $page
        ->has('tasks.data', 15)->where('tasks.total', 21)->where('today', '2026-10-18'));
    $this->get('/tasks?page=2')->assertInertia(fn (Assert $page) => $page->has('tasks.data', 6));
    $this->get('/tasks?filter=invalid')->assertSessionHasErrors('filter');
});

it('returns not found for missing tasks', function () {
    $this->actingAs($this->user)->patch('/tasks/999999', ['title' => 'Missing'])->assertNotFound();
    $this->delete('/tasks/999999')->assertNotFound();
});

it('opens the guest todolist directly without exposing account tasks', function () {
    $this->get('/')->assertOk()->assertInertia(fn (Assert $page) => $page
        ->component('tasks/guest')->where('auth.user', null)->missing('tasks'));
    $this->assertDatabaseCount('tasks', 1);
});

it('sends authenticated home visitors to their database task list', function () {
    $this->actingAs($this->user)->get('/')->assertRedirect('/tasks');
});

it('returns to the guest list after logout without exposing database tasks', function () {
    $this->actingAs($this->user)->post('/logout')->assertRedirect('/');
    $this->get('/')->assertOk()->assertInertia(fn (Assert $page) => $page
        ->component('tasks/guest')->where('auth.user', null)->missing('tasks'));
    $this->assertDatabaseHas('tasks', ['id' => $this->task->id, 'user_id' => $this->user->id]);
});

it('requires login before deleting selected tasks', function () {
    $this->delete('/tasks/bulk', ['task_ids' => [$this->task->id]])->assertRedirect('/login');
    $this->assertModelExists($this->task);
});

it('deletes only the selected owned tasks and preserves the filter', function () {
    $second = $this->user->tasks()->create(['title' => 'Tugas kedua']);
    $unselected = $this->user->tasks()->create(['title' => 'Tetap ada']);
    $otherTask = $this->other->tasks()->create(['title' => 'Milik pengguna lain']);

    $this->actingAs($this->user)->delete('/tasks/bulk', [
        'task_ids' => [$this->task->id, $second->id],
        'filter' => 'active',
        'user_id' => $this->other->id,
    ])->assertSessionHasNoErrors()->assertRedirect('/tasks?filter=active')->assertSessionHas('success', '2 tugas dihapus.');

    $this->assertModelMissing($this->task);
    $this->assertModelMissing($second);
    $this->assertModelExists($unselected);
    $this->assertModelExists($otherTask);
});

it('rejects the entire selection if any task belongs to another user', function () {
    $otherTask = $this->other->tasks()->create(['title' => 'Rahasia']);
    $this->actingAs($this->user)->delete('/tasks/bulk', [
        'task_ids' => [$this->task->id, $otherTask->id],
    ])->assertSessionHasErrors('task_ids');
    $this->assertModelExists($this->task);
    $this->assertModelExists($otherTask);
});

it('rejects the entire selection if any task no longer exists', function () {
    $this->actingAs($this->user)->delete('/tasks/bulk', [
        'task_ids' => [$this->task->id, 999999999],
    ])->assertSessionHasErrors('task_ids');
    $this->assertModelExists($this->task);
});

it('validates bulk deletion before mutating data', function (array $payload, string $field) {
    $this->actingAs($this->user)->delete('/tasks/bulk', $payload)->assertSessionHasErrors($field);
    $this->assertModelExists($this->task);
})->with([
    [[], 'task_ids'],
    [['task_ids' => []], 'task_ids'],
    [['task_ids' => 'all'], 'task_ids'],
    [['task_ids' => ['invalid']], 'task_ids.0'],
    [['task_ids' => [[1, 2]]], 'task_ids.0'],
    [['task_ids' => [1, 1]], 'task_ids.0'],
    [['task_ids' => range(1, 101)], 'task_ids'],
    [['task_ids' => ['first' => 1]], 'task_ids'],
    [['task_ids' => [1], 'filter' => 'invalid'], 'filter'],
]);

it('counts remaining owned tasks across all filters', function () {
    $done = $this->user->tasks()->create(['title' => 'Sudah selesai']);
    $done->completed_at = now();
    $done->save();
    $this->other->tasks()->create(['title' => 'Tugas pengguna lain']);

    $this->actingAs($this->user)->get('/tasks?filter=completed')->assertInertia(fn (Assert $page) => $page
        ->where('activeCount', 1)->has('tasks.data', 1));
    $this->patch('/tasks/'.$this->task->id.'/completion', ['completed' => true])->assertSessionHasNoErrors();
    $this->get('/tasks')->assertInertia(fn (Assert $page) => $page->where('activeCount', 0));
});
