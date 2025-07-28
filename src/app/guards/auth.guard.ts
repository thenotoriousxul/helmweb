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

  console.log('AuthGuard: Verificando acceso a ruta:', state.url);

  // Roles requeridos para la ruta
  const requiredRoles = route.data?.['roles'] as string[] | undefined;
  console.log('AuthGuard: Roles requeridos:', requiredRoles);

  // Valida sesión contra el backend (mejor práctica)
  return http.get<any>('http://localhost:3333/me', { withCredentials: true }).pipe(
    map(response => {
      console.log('AuthGuard: Respuesta del endpoint /me:', response);
      const user = response.data; // El usuario está directamente en data, no en data.user
      console.log('AuthGuard: Usuario encontrado:', user);
      
      if (!user) {
        console.log('AuthGuard: No hay usuario autenticado, redirigiendo a login');
        // No autenticado
        return router.createUrlTree(['/login']);
      }
      
      // Actualiza el usuario en el AuthService
      authService['userCache'] = user;
      authService['currentUserSubject'].next(user);
      console.log('AuthGuard: Usuario actualizado en AuthService');
      
      // Si hay roles requeridos, verifica
      if (requiredRoles && !requiredRoles.includes(user.role)) {
        console.log('AuthGuard: Usuario no tiene rol requerido, redirigiendo a dashboard');
        // No tiene el rol requerido
        return router.createUrlTree(['/dashboard']);
      }
      
      console.log('AuthGuard: Acceso permitido');
      // Autenticado y con rol permitido
      return true;
    }),
    catchError((error) => {
      console.error('AuthGuard: Error verificando autenticación:', error);
      // Error de sesión/cookie/token inválido
      return of(router.createUrlTree(['/login']));
    })
  );
}; 