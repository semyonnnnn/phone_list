<?php

namespace App\Http\Requests;

use App\Enums\Territory;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PhoneIndexRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Protected by the 'auth' middleware group in routes
    }

    // Runs BEFORE validation. Without it, `required` rejects a plain visit to /phones
    // (no query string) and the page can never open without ?territory=...
    // filled() is false for a missing key AND for null/empty string
    // (ConvertEmptyStringsToNull turns '' into null), so both get the default.
    protected function prepareForValidation(): void
    {
        if (! $this->filled('territory')) {
            $this->merge(['territory' => 'all']);
        }
    }

    public function rules(): array
    {
        return [
            // required: the field must be present. Rule::in, not Rule::enum:
            // the enum is backed by labels ('ЕКБ'), but requests send keys ('ekb'),
            // so we check against keys() + 'all' ('all' isn't a real territory).
            'territory'  => ['required', 'string', Rule::in([...Territory::keys(), 'all'])],

            // nullable first: a null value skips the remaining rules,
            // a present value must be a string of at most 255 characters.
            'department' => ['nullable', 'string', 'max:255'],
            'search'     => ['nullable', 'string', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'territory.required' => 'Территория обязательна.',
            'territory.in'       => 'Недопустимая территория.',
            'department.max'     => 'Название отдела не должно превышать 255 символов.',
            'search.max'         => 'Поисковый запрос не должен превышать 255 символов.',
        ];
    }
}
