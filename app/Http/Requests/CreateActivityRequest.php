<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateActivityRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'type' => 'required|string|in:call,email,meeting,note,transaction',
            'summary' => 'nullable|string|max:255',
            'data' => 'nullable|array',
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'type.required' => 'The activity type is required.',
            'type.string' => 'The activity type must be a string.',
            'type.in' => 'The selected activity type is invalid.',
            'summary.string' => 'The summary must be a string.',
            'summary.max' => 'The summary may not be greater than 255 characters.',
            'data.array' => 'The data field must be an array.',
        ];
    }
}
