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
     * Display the main view with paginated phone records, search, and auth data.
     */
    public function index(Request $request)
    {
        $userId = Auth::id();
        $search = $request->input('search');
        $departmentFilter = $request->input('department');
        $perPage = 15;

        $totalDatabaseCount = Phone::count();

        $query = Phone::query();

        if ($search) {
            $searchTerm = '%' . mb_strtolower(trim($search), 'UTF-8') . '%';

            $query->where(function ($q) use ($searchTerm) {
                $q->where(DB::raw('LOWER(person)'), 'like', $searchTerm)
                    ->orWhere(DB::raw('LOWER(phone)'), 'like', $searchTerm)
                    ->orWhere(DB::raw('LOWER("group")'), 'like', $searchTerm);
            });
        }

        // Filter out the entire department if selected
        if ($departmentFilter && $departmentFilter !== 'Все отделы') {
            $query->where('group', $departmentFilter);
        }

        $paginatedPhones = $query->paginate($perPage)->withQueryString();

        $departments = $paginatedPhones->getCollection()->groupBy('group')->map(function ($items, $groupName) {
            return [
                'group' => $groupName,
                'phones' => $items->values()->all(),
            ];
        })->values()->all();

        $allGroups = Phone::select('group')->distinct()->pluck('group')->all();

        // dd($departments);

        return Inertia::render('Dashboard/Index', [
            'auth' => [
                'user_id' => $userId,
                'is_authenticated' => $userId !== null,
            ],
            'departments' => $departments,
            'allGroups' => $allGroups,
            'totalDatabaseCount' => $totalDatabaseCount,
            'pagination' => [
                'current_page' => $paginatedPhones->currentPage(),
                'last_page' => $paginatedPhones->lastPage(),
                'links' => $paginatedPhones->linkCollection(),
                'total' => $paginatedPhones->total(),
            ],
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
