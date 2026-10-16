import { inject } from "@angular/core";
import { AuthService } from "../../services/auth.service";
import { Router, CanActivateFn } from "@angular/router";

/** Solo permite entrar a usuarios sin sesión, por ejemplo a la pantalla de inicio de sesión. */
export const guestGuard: CanActivateFn = () => {
    const router = inject(Router);
    const auth = inject(AuthService);

    return auth.isAuthenticated() ? router.createUrlTree(['/home']) : true;
};
