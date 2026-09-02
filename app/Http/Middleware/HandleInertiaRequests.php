<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        return [
            ...parent::share($request),

            'name' => config('app.name'),

            'quote' => [
                'message' => trim($message),
                'author' => trim($author),
            ],

            'auth' => [
                'user' => $request->user(),
            ],

            /*
             |--------------------------------------------------------------------------
             | Flash messages
             |--------------------------------------------------------------------------
             */
            'flash' => [
                'success' => fn() => $request->session()->has('success')
                    ? [
                        'id' => uniqid(),
                        'message' => $request->session()->get('success'),
                    ]
                    : null,

                'error' => fn() => $request->session()->has('error')
                    ? [
                        'id' => uniqid(),
                        'message' => $request->session()->get('error'),
                    ]
                    : null,
            ],
        ];
    }
}
