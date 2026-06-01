<?php

use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;

Route::aliasMiddleware('role', \App\Http\Middleware\EnsureUserHasRole::class);

Route::middleware(['auth:sanctum'])->get('/profile', [AuthController::class, 'profile']);

Route::middleware(['auth:sanctum', 'role:admin'])->get('/admin/dashboard', function () {
    return response()->json([
        'message' => 'Acesso liberado para administradores',
    ]);
});
