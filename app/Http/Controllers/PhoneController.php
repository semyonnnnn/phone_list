<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
////////////////////////////////////
use App\Http\Requests\PhoneUpdateRequest;
use App\Services\PhoneService;
use App\Enums\Territory;
use App\Http\Requests\PhoneIndexRequest;

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
        // dd('hi');
        // A name clash throws a ValidationException from the service. Laravel turns
        // it into the same redirect-back-with-errors that back()->withErrors() gave,
        // so useForm's `errors` and the card's error display keep working.
        $phones->update($r->validated()['departments']);

        return redirect()
            ->back()
            ->with('success', 'Справочник успешно обновлен.');
    }
}
