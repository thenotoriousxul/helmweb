import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map, catchError, shareReplay } from 'rxjs/operators';
import { finalize } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: 'supervisor' | 'minero' | 'admin';
  avatar?: string;
  department?: string;
  teamId?: string;
  supervisorId?: string;
  fechaContratacion?: string;
  especialidadEnMineria?: string;
  genero?: string;
  cascoId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Helmet {
  id: string;
  uuid: string;
  serialNumber: string;
  status: 'inactivo' | 'activo' | 'activo-asignado' | 'activo-sin-asignar';
  assignedTo?: string;
  assignedToId?: string;
  equipmentId?: string;
  equipmentName?: string;
  supervisorId?: string;
  lastHeartbeat?: string;
  batteryLevel?: number;
  temperature?: number;
  location?: string;
  sensors?: {
    gps: { lat: number; lng: number };
    gpsFix?: boolean;
    sats?: number;
    temperature?: number; // °C
    tempC?: number; // °C (alias)
    heartRate?: number; // bpm
    bpm?: number; // alias
    mq7?: number; // gas MQ7
    red?: number; // PPG red
    ir?: number;  // PPG IR
    acceleration?: { x: number; y: number; z: number };
  };
}

export interface Equipment {
  id: string;
  name: string;
  type: string;
  location: string;
  supervisorId: string;
  miners: Miner[];
  totalHelmets: number;
  activeHelmets: number;
  status: 'active' | 'inactive' | 'warning';
  alerts: number;
  lastUpdate: string;
}

export interface Miner {
  id: string;
  name: string;
  lastName: string;
  email: string;
  birthDate: string;
  hireDate?: string;
  phone: string;
  rfc: string;
  address: {
    country: string;
    state: string;
    city: string;
    neighborhood: string;
    street: string;
    number: string;
    zipCode: string;
  };
  photo: string;
  helmetId?: string;
  teamId?: string;
  supervisorId?: string;
  status: 'online' | 'offline' | 'alert';
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private userCache: User | null = null;
  private inFlightMe$?: Observable<User>;

  constructor(private http: HttpClient) {
    this.initializeUser();
  }

