<?php

namespace App\Http\Requests;

use App\Models\Phone;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class PhoneStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'extension' => trim((string) ($this->input('extension') ?? '')),
        ]);
    }

    public function rules(): array
    {
        return [
            'department_id' => ['required', 'integer', Rule::exists('departments', 'id')],
            'person'        => ['required', 'string', 'max:255'],
            'phone'         => ['required', 'string', 'max:255'],
            'extension'     => ['nullable', 'string', 'max:255'],
            'cabinet'       => ['nullable', 'string', 'max:255'],
            'ip'            => ['nullable', 'string', 'max:255'],
            'isBoss'        => ['nullable', 'boolean'],
            'isMiniBoss'    => ['nullable', 'boolean'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            if ($validator->errors()->isNotEmpty()) {
                return;
            }

            $person    = trim((string) $this->input('person'));
            $extension = trim((string) ($this->input('extension') ?? ''));
            $deptId    = (int) $this->input('department_id');
            $isBoss    = (bool) $this->input('isBoss');
            $isMini    = (bool) $this->input('isMiniBoss');

            // 1. Enforce unique (person, extension) matching your DB unique index
            $duplicate = Phone::where('person', $person)
                ->where('extension', $extension)
                ->with('department')
                ->first();

            if ($duplicate) {
                $deptName = $duplicate->department?->name ?? 'другом отделе';
                $validator->errors()->add(
                    'person',
                    "Сотрудник с таким ФИО и добавочным уже существует в отделе «{$deptName}»."
                );
            }

            // 2. Cannot be both Boss and Mini-Boss
            if ($isBoss && $isMini) {
                $validator->errors()->add(
                    'isBoss',
                    'Сотрудник не может быть одновременно начальником и заместителем.'
                );
            }

            // 3. Department can have at most one Boss
            if ($isBoss && Phone::where('department_id', $deptId)->where('isBoss', true)->exists()) {
                $validator->errors()->add(
                    'isBoss',
                    'В этом отделе уже назначен начальник.'
                );
            }
        });
    }

    public function messages(): array
    {
        return [
            'department_id.required' => 'Не указан отдел.',
            'department_id.integer'  => 'Некорректный идентификатор отдела.',
            'department_id.exists'   => 'Выбранный отдел не найден.',

            'person.required'        => 'Укажите ФИО сотрудника.',
            'person.string'          => 'ФИО должно быть текстовым значением.',
            'person.max'             => 'ФИО не должно превышать 255 символов.',

            'phone.required'         => 'Укажите номер телефона.',
            'phone.string'           => 'Телефон должен быть текстовым значением.',
            'phone.max'              => 'Телефон не должен превышать 255 символов.',

            'extension.string'       => 'Добавочный должен быть текстовым значением.',
            'extension.max'          => 'Добавочный не должен превышать 255 символов.',

            'cabinet.string'         => 'Кабинет должен быть текстовым значением.',
            'cabinet.max'            => 'Кабинет не должен превышать 255 символов.',

            'ip.string'              => 'IP-адрес должен быть текстовым значением.',
            'ip.max'                 => 'IP-адрес не должен превышать 255 символов.',

            'isBoss.boolean'         => 'Некорректное значение поля «Начальник».',
            'isMiniBoss.boolean'     => 'Некорректное значение поля «Заместитель».',
        ];
    }
}
