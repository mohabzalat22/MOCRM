<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateActivityRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation()
    {
        if (is_string($this->data)) {
            $this->merge([
                'data' => json_decode($this->data, true),
            ]);
        }
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
            'occurred_at' => 'nullable|date',
            'tags' => 'nullable|array',
            'tags.*.name' => 'required_with:tags|string',
            'tags.*.color' => 'nullable|string',
            'attachments' => 'nullable|array',
            'attachments.*' => 'file|max:10240',
            'removed_attachment_ids' => 'nullable|array',
            'removed_attachment_ids.*' => 'integer|exists:attachments,id',
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
            'occurred_at.date' => 'The occurrence date must be a valid date.',
            'tags.array' => 'The tags must be an array.',
            'tags.*.name.required_with' => 'The tag name is required when tags are provided.',
            'tags.*.name.string' => 'The tag name must be a string.',
            'tags.*.color.string' => 'The tag color must be a string.',
            'attachments.array' => 'The attachments must be an array.',
            'attachments.*.file' => 'Each attachment must be a file.',
            'attachments.*.max' => 'Each attachment may not be greater than 10MB.',
            'removed_attachment_ids.array' => 'The removed attachment IDs must be an array.',
            'removed_attachment_ids.*.integer' => 'Each removed attachment ID must be an integer.',
            'removed_attachment_ids.*.exists' => 'One or more of the selected attachments to remove are invalid.',
        ];
    }
}
