<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ReorderProjectTemplateTasksRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'tasks' => 'required|array',
            'tasks.*.id' => 'required|exists:project_template_tasks,id',
            'tasks.*.order' => 'required|integer',
        ];
    }
}
