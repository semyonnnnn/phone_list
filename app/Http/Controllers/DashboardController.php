<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    /**
     * Display the dashboard view.
     */
    public function index(Request $request)
    {
        $userId = Auth::id();

        return Inertia::render('Dashboard/Index', [
            'auth' => [
                'user_id' => $userId,
                'is_authenticated' => $userId !== null, // Evaluates to true if logged in, false otherwise
            ],
        ]);
    }
}
