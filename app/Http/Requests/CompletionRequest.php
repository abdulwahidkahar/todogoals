<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CompletionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /** @return array<string, list<string>> */
    public function rules(): array
    {
        return ['completed' => ['required', 'boolean']];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return ['completed.required' => 'Pilih status penyelesaian.', 'completed.boolean' => 'Status penyelesaian tidak valid.'];
    }
}
