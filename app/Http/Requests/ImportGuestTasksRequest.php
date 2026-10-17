<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ImportGuestTasksRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /** @return array<string, list<string>> */
    public function rules(): array
    {
        return [
            'tasks' => ['required', 'array', 'list', 'min:1', 'max:100'],
            'tasks.*' => ['required', 'array:id,title,due_date,completed_at'],
            'tasks.*.id' => ['required', 'string', 'max:100', 'distinct:strict'],
            'tasks.*.title' => ['required', 'string', 'max:255'],
            'tasks.*.due_date' => ['present', 'nullable', 'date_format:Y-m-d'],
            'tasks.*.completed_at' => ['present', 'nullable', 'date', 'regex:/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/'],
        ];
    }
}
