<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateClientRequest extends FormRequest
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
            "name" => ['required', 'max:255'],
            "company_name" => ['max:255'],
            "email" => ['required', 'email', 'unique:clients,email'],
            "phone" => ['nullable', 'regex:/^\+?[0-9]{10,15}$/'],
            "website" => ['max:255'],
            "address" => ['max:255'],
            "image" => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp']
        ];
    }

    /**
     * Return validation messages
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
            'image.image' => 'image should be of types [jpg, jpeg, png, webp]'
        ];
    }
}