  private initializeUser(): void {
    try {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser && storedUser !== 'null' && storedUser !== 'undefined' && storedUser.trim() !== '') {
        const user = JSON.parse(storedUser);
        this.userCache = user;
        this.currentUserSubject.next(user);
      }
    } catch (error) {
      console.error('Error parsing stored user:', error);
      localStorage.removeItem('currentUser');
    }
  }

  login(email: string, password: string): Observable<any> {
    console.log('AuthService: Iniciando login para:', email);
    return this.http.post<any>(`${environment.apiUrl}/login`, { email, password }, { withCredentials: true }).pipe(
      map(response => {
        console.log('AuthService: Respuesta del servidor:', response);
        const user = response.data.user;
        console.log('AuthService: Usuario extraído:', user);
        this.userCache = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.currentUserSubject.next(user);
        console.log('AuthService: Usuario guardado en cache y localStorage');
        return user;
      }),
      catchError(error => {
        console.error('AuthService: Error en login:', error);
        let errorMessage = 'Error al iniciar sesión. Verifica tus credenciales.';
        if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.status === 401) {
          errorMessage = 'Credenciales incorrectas.';
        }
        return throwError(() => new Error(errorMessage));
      }),
      shareReplay(1)
    );
  }

  register(data: { fullName: string; email: string; password: string; codigo: string }): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/register`, data, { withCredentials: true }).pipe(
      map(response => {
        const user = response.data.user;
        this.userCache = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.currentUserSubject.next(user);
        return user;
      }),
      catchError(error => {
        console.error('Registration error:', error);
        let errorMessage = 'Error al registrar usuario';
        // Si el backend responde con un objeto { message: ... }
        if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (typeof error.error === 'string') {
          // Si el backend responde con un string plano
          errorMessage = error.error;
        } else if (error.message) {
          errorMessage = error.message;
        } else if (error.status === 400) {
          errorMessage = 'Datos inválidos. Verifica la información proporcionada.';
        } else if (error.status === 409) {
          errorMessage = 'El email ya está registrado.';
        }
        return throwError(() => new Error(errorMessage));
      }),
      shareReplay(1)
    );
  }

  generateAccessCode(email: string): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/access-code`, { email }, { withCredentials: true }).pipe(
      map(response => response.data),
      catchError(error => {
        console.error('Access code generation error:', error);
        let errorMessage = 'Error al generar código de acceso';
        
        if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.status === 400) {
          errorMessage = 'Email inválido.';
        } else if (error.status === 409) {
          errorMessage = 'El email ya está registrado.';
        }
        
        throw new Error(errorMessage);
      })
    );
  }

  logout(): void {
    // Limpiar estado local primero para que los guards permitan navegar inmediatamente
    this.userCache = null
    localStorage.removeItem('currentUser')
    this.currentUserSubject.next(null)

    // Enviar logout al backend en segundo plano
    this.http
      .post<any>(`${environment.apiUrl}/logout`, {}, { withCredentials: true })
      .pipe(
        catchError((err) => {
          console.error('AuthService: Error en logout backend:', err)
          return of(null)
        })
      )
      .subscribe()
  }

  // Perfil
  getMe(): Observable<User> {
    return this.http.get<any>(`${environment.apiUrl}/me`, { withCredentials: true }).pipe(
      map(res => res.data),
      map((user) => {
        this.userCache = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.currentUserSubject.next(user);
        return user;
      })
    );
  }

  ensureUser(): Observable<User> {
    const cached = this.getCurrentUser();
    if (cached) {
      return of(cached);
    }
    if (this.inFlightMe$) {
      return this.inFlightMe$;
    }
    this.inFlightMe$ = this.getMe().pipe(
      shareReplay(1),
      finalize(() => {
        this.inFlightMe$ = undefined;
      })
    );
    return this.inFlightMe$;
  }
  getProfile(): Observable<User> {
    return this.http.get<any>(`${environment.apiUrl}/profile`, { withCredentials: true }).pipe(
      map(res => res.data),
      map((user) => {
        this.userCache = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.currentUserSubject.next(user);
        return user;
      })
    );
  }

  updateProfile(data: Partial<User & { phone?: string; rfc?: string; address?: string; birthDate?: string }>): Observable<User> {
    return this.http.put<any>(`${environment.apiUrl}/profile`, data, { withCredentials: true }).pipe(
      map(res => res.data),
      map((user) => {
        this.userCache = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.currentUserSubject.next(user);
        return user;
      })
    );
  }

  changePassword(currentPassword: string, newPassword: string): Observable<any> {
    return this.http.put<any>(`${environment.apiUrl}/change-password`, 
      { currentPassword, newPassword }, 
      { withCredentials: true }
    ).pipe(
      map(response => response.data || response),
      catchError(error => {
        console.error('Change password error:', error);
        let errorMessage = 'Error al cambiar la contraseña';
        
        if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.status === 400) {
          errorMessage = 'Contraseña actual incorrecta';
        } else if (error.status === 422) {
          errorMessage = 'La nueva contraseña no cumple con los requisitos de seguridad';
        }
        
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  getCurrentUser(): User | null {
    return this.userCache || this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  isSupervisor(): boolean {
    return this.hasRole('supervisor');
  }

  isMinero(): boolean {
    return this.hasRole('minero');
  }

  isAdmin(): boolean {
    return this.hasRole('admin');
  }

  canCreateEquipment(): boolean {
    return this.isSupervisor(); // Solo supervisores pueden crear equipos
  }

  canCreateMiner(): boolean {
    return this.isSupervisor(); // Solo supervisores pueden crear mineros
  }

  canCreateHelmet(): boolean {
    // Solo supervisores pueden crear cascos.
    return this.isSupervisor();
  }

  canViewHelmets(): boolean {
    return this.isSupervisor(); // Solo supervisores pueden ver cascos
  }

  canModifyEquipment(): boolean {
    return this.isSupervisor(); // Solo supervisores pueden modificar equipos
  }

  canViewAllEquipments(): boolean {
    return this.isSupervisor(); // Solo supervisores pueden ver equipos
  }

  canViewAllMiners(): boolean {
    return this.isSupervisor(); // Solo supervisores pueden ver mineros
  }

  getToken(): string | null {
    return null;
  }
} 