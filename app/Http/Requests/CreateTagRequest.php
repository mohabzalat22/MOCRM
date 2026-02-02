<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateTagRequest extends FormRequest
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
            'name' => 'required|string|max:255',
            'color' => 'nullable|string|regex:/^#[0-9A-Fa-f]{6}$/',
            'taggable_id' => 'required|integer',
            'taggable_type' => 'required|string|in:App\Models\Client,App\Models\Project,App\Models\Task',
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
            'name.required' => 'The tag name is required.',
            'name.string' => 'The tag name must be a valid text.',
            'name.max' => 'The tag name cannot exceed 255 characters.',
            'color.string' => 'The color must be a valid text.',
            'color.regex' => 'The color must be a valid hex color code (e.g., #FF5733).',
            'taggable_id.required' => 'The taggable ID is required.',
            'taggable_id.integer' => 'The taggable ID must be a valid number.',
            'taggable_type.required' => 'The taggable type is required.',
            'taggable_type.string' => 'The taggable type must be a valid text.',
            'taggable_type.in' => 'The taggable type must be one of: Client, Project, or Task.',
        ];
    }
}
