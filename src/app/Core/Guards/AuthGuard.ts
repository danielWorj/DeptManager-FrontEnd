import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../Service/Auth/auth-service';

export const AuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true; // Accès autorisé
  } else {
    // Redirection vers la page login si non connecté
    return router.parseUrl('/login'); 
  }
};