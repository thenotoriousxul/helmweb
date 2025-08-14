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

  // Evitar llamada redundante en cada navegación: usa ensureUser()
  return authService.ensureUser().pipe(
    map(user => {
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
        console.log('AuthGuard: Usuario no tiene rol requerido, redirigiendo por rol');
        // Redirección específica por rol
        if (user.role === 'minero') {
          return router.createUrlTree(['/my-helmet']);
        } else if (user.role === 'supervisor') {
          return router.createUrlTree(['/equipments']);
        } else if (user.role === 'admin') {
          return router.createUrlTree(['/supervisors']);
        }
        return router.createUrlTree(['/equipments']);
      }
      
      console.log('AuthGuard: Acceso permitido');
      // Autenticado y con rol permitido
      return true;
    }),
    catchError((error) => {
      console.error('AuthGuard: Error verificando autenticación:', error);
      return of(router.createUrlTree(['/login']));
    })
  );
}; 

export const guestGuard = (route: any, state: any) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  console.log('GuestGuard: Verificando si usuario está autenticado...');
  
  if (authService.isAuthenticated()) {
    const user = authService.getCurrentUser();
    console.log('GuestGuard: Usuario ya autenticado, redirigiendo por rol');
    // Redirección específica por rol
    if (user?.role === 'minero') {
      return router.createUrlTree(['/my-helmet']);
    } else if (user?.role === 'supervisor') {
      return router.createUrlTree(['/equipments']);
    } else if (user?.role === 'admin') {
      return router.createUrlTree(['/supervisors']);
    }
    return router.createUrlTree(['/equipments']);
  }

  console.log('GuestGuard: Acceso permitido para invitados');
  return true;
}; 