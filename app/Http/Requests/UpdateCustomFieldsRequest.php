<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCustomFieldsRequest extends FormRequest
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
            'custom_fields' => ['nullable', 'array'],
            'custom_fields.*.key' => ['required', 'string', 'distinct', 'max:255'],
            'custom_fields.*.value' => ['nullable', 'string', 'max:1000'],
        ];
    }

    /**
     * Get custom validation messages.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'custom_fields.array' => 'Custom fields must be sent as a list.',
            'custom_fields.*.key.required' => 'Each custom field must have a name.',
            'custom_fields.*.key.string' => 'Custom field names must be text.',
            'custom_fields.*.key.distinct' => 'Custom field names must be unique.',
            'custom_fields.*.key.max' => 'Custom field names may not exceed 255 characters.',
            'custom_fields.*.value.string' => 'Custom field values must be text.',
            'custom_fields.*.value.max' => 'Custom field values may not exceed 1000 characters.',
        ];
    }
}
