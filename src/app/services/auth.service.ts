import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'SUPERVISOR' | 'MINERO' | 'ADMIN';
  avatar: string;
  department?: string;
  teamId?: string;
  supervisorId?: string;
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

  constructor() {
    // Simular usuario logueado para desarrollo
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }

  login(email: string, password: string): Observable<User> {
    // Simulación de login - en producción esto sería una llamada HTTP
    return new Observable(observer => {
      setTimeout(() => {
        let user: User;
        
        if (email.includes('supervisor')) {
          user = {
            id: '1',
            name: 'Juan Supervisor',
            email: email,
            role: 'SUPERVISOR',
            avatar: 'JS',
            department: 'Minería'
          };
        } else if (email.includes('minero')) {
          user = {
            id: '2',
            name: 'Carlos Minero',
            email: email,
            role: 'MINERO',
            avatar: 'CM',
            department: 'Minería',
            teamId: '1',
            supervisorId: '1'
          };
        } else {
          user = {
            id: '3',
            name: 'Admin Sistema',
            email: email,
            role: 'ADMIN',
            avatar: 'AS',
            department: 'IT'
          };
        }

        localStorage.setItem('currentUser', JSON.stringify(user));
        this.currentUserSubject.next(user);
        observer.next(user);
        observer.complete();
      }, 1000);
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
    return this.hasRole('SUPERVISOR');
  }

  isMinero(): boolean {
    return this.hasRole('MINERO');
  }

  isAdmin(): boolean {
    return this.hasRole('ADMIN');
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