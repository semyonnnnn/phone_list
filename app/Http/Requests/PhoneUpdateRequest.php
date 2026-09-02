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
            'departments.*.phones' => ['sometimes', 'array'],
            'departments.*.phones.*.id' => ['required_with:departments.*.phones', 'exists:phones,id'],
            'departments.*.phones.*.cabinet' => ['nullable', 'string', 'max:255'],
            'departments.*.phones.*.ip' => ['nullable', 'string', 'max:255'],
            'departments.*.phones.*.isBoss' => ['nullable', 'boolean'],
            'departments.*.phones.*.isMiniBoss' => ['nullable', 'boolean'],
        ];
    }

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
