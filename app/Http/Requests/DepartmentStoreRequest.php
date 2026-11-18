<?php

namespace App\Http\Requests;

use App\Enums\Territory;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class DepartmentStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('departments', 'name')->where(
                    fn($query) => $query->where('territory', $this->input('territory'))
                ),
            ],
            'territory' => [
                'required',
                'string',
                Rule::in(Territory::keys()),
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Укажите название отдела.',
            'name.string' => 'Название отдела должно быть текстовым значением.',
            'name.max' => 'Название отдела не должно превышать 255 символов.',
            'name.unique' => 'Отдел с таким названием уже существует на выбранной территории.',

            'territory.required' => 'Указание территории обязательно.',
            'territory.string' => 'Территория должна быть текстовым значением!',
            // Built from the enum's Russian values, so the text can't drift out of sync
            // with the allowed list. Gives: "ЕКБ или КРГ".
            'territory.in' => 'Территория может принимать значение только ' . implode(' или ', Territory::values()) . '.',
        ];
    }
}
