<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;
use Laravel\Passport\Passport;


class AuthServiceProvider extends ServiceProvider
{
    /**
     * The policy mappings for the application.
     *
     * @var array
     */
    protected $policies = [
        // 'App\Model' => 'App\Policies\ModelPolicy',
    ];

    /**
     * Register any authentication / authorization services.
     *
     * @return void
     */
    public function boot()
    {
        $this->registerPolicies();

        //

        Passport::routes(null, ['prefix' => 'connect']);
        Passport::tokensExpireIn(now()->addDays(1));

        Passport::tokensCan([
            'system' => '2FA Pass',
            'pos' => '2FA Pass',
        ]);

        // Gate::define('viewWebSocketsDashboard', function ($user = null) {
        //     // if($user) {
        //         return true;
        //     // }
        // });
    }

}
