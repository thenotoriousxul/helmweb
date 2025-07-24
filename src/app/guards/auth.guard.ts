import { Injectable } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

// Standalone guard para Angular 15+
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const http = inject(HttpClient);

  // Roles requeridos para la ruta
  const requiredRoles = route.data?.['roles'] as string[] | undefined;

  // Valida sesión contra el backend (mejor práctica)
  return http.get<any>('http://localhost:3333/me', { withCredentials: true }).pipe(
    map(response => {
      const user = response.data?.user;
      if (!user) {
        // No autenticado
        return router.createUrlTree(['/login']);
      }
      // Actualiza el usuario en el AuthService
      authService['userCache'] = user;
      authService['currentUserSubject'].next(user);
      // Si hay roles requeridos, verifica
      if (requiredRoles && !requiredRoles.includes(user.role)) {
        // No tiene el rol requerido
        return router.createUrlTree(['/dashboard']);
      }
      // Autenticado y con rol permitido
      return true;
    }),
    catchError(() => {
      // Error de sesión/cookie/token inválido
      return of(router.createUrlTree(['/login']));
    })
  );
}; 