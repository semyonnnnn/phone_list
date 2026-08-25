<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class FileUploadRequest extends FormRequest
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
            'file' => [
                'required',
                'file',
                'mimes:xlsx,xls',
                'mimetypes:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel',
                'max:10240', // 10MB max limit
            ],
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
            'file.required' => 'Пожалуйста, выберите файл для загрузки.',
            'file.file' => 'Загруженный объект должен быть действительным файлом.',
            'file.mimes' => 'Файл должен быть таблицей Excel в формате .xlsx или .xls.',
            'file.mimetypes' => 'Файл должен быть таблицей Excel в формате .xlsx или .xls.',
            'file.max' => 'Размер файла не должен превышать 10 МБ.',
        ];
    }
}
