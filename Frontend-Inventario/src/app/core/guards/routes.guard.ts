import { inject } from "@angular/core";
import { AuthService } from "../../services/auth.service";
import { Router, CanActivateFn } from "@angular/router";

export const routeGuard: CanActivateFn = (_route, state) => {
    const router = inject(Router);
    const auth = inject(AuthService);

    if (auth.isAuthenticated()) {
        return true;
    }

    // Se guarda la página solicitada para volver a ella después de iniciar sesión.
    return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};
