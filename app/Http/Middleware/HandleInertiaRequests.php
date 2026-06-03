<?php

namespace App\Http\Middleware;

use App\Models\CurrencyRate;
use App\Models\UserBalance;
use Illuminate\Support\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Middleware;
use Illuminate\Support\Facades\DB;
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
        $stats = []; // ← Initialize here first


        $balance = $user
            ? (UserBalance::where('user_id', $user->id)->value('balance') ?? 0)
            : 0;
        if ($user) {
            $stats['unread'] = DB::table('user_notifications')
            ->where('user_id', $user->id)
            ->where('is_read', 0)
            ->count();
    }
        $currencyRates = CurrencyRate::query()
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->get(['currency_code', 'rate_to_base'])
            ->unique('currency_code')
            ->mapWithKeys(fn ($rate) => [
                strtoupper((string) $rate->currency_code) => (float) $rate->rate_to_base,
            ])
            ->toArray();

        if (!isset($currencyRates['UZS'])) {
            $currencyRates['UZS'] = 1.0;
        }

        return array_merge(parent::share($request), [
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
            'auth' => [
                'user' => $user ? [
                    'id'                => $user->id,
                    'username'          => $user->username,
                    'phone_number'      => $user->phone_number,
                    'email'             => $user->email,
                    'email_verified_at' => $user->email_verified_at,
                    'hasPassword'       => $user->password()->exists(),
                    'role'              => $user->role,
                    'balance'           => $balance,
                    'created_at'        => $user->created_at ? Carbon::parse($user->created_at)->toDateTimeString() : null,
                ] : null,
            ],
            'currency_rates' => $currencyRates,
            'user' => $user ? [
                'id' => $user->id,
                'username' => $user->username,
                'phone_number' => $user->phone_number,
                'role' => $user->role,
                'hasPassword' => $user->password()->exists(),
                'balance' => $balance,
                'created_at' => $user->created_at ? Carbon::parse($user->created_at)->toDateTimeString() : null,

            ] : null,
            'stats' => $stats
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
