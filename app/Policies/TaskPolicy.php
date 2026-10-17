<?php

namespace App\Policies;

use App\Models\Task;
use App\Models\User;

class TaskPolicy
{
    public function update(User $user, Task $record): bool
    {
        return $record->user_id === $user->id;
    }

    public function delete(User $user, Task $record): bool
    {
        return $record->user_id === $user->id;
    }
}
