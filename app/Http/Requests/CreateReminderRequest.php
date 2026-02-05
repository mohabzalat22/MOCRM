<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateReminderRequest extends FormRequest
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
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'priority' => 'required|in:low,medium,high',
            'reminder_at' => 'required|date',
            'remindable_id' => 'sometimes|nullable|integer',
            'remindable_type' => 'sometimes|nullable|string|required_with:remindable_id',
            'is_recurring' => 'boolean',
            'recurrence_pattern' => 'nullable|required_if:is_recurring,true|in:daily,weekly,monthly,quarterly,yearly,custom',
            'recurrence_interval' => 'nullable|integer|min:1',
            'recurrence_end_date' => 'nullable|date|after:reminder_at',
        ];
    }
}
