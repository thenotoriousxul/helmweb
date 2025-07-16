import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

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
    temperature: number;
    heartRate: number;
    acceleration: { x: number; y: number; z: number };
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

  constructor(private http: HttpClient) {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser && storedUser !== 'null' && storedUser !== 'undefined' && storedUser.trim() !== '') {
      try {
        const user = JSON.parse(storedUser);
        this.currentUserSubject.next(user);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('currentUser');
      }
    }
  }

  login(email: string, password: string): Observable<any> {
    return new Observable(observer => {
      this.http.post<any>('http://localhost:3333/login', { email, password }, { withCredentials: true })
        .subscribe({
          next: (response) => {
            const user = response.data.user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            this.currentUserSubject.next(user);
            observer.next(user);
            observer.complete();
          },
          error: (err) => {
            observer.error(err);
          }
        });
    });
  }

  register(data: { fullName: string; email: string; password: string; codigo: string }): Observable<any> {
    return new Observable(observer => {
      this.http.post<any>('http://localhost:3333/register', data, { withCredentials: true })
        .subscribe({
          next: (response) => {
            const user = response.data.user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            this.currentUserSubject.next(user);
            observer.next(user);
            observer.complete();
          },
          error: (err) => {
            observer.error(err);
          }
        });
    });
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
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
    return this.isSupervisor() || this.isAdmin();
  }

  canCreateMiner(): boolean {
    return this.isSupervisor() || this.isAdmin();
  }

  canCreateHelmet(): boolean {
    return this.isAdmin();
  }

  canModifyEquipment(): boolean {
    return this.isSupervisor() || this.isAdmin();
  }

  canViewAllEquipments(): boolean {
    return this.isSupervisor() || this.isAdmin();
  }

  canViewAllMiners(): boolean {
    return this.isSupervisor() || this.isAdmin();
  }
} 