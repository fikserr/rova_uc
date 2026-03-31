<?php

namespace App\Http\Middleware;

use App\Models\UserBalance;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        $balance = $user
            ? (UserBalance::where('user_id', $user->id)->value('balance') ?? 0)
            : 0;

        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'username' => $user->username,
                    'phone_number' => $user->phone_number,
                    'hasPassword' => $user->password()->exists(),
                    'role' => $user->role,
                    'balance' => $balance,
                ] : null,
            ],
            'user' => $user ? [
                'id' => $user->id,
                'username' => $user->username,
                'phone_number' => $user->phone_number,
                'role' => $user->role,
                'hasPassword' => $user->password()->exists(),
                'balance' => $balance,
            ] : null,
        ]);
    }

    public function show($event)
    {
        return Inertia::render('Event/Show', [
            'event' => $event->only(
                'id',
                'title',
                'start_date',
                'description',
            ),
        ]);
    }
}
