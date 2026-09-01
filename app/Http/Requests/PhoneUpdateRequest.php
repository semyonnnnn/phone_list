<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PhoneUpdateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Protected by the 'auth' middleware group in routes
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'departments' => ['required', 'array'],
            'departments.*.phones' => ['sometimes', 'array'],
            'departments.*.phones.*.id' => ['required_with:departments.*.phones', 'exists:phones,id'],
            'departments.*.phones.*.cabinet' => ['nullable', 'string', 'max:255'],
            'departments.*.phones.*.ip' => ['nullable', 'string', 'max:255'],
            'departments.*.phones.*.isBoss' => ['nullable', 'boolean'],
            'departments.*.phones.*.isMiniBoss' => ['nullable', 'boolean'],
        ];
    }

    /**
     * Get custom error messages for validation failures in Russian.
     */
    public function messages(): array
    {
        return [
            'departments.required' => 'Поле отделов обязательно.',
            'departments.array' => 'Поле отделов должно быть массивом.',
            'departments.*.phones.array' => 'Поле телефонов должно быть массивом.',
            'departments.*.phones.*.id.required_with' => 'Идентификатор записи обязателен.',
            'departments.*.phones.*.id.exists' => 'Указанная запись справочника не найдена в базе данных.',
            'departments.*.phones.*.cabinet.string' => 'Поле "Кабинет" должно быть строкой.',
            'departments.*.phones.*.cabinet.max' => 'Поле "Кабинет" не должно превышать 255 символов.',
            'departments.*.phones.*.ip.string' => 'Поле "IP" должно быть строкой.',
            'departments.*.phones.*.ip.max' => 'Поле "IP" не должно превышать 255 символов.',
            'departments.*.phones.*.isBoss.boolean' => 'Поле "Начальник" должно иметь логическое значение.',
            'departments.*.phones.*.isMiniBoss.boolean' => 'Поле "Заместитель" должно иметь логическое значение.',
        ];
    }
}
