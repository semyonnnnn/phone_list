<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
////////////////////////////////////
use App\Http\Requests\PhoneUpdateRequest;
use App\Services\PhoneService;
use App\Enums\Territory;

class PhoneController extends Controller
{
    /**
     * Display the main view with paginated phone records, search, and auth data.
     */
    public function index(Request $request, PhoneService $phones)
    {
        $userId = Auth::id();
        $search = $request->input('search');
        $departmentFilter = $request->input('department');

        $page = $phones->index($search, $departmentFilter);

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

            'territories' => Territory::values(),
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
