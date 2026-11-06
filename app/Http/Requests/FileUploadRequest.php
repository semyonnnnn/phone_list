<?php

namespace App\Http\Requests;

use App\Enums\Territory;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class FileUploadRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'file' => [
                'required',
                'file',
                'mimes:xlsx,xls',
                'mimetypes:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel',
                'max:10240',
            ],
            'territory' => [
                'required',
                'string',
                // The form now sends the key ('ekb'/'krg'), the same value the DB stores.
                // Rule::in with keys() means a new enum case is accepted here automatically.
                // 'size:3' is removed: `in` already limits the value to the allowed keys,
                // so a length check can never catch anything extra.
                Rule::in(Territory::keys()),
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'file.required' => 'Пожалуйста, выберите файл для загрузки.',
            'file.file' => 'Загруженный объект должен быть действительным файлом.',
            'file.mimes' => 'Файл должен быть таблицей Excel в формате .xlsx или .xls.',
            'file.mimetypes' => 'Файл должен быть таблицей Excel в формате .xlsx или .xls.',
            'file.max' => 'Размер файла не должен превышать 10 МБ.',

            'territory.required' => 'Указание территории обязательно.',
            'territory.string' => 'Территория должна быть текстовым значением!',
            // Built from the enum's Russian values, so the text can't drift out of sync
            // with the allowed list. Gives: "ЕКБ или КРГ".
            'territory.in' => 'Территория может принимать значение только ' . implode(' или ', Territory::values()) . '.',
        ];
    }
}
