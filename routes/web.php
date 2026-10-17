<?php

use App\Http\Controllers\TaskController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function (Request $request) {
    if ($request->user()) {
        return to_route('tasks.index');
    }

    return Inertia::render('tasks/guest', ['today' => now('Asia/Jakarta')->toDateString()]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::redirect('dashboard', '/tasks')->name('dashboard');
    Route::delete('tasks/bulk', [TaskController::class, 'bulkDestroy'])->name('tasks.bulk-destroy');
    Route::resource('tasks', TaskController::class)->only(['index', 'store', 'update', 'destroy']);
    Route::patch('tasks/{task}/completion', [TaskController::class, 'complete'])->name('tasks.complete');
});

require __DIR__.'/settings.php';
