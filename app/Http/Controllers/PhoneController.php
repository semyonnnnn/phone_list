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

        DB::transaction(function () use ($validated) {

            // Ids of every phone marked as boss in the payload (at most one per
            // department; PhoneUpdateRequest::withValidator() already rejects more).
            $selectedBossIds = collect($validated['departments'])
                ->pluck('phones')
                ->flatten(1)
                ->filter(fn($phoneData) => !empty($phoneData['isBoss']))
                ->pluck('id')
                ->values();

            foreach ($validated['departments'] as $department) {
                // 'phones' and 'group' are both `sometimes` in the request, so either
                // key can be missing; ?? avoids "Undefined array key".
                $phones = $department['phones'] ?? [];
                $group  = $department['group'] ?? null;

                // No phones = nothing to update, and no phone to find the
                // department through for the rename below. Skip it.
                if (empty($phones)) {
                    continue;
                }

                foreach ($phones as $phoneData) {
                    Phone::where('id', $phoneData['id'])->update([
                        'cabinet'    => $phoneData['cabinet'] ?? null,
                        'ip'         => $phoneData['ip'] ?? null,
                        'isMiniBoss' => (bool) ($phoneData['isMiniBoss'] ?? false),
                        // isBoss is deliberately not written here; the boss block
                        // below handles it so only one boss per department can exist.
                    ]);
                }

                if (!empty($group)) {
                    // The payload has no department id, so find it through the first
                    // phone. $phones is a list of arrays (id, cabinet, ip, ...), so
                    // take one real id from it; passing $phones itself to find()
                    // would feed those arrays to whereIn().
                    // value() reads one column without loading a model.
                    $departmentId = Phone::whereKey($phones[0]['id'])->value('department_id');

                    Department::whereKey($departmentId)->update(['name' => $group]);
                }
            }

            // Each selected id is the one boss of its own department.
            foreach ($selectedBossIds as $bossId) {
                // Link through department_id, the real relation. The old code grouped
                // by `group` on phones, which is either not a column or a text copy
                // that goes stale after a rename (check your phones migration).
                $departmentId = Phone::whereKey($bossId)->value('department_id');

                // Reset the whole department in the DB, not just the payload: with an
                // active search the page holds only some of a department's phones,
                // so the old boss may not be in the payload at all.
                Phone::where('department_id', $departmentId)->update(['isBoss' => false]);
                Phone::whereKey($bossId)->update(['isBoss' => true]);
            }
        });

        return redirect()
            ->back()
            ->with('success', 'Справочник успешно обновлен.');
    }
}
