<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
////////////////////////////////////
use App\Http\Requests\PhoneUpdateRequest;
use App\Models\Phone;
use App\Models\Department;
use App\Services\PhoneDirectoryService;

class PhoneController extends Controller
{
    /**
     * Display the main view with paginated phone records, search, and auth data.
     */
    // Add to the imports: use App\Services\PhoneDirectoryService;

    public function index(Request $request, PhoneDirectoryService $directory)
    {
        $userId = Auth::id();
        $search = $request->input('search');
        $departmentFilter = $request->input('department');

        $page = $directory->getPage($search, $departmentFilter);

        return Inertia::render('phones/index', [
            'auth' => [
                'user_id' => $userId,
                'is_authenticated' => $userId !== null,
            ],

            // Listed one by one (not spread) so you can see every prop the page receives.
            'departments' => $page['departments'],
            'allGroups' => $page['allGroups'],
            'totalDatabaseCount' => $page['totalDatabaseCount'],
            'pagination' => $page['pagination'],

            'filters' => [
                'search' => $search,
                'department' => $departmentFilter,
            ],
        ]);
    }

    /**
     * Update multiple phone records in bulk using the custom FormRequest.
     */

    // PhoneUpdateRequest
    public function update(PhoneUpdateRequest $r)
    {
        $validated = $r->validated();

        // ---- Pre-check group names BEFORE touching the DB ----
        // The unique index on departments.name would make the UPDATE fail with a
        // 500, so ask first and answer with a normal Inertia validation error.
        $nameErrors = [];
        $seenNames = [];          // names claimed so far in THIS payload
        $departmentIdByIndex = []; // reused in the transaction, saves a second lookup

        foreach ($validated['departments'] as $depIndex => $department) {
            $group = $department['group'] ?? null;
            // The payload has no department id, so find it through the first phone.
            $firstPhoneId = $department['phones'][0]['id'] ?? null;

            if (empty($group) || !$firstPhoneId) {
                continue;
            }

            $departmentId = Phone::whereKey($firstPhoneId)->value('department_id');
            $departmentIdByIndex[$depIndex] = $departmentId;

            // Taken by ANOTHER department in the DB. The query uses the column's own
            // collation, so it agrees with the unique index (case, е/ё, and so on).
            // whereKeyNot() lets a department keep its own name.
            $takenInDb = Department::where('name', $group)
                ->whereKeyNot($departmentId)
                ->exists();

            // Two departments renamed to the same name in one save. The DB can't see
            // this yet, because neither rename has been written. mb_strtolower is only
            // an approximation of the collation; the unique index stays the backstop.
            $key = mb_strtolower($group);
            $takenInPayload = isset($seenNames[$key]);
            $seenNames[$key] = true;

            if ($takenInDb || $takenInPayload) {
                // Key = the form's error-bag path, so useForm().errors exposes it
                // at errors['departments.{index}.group'] and the card can show it.
                $nameErrors["departments.{$depIndex}.group"] = "Отдел с названием «{$group}» уже существует.";
            }
        }

        if (!empty($nameErrors)) {
            // Nothing has been written yet, so nothing needs rolling back.
            // back() + errors is the format Inertia expects: it fills useForm's
            // `errors` and keeps the user on the page with their edits.
            return back()->withErrors($nameErrors);
        }

        DB::transaction(function () use ($validated, $departmentIdByIndex) {

            $selectedBossIds = collect($validated['departments'])
                ->pluck('phones')
                ->flatten(1)
                ->filter(fn($phoneData) => !empty($phoneData['isBoss']))
                ->pluck('id')
                ->values();

            foreach ($validated['departments'] as $depIndex => $department) {
                $phones = $department['phones'] ?? [];
                $group  = $department['group'] ?? null;

                if (empty($phones)) {
                    continue;
                }

                foreach ($phones as $phoneData) {
                    Phone::where('id', $phoneData['id'])->update([
                        'cabinet'    => $phoneData['cabinet'] ?? null,
                        'ip'         => $phoneData['ip'] ?? null,
                        'isMiniBoss' => (bool) ($phoneData['isMiniBoss'] ?? false),
                        // isBoss is written by the boss block below
                    ]);
                }

                // Rename, reusing the id found in the pre-check.
                if (!empty($group) && isset($departmentIdByIndex[$depIndex])) {
                    Department::whereKey($departmentIdByIndex[$depIndex])
                        ->update(['name' => $group]);
                }
            }

            foreach ($selectedBossIds as $bossId) {
                $departmentId = Phone::whereKey($bossId)->value('department_id');

                // Reset the whole department in the DB, not just the payload, because
                // an active search means the payload may not include the old boss.
                Phone::where('department_id', $departmentId)->update(['isBoss' => false]);
                Phone::whereKey($bossId)->update(['isBoss' => true]);
            }
        });

        return redirect()
            ->back()
            ->with('success', 'Справочник успешно обновлен.');
    }
}
