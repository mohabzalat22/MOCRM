<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class BulkUpdateRequest extends FormRequest
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
            'ids' => 'required|array',
            'ids.*' => 'exists:clients,id',
            'action' => 'required|string|in:change_status,add_tag',
            'status' => 'required_if:action,change_status|string',
            'tag_id' => 'required_if:action,add_tag|exists:tags,id',
        ];
    }

    /**
     * Get the error messages for the defined validation rules.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'ids.required' => 'Please select at least one client.',
            'ids.array' => 'The selected IDs must be an array.',
            'ids.*.exists' => 'One or more selected clients are invalid.',
            'action.required' => 'Please select an action to perform.',
            'action.in' => 'The selected action is invalid.',
            'status.required_if' => 'Please select a status to apply.',
            'tag_id.required_if' => 'Please select a tag to add.',
            'tag_id.exists' => 'The selected tag does not exist.',
        ];
    }
}
