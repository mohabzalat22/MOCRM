<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateProjectTemplateTaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'project_template_id' => 'required|exists:project_templates,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'priority' => 'required|string',
            'is_milestone' => 'boolean',
            'parent_id' => 'nullable|exists:project_template_tasks,id',
            'order' => 'integer',
        ];
    }
}
