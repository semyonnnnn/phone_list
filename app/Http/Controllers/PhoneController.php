<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
////////////////////////////////////
use App\Http\Requests\PhoneUpdateRequest;
use App\Models\Phone;
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
    public function update(PhoneUpdateRequest $request)
    {
        $validated = $request->validated();

        DB::transaction(function () use ($validated) {

            /*
         |--------------------------------------------------------------------------
         | 1. Collect requested boss selections
         |--------------------------------------------------------------------------
         */

            $selectedBossIds = collect(
                $validated['departments']
            )
                ->pluck('phones')
                ->flatten(1)
                ->filter(function ($phoneData) {
                    return !empty($phoneData['isBoss']);
                })
                ->pluck('id')
                ->values();


            /*
         |--------------------------------------------------------------------------
         | 2. Update normal phone fields
         |--------------------------------------------------------------------------
         */

            foreach ($validated['departments'] as $department) {

                if (empty($department['phones'])) {
                    continue;
                }

                foreach ($department['phones'] as $phoneData) {

                    $isMiniBoss = isset($phoneData['isMiniBoss'])
                        ? (bool) $phoneData['isMiniBoss']
                        : false;

                    Phone::where('id', $phoneData['id'])->update([
                        'cabinet' => $phoneData['cabinet'] ?? null,
                        'ip' => $phoneData['ip'] ?? null,

                        /*
                     * Do NOT blindly update isBoss here.
                     *
                     * Boss selection is handled globally below.
                     */

                        'isMiniBoss' => $isMiniBoss,
                    ]);
                }
            }


            /*
         |--------------------------------------------------------------------------
         | 3. Process boss selections globally
         |--------------------------------------------------------------------------
         */

            if ($selectedBossIds->isNotEmpty()) {

                $selectedBosses = Phone::whereIn(
                    'id',
                    $selectedBossIds
                )
                    ->get()
                    ->groupBy('group');


                foreach ($selectedBosses as $groupName => $bosses) {

                    /*
                 * Safety check:
                 * There must be exactly ONE selected boss per department.
                 */

                    if ($bosses->count() > 1) {
                        throw \Illuminate\Validation\ValidationException::withMessages([
                            'departments' => [
                                "В отделе {$groupName} может быть только один начальник."
                            ],
                        ]);
                    }


                    $boss = $bosses->first();


                    /*
                 * Clear EVERY boss in this department.
                 *
                 * This includes:
                 * - hidden search results
                 * - other pagination pages
                 * - currently invisible employees
                 */

                    Phone::where('group', $groupName)
                        ->update([
                            'isBoss' => false,
                        ]);


                    /*
                 * Set the newly selected boss.
                 */

                    Phone::where('id', $boss->id)
                        ->update([
                            'isBoss' => true,
                        ]);
                }
            }
        });

        return redirect()
            ->back()
            ->with(
                'success',
                'Справочник успешно обновлен.'
            );
    }
}
