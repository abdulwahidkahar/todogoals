<?php

namespace App\Models;

use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $user_id
 * @property string $title
 * @property CarbonImmutable|null $completed_at
 */
#[Fillable(['title', 'due_date'])]
class Task extends Model
{
    protected function casts(): array
    {
        return ['due_date' => 'date:Y-m-d', 'completed_at' => 'immutable_datetime'];
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @param Builder<Task> $query */
    public function scopeFiltered(Builder $query, string $filter): void
    {
        if ($filter === 'active') {
            $query->whereNull('completed_at');
        } elseif ($filter === 'completed') {
            $query->whereNotNull('completed_at');
        }
    }
}
