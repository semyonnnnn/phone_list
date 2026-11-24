<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
////////////////////////////////////
use App\Http\Requests\PhoneUpdateRequest;
use App\Services\PhoneService;
use App\Enums\Territory;
use App\Http\Requests\PhoneIndexRequest;
use App\Http\Requests\PhoneStoreRequest;
use App\Models\Phone;
use Illuminate\Http\Request;

class PhoneController extends Controller
{
    /**
     * Display the main view with paginated phone records, search, and auth data.
     */
    public function index(PhoneIndexRequest $r, PhoneService $phones)
    {
        $userId = Auth::id();
        $search = $r->input('search');
        $departmentFilter = $r->input('department');
        $territory = $r->input('territory');

        $page = $phones->index($search, $departmentFilter, $territory);

        return Inertia::render('phones/index', [
            'auth' => [
                'user_id' => $userId,
                'is_authenticated' => $userId !== null,
            ],

            'departments' => $page['departments'],
            'allGroups' => $page['allGroups'],
            'totalDatabaseCount' => $page['totalDatabaseCount'],
            'pagination' => $page['pagination'],

            'filters' => [
                'search' => $search,
                'department' => $departmentFilter,
                // The hook compares its switch state with this value. Without it,
                // the hook always falls back to 'all' and never sends 'all' as a change.
                'territory' => $territory,
            ],

            'territories' => Territory::keys(),
        ]);
    }

    /**
     * Update multiple phone records in bulk using the custom FormRequest.
     */
    // PhoneUpdateRequest
    public function update(PhoneUpdateRequest $r, PhoneService $phones)
    {
        $phones->update($r->validated()['departments']);

        return redirect()
            ->back()
            ->with('success', 'Справочник успешно обновлен.');
    }
    public function store(PhoneStoreRequest $r)
    {
        $data = $r->validated();

        Phone::create([
            'person' => $data['person'],
            'extension' => $data['extension'],
            'phone' => $data['phone'],
            'cabinet' => $data['cabinet'],
            'ip' => $data['ip'],
            'isBoss' => $data['isBoss'],
            'isMiniBoss' => $data['isMiniBoss'],
            'department_id' => $data['department_id'],
        ]);
    }
    public function destroy()
    {
        dd('hi from phone destroy');
    }
}
