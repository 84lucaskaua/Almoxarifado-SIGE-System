<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserHasRole
{
    public function handle(Request $request, Closure $next, string $roles): Response
    {
        $user = $request->user();

        if (! $user) {
            return response()->json(['message' => 'Não autorizado'], Response::HTTP_UNAUTHORIZED);
        }

        $allowedRoles = explode('|', $roles);

        if (! in_array($user->role, $allowedRoles, true)) {
            return response()->json(['message' => 'Acesso negado'], Response::HTTP_FORBIDDEN);
        }

        return $next($request);
    }
}
