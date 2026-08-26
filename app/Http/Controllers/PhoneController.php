<?php

namespace App\Http\Controllers;

use App\Http\Requests\PhoneUpdateRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Models\Phone;

class PhoneController extends Controller
{
    /**
     * Display the main view with phone records and auth data.
     */
    public function index(Request $request)
    {
        $userId = Auth::id();

        // Fetch all phone records and group them by the 'group' column
        $phones = Phone::all();

        $departments = $phones->groupBy('group')->map(function ($items, $groupName) {
            return [
                'group' => $groupName,
                'phones' => $items->values()->all(),
            ];
        })->values()->all();

        return Inertia::render('Dashboard/Index', [
            'auth' => [
                'user_id' => $userId,
                'is_authenticated' => $userId !== null,
            ],
            'departments' => $departments,
        ]);
    }

    /**
     * Update multiple phone records in bulk using the custom FormRequest.
     */
    public function update(PhoneUpdateRequest $request)
    {
        $validated = $request->validated();

        // Wrap updates in a transaction for safety
        DB::transaction(function () use ($validated) {
            foreach ($validated['departments'] as $department) {
                foreach ($department['phones'] as $phoneData) {
                    Phone::where('id', $phoneData['id'])->update([
                        'cabinet' => $phoneData['cabinet'] ?? null,
                        'ip' => $phoneData['ip'] ?? null,
                    ]);
                }
            }
        });

        return redirect()->back()->with('success', 'Справочник успешно обновлен.');
    }
}
