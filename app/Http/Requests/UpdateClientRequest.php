<?php

namespace App\Http\Requests;

use App\Enums\ClientStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateClientRequest extends FormRequest
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
        $clientId = $this->route('client');

        return [
            'name' => ['sometimes', 'required', 'max:255'],
            'company_name' => ['sometimes', 'max:255'],
            'email' => ['sometimes', 'required', 'email', Rule::unique('clients')->ignore($clientId)],
            'phone' => ['nullable', 'regex:/^\+?[0-9]{10,15}$/'],
            'website' => ['sometimes', 'max:255'],
            'address' => ['sometimes', 'max:255'],
            'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp'],
            'custom_fields' => ['sometimes', 'nullable', 'array'],
            'custom_fields.*.key' => ['required', 'string', 'distinct', 'max:255'],
            'custom_fields.*.value' => ['nullable', 'string', 'max:1000'],
            'status' => ['sometimes', Rule::in(array_column(ClientStatus::cases(), 'value'))],
        ];
    }

    /**
     * Return validation messages
     *
     * @return array{address.max: string, company_name.max: string, email.required: string, image.image: string, name.max: string, name.required: string, phone.regex: string, website.max: string}
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Client name is required.',
            'name.max' => 'Client name must not exceed 255 characters.',
            'company_name.max' => 'Company name must not exceed 255 characters',
            'email.required' => 'email address is required.',
            'phone.regex' => 'phone number is not compatible.',
            'website.max' => 'website must not exceed 255 characters',
            'address.max' => 'address must not exceed 255 characters',
            'image.image' => 'image should be of types [jpg, jpeg, png, webp]',
            'custom_fields.array' => 'Custom fields must be sent as a list.',
            'custom_fields.*.key.required' => 'Each custom field must have a name.',
            'custom_fields.*.key.string' => 'Custom field names must be text.',
            'custom_fields.*.key.distinct' => 'Custom field names must be unique.',
            'custom_fields.*.key.max' => 'Custom field names may not exceed 255 characters.',
            'custom_fields.*.value.string' => 'Custom field values must be text.',
            'custom_fields.*.value.max' => 'Custom field values may not exceed 1000 characters.',
            'status.in' => 'The selected status is invalid.',
        ];
    }
}
