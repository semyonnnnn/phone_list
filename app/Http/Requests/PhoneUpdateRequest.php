<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class PhoneUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Protected by the 'auth' middleware group in routes
    }

    public function rules(): array
    {
        return [
            'departments' => ['required', 'array'],

            // Validate group as an array with its sub-attributes
            'departments.*.group' => ['sometimes', 'array'],
            'departments.*.group.name' => ['sometimes', 'string', 'max:255'],
            'departments.*.group.territory' => ['sometimes', 'string', 'max:255'],

            'departments.*.phones' => ['sometimes', 'array'],

            'departments.*.phones.*.id' => ['required_with:departments.*.phones', 'integer', 'exists:phones,id'],

            // Fields that come from the file.
            'departments.*.phones.*.person' => ['nullable', 'string', 'max:255'],
            'departments.*.phones.*.phone' => ['nullable', 'string', 'max:255'],
            'departments.*.phones.*.extension' => ['nullable', 'string', 'max:255'],
            'departments.*.phones.*.file_id' => ['nullable', 'string', 'max:255'],

            // Fields the user edits.
            'departments.*.phones.*.cabinet' => ['nullable', 'string', 'max:255'],
            'departments.*.phones.*.ip' => ['nullable', 'string', 'max:255'],
            'departments.*.phones.*.isBoss' => ['nullable', 'boolean'],
            'departments.*.phones.*.isMiniBoss' => ['nullable', 'boolean'],

            'departments.*.phones.*.department_id' => ['nullable', 'integer'],
        ];
    }

    public function messages(): array
    {
        return [
            'departments.required' => 'Поле отделов обязательно.',
            'departments.array' => 'Поле отделов должно быть массивом.',

            'departments.*.group.array' => 'Поле группы отдела должно быть массивом.',
            'departments.*.group.name.string' => 'Поле названия отдела должно быть строкой.',
            'departments.*.group.name.max' => 'Название отдела не должно превышать 255 символов.',
            'departments.*.group.territory.string' => 'Поле территории должно быть строкой.',
            'departments.*.group.territory.max' => 'Территория не должна превышать 255 символов.',

            'departments.*.phones.array' => 'Поле телефонов должно быть массивом.',

            'departments.*.phones.*.id.required_with' => 'Идентификатор записи обязателен.',
            'departments.*.phones.*.id.integer' => 'Идентификатор записи должен быть целым числом.',
            'departments.*.phones.*.id.exists' => 'Указанная запись справочника не найдена в базе данных.',

            'departments.*.phones.*.person.string' => 'Поле "ФИО" должно быть строкой.',
            'departments.*.phones.*.person.max' => 'Поле "ФИО" не должно превышать 255 символов.',
            'departments.*.phones.*.phone.string' => 'Поле "Телефон" должно быть строкой.',
            'departments.*.phones.*.phone.max' => 'Поле "Телефон" не должно превышать 255 символов.',
            'departments.*.phones.*.extension.string' => 'Поле "Добавочный номер" должно быть строкой.',
            'departments.*.phones.*.extension.max' => 'Поле "Добавочный номер" не должно превышать 255 символов.',
            'departments.*.phones.*.file_id.string' => 'Поле "Идентификатор файла" должно быть строкой.',
            'departments.*.phones.*.file_id.max' => 'Поле "Идентификатор файла" не должно превышать 255 символов.',

            'departments.*.phones.*.cabinet.string' => 'Поле "Кабинет" должно быть строкой.',
            'departments.*.phones.*.cabinet.max' => 'Поле "Кабинет" не должно превышать 255 символов.',
            'departments.*.phones.*.ip.string' => 'Поле "IP" должно быть строкой.',
            'departments.*.phones.*.ip.max' => 'Поле "IP" не должно превышать 255 символов.',
            'departments.*.phones.*.isBoss.boolean' => 'Поле "Начальник" должно иметь логическое значение.',
            'departments.*.phones.*.isMiniBoss.boolean' => 'Поле "Заместитель" должно иметь логическое значение.',

            'departments.*.phones.*.department_id.integer' => 'Идентификатор отдела должен быть целым числом.',
        ];
    }

    /**
     * Cross-field checks that plain rule strings can't express:
     *  1. A single phone can't be both boss and mini-boss at once.
     *  2. At most one boss per department in this submission.
     *     (No cap on mini-bosses — a department can have several.)
     *
     * Errors are keyed per-phone (departments.X.phones.Y.isBoss / .isMiniBoss)
     * so the frontend can attribute each error to the exact cell that caused it.
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            $departments = $this->input('departments', []);

            foreach ($departments as $depIndex => $department) {
                $phones = $department['phones'] ?? [];

                if (empty($phones)) {
                    continue;
                }

                $bossIndices = [];

                foreach ($phones as $phoneIndex => $phone) {
                    $isBoss = !empty($phone['isBoss']);
                    $isMiniBoss = !empty($phone['isMiniBoss']);

                    // Same person can't hold both roles simultaneously.
                    if ($isBoss && $isMiniBoss) {
                        $message = 'Сотрудник не может быть одновременно начальником и заместителем.';
                        $validator->errors()->add("departments.{$depIndex}.phones.{$phoneIndex}.isBoss", $message);
                        $validator->errors()->add("departments.{$depIndex}.phones.{$phoneIndex}.isMiniBoss", $message);
                    }

                    if ($isBoss) {
                        $bossIndices[] = $phoneIndex;
                    }
                }

                if (count($bossIndices) > 1) {
                    foreach ($bossIndices as $phoneIndex) {
                        $validator->errors()->add(
                            "departments.{$depIndex}.phones.{$phoneIndex}.isBoss",
                            'В отделе может быть только один начальник.'
                        );
                    }
                }
            }
        });
    }
}
