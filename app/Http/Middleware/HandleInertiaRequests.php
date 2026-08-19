<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $companies = [
            'dijlah' => ['id' => 'dijlah', 'name' => 'دلال دجلة'],
            'misk' => ['id' => 'misk', 'name' => 'دلال المسك'],
        ];
        $activeCompanyId = session('active_company', 'dijlah');

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
            ],
            'activeCompany' => $companies[$activeCompanyId] ?? $companies['dijlah'],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'auto_print_invoice' => fn () => $request->session()->get('auto_print_invoice'),
            ],
        ];
    }
}
