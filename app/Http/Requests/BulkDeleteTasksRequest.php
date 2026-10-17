<?php

namespace App\Http\Requests;

use Closure;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class BulkDeleteTasksRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'task_ids' => ['required', 'array', 'list', 'min:1', 'max:100'],
            'task_ids.*' => ['required', 'integer', 'distinct'],
            'filter' => ['sometimes', Rule::in(['all', 'active', 'completed'])],
        ];
    }

    /** @return array<Closure(Validator): void> */
    public function after(): array
    {
        return [function (Validator $validator): void {
            if ($validator->errors()->isNotEmpty()) {
                return;
            }

            $ids = $this->array('task_ids');
            if ($this->user()->tasks()->whereKey($ids)->count() !== count($ids)) {
                $validator->errors()->add('task_ids', 'Ada tugas yang tidak ditemukan atau bukan milik Anda. Muat ulang daftar dan coba lagi.');
            }
        }];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'task_ids.required' => 'Pilih setidaknya satu tugas.',
            'task_ids.array' => 'Pilihan tugas tidak valid.',
            'task_ids.list' => 'Pilihan tugas tidak valid.',
            'task_ids.min' => 'Pilih setidaknya satu tugas.',
            'task_ids.max' => 'Maksimal 100 tugas dalam sekali hapus.',
            'task_ids.*.required' => 'Pilihan tugas tidak valid.',
            'task_ids.*.integer' => 'Pilihan tugas tidak valid.',
            'task_ids.*.distinct' => 'Tugas yang sama tidak boleh dipilih dua kali.',
        ];
    }
}
