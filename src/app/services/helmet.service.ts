import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

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

@Injectable({
  providedIn: 'root'
})
export class HelmetService {
  private helmets: Helmet[] = [
    {
      id: '1',
      uuid: 'HELM-001-UUID',
      serialNumber: 'HELM-001',
      status: 'activo-asignado',
      assignedTo: 'Carlos Mendoza',
      assignedToId: '1',
      equipmentId: '1',
      equipmentName: 'Equipo Mina Norte',
      supervisorId: '1',
      lastHeartbeat: '2 min',
      batteryLevel: 85,
      temperature: 36.5,
      location: 'Zona A-12',
      sensors: {
        gps: { lat: -33.4489, lng: -70.6693 },
        temperature: 36.5,
        heartRate: 72,
        acceleration: { x: 0.1, y: 0.2, z: 9.8 }
      }
    },
    {
      id: '2',
      uuid: 'HELM-002-UUID',
      serialNumber: 'HELM-002',
      status: 'activo-asignado',
      assignedTo: 'Ana Rodríguez',
      assignedToId: '2',
      equipmentId: '1',
      equipmentName: 'Equipo Mina Norte',
      supervisorId: '1',
      lastHeartbeat: '1 min',
      batteryLevel: 92,
      temperature: 37.1,
      location: 'Zona A-12',
      sensors: {
        gps: { lat: -33.4491, lng: -70.6695 },
        temperature: 37.1,
        heartRate: 68,
        acceleration: { x: 0.0, y: 0.1, z: 9.8 }
      }
    },
    {
      id: '3',
      uuid: 'HELM-003-UUID',
      serialNumber: 'HELM-003',
      status: 'activo-asignado',
      assignedTo: 'Miguel Torres',
      assignedToId: '3',
      equipmentId: '1',
      equipmentName: 'Equipo Mina Norte',
      supervisorId: '1',
      lastHeartbeat: '30 seg',
      batteryLevel: 15,
      temperature: 38.5,
      location: 'Zona A-12',
      sensors: {
        gps: { lat: -33.4487, lng: -70.6691 },
        temperature: 38.5,
        heartRate: 95,
        acceleration: { x: 2.1, y: 1.8, z: 8.5 }
      }
    },
    {
      id: '4',
      uuid: 'HELM-004-UUID',
      serialNumber: 'HELM-004',
      status: 'activo-sin-asignar',
      equipmentId: '2',
      equipmentName: 'Equipo Mina Sur',
      supervisorId: '1',
      lastHeartbeat: '3 min',
      batteryLevel: 78,
      temperature: 25.0,
      location: 'Almacén',
      sensors: {
        gps: { lat: -33.4495, lng: -70.6700 },
        temperature: 25.0,
        heartRate: 0,
        acceleration: { x: 0.0, y: 0.0, z: 9.8 }
      }
    },
    {
      id: '5',
      uuid: 'HELM-005-UUID',
      serialNumber: 'HELM-005',
      status: 'activo-sin-asignar',
      equipmentId: '2',
      equipmentName: 'Equipo Mina Sur',
      supervisorId: '1',
      lastHeartbeat: '5 min',
      batteryLevel: 95,
      temperature: 24.5,
      location: 'Almacén',
      sensors: {
        gps: { lat: -33.4496, lng: -70.6701 },
        temperature: 24.5,
        heartRate: 0,
        acceleration: { x: 0.0, y: 0.0, z: 9.8 }
      }
    },
    {
      id: '6',
      uuid: 'HELM-006-UUID',
      serialNumber: 'HELM-006',
      status: 'activo',
      supervisorId: '1',
      lastHeartbeat: '1 hora',
      batteryLevel: 100,
      temperature: 22.0,
      location: 'Taller',
      sensors: {
        gps: { lat: 0, lng: 0 },
        temperature: 22.0,
        heartRate: 0,
        acceleration: { x: 0.0, y: 0.0, z: 9.8 }
      }
    },
    {
      id: '7',
      uuid: 'HELM-007-UUID',
      serialNumber: 'HELM-007',
      status: 'inactivo',
      supervisorId: '1',
      lastHeartbeat: 'Nunca',
      batteryLevel: 0,
      temperature: 0,
      location: 'Registrado',
      sensors: {
        gps: { lat: 0, lng: 0 },
        temperature: 0,
        heartRate: 0,
        acceleration: { x: 0.0, y: 0.0, z: 0.0 }
      }
    },
    {
      id: '8',
      uuid: 'HELM-008-UUID',
      serialNumber: 'HELM-008',
      status: 'inactivo',
      supervisorId: '1',
      lastHeartbeat: 'Nunca',
      batteryLevel: 0,
      temperature: 0,
      location: 'Registrado',
      sensors: {
        gps: { lat: 0, lng: 0 },
        temperature: 0,
        heartRate: 0,
        acceleration: { x: 0.0, y: 0.0, z: 0.0 }
      }
    }
  ];

  constructor() {}

  getAllHelmets(): Observable<Helmet[]> {
    return of([...this.helmets]);
  }

  getHelmetsByStatus(status: Helmet['status']): Observable<Helmet[]> {
    return of(this.helmets.filter(helmet => helmet.status === status));
  }

  getHelmetsBySupervisor(supervisorId: string): Observable<Helmet[]> {
    return of(this.helmets.filter(helmet => helmet.supervisorId === supervisorId));
  }

  getHelmetById(id: string): Observable<Helmet | undefined> {
    return of(this.helmets.find(helmet => helmet.id === id));
  }

  createHelmet(helmet: Partial<Helmet>): Observable<Helmet> {
    const newHelmet: Helmet = {
      id: (this.helmets.length + 1).toString(),
      uuid: helmet.uuid || `HELM-${Date.now()}-UUID`,
      serialNumber: helmet.serialNumber || `HELM-${Date.now()}`,
      status: 'inactivo',
      supervisorId: helmet.supervisorId || '',
      lastHeartbeat: 'Nunca',
      batteryLevel: 0,
      temperature: 0,
      location: 'Registrado',
      sensors: {
        gps: { lat: 0, lng: 0 },
        temperature: 0,
        heartRate: 0,
        acceleration: { x: 0.0, y: 0.0, z: 0.0 }
      }
    };

    this.helmets.push(newHelmet);
    return of(newHelmet);
  }

  updateHelmetStatus(id: string, status: Helmet['status']): Observable<Helmet | undefined> {
    const helmet = this.helmets.find(h => h.id === id);
    if (helmet) {
      helmet.status = status;
      return of(helmet);
    }
    return of(undefined);
  }

  assignHelmetToMiner(helmetId: string, minerId: string, minerName: string): Observable<Helmet | undefined> {
    const helmet = this.helmets.find(h => h.id === helmetId);
    if (helmet) {
      helmet.assignedToId = minerId;
      helmet.assignedTo = minerName;
      helmet.status = 'activo-asignado';
      return of(helmet);
    }
    return of(undefined);
  }

  unassignHelmet(helmetId: string): Observable<Helmet | undefined> {
    const helmet = this.helmets.find(h => h.id === helmetId);
    if (helmet) {
      delete helmet.assignedToId;
      delete helmet.assignedTo;
      helmet.status = 'activo-sin-asignar';
      return of(helmet);
    }
    return of(undefined);
  }

  activateHelmet(helmetId: string): Observable<Helmet | undefined> {
    const helmet = this.helmets.find(h => h.id === helmetId);
    if (helmet && helmet.status === 'inactivo') {
      helmet.status = 'activo';
      helmet.lastHeartbeat = '1 min';
      helmet.batteryLevel = 100;
      helmet.temperature = 22.0;
      helmet.location = 'Taller';
      return of(helmet);
    }
    return of(undefined);
  }

  getHelmetStats(): Observable<{
    total: number;
    inactivo: number;
    activo: number;
    activoSinAsignar: number;
    activoAsignado: number;
  }> {
    const stats = {
      total: this.helmets.length,
      inactivo: this.helmets.filter(h => h.status === 'inactivo').length,
      activo: this.helmets.filter(h => h.status === 'activo').length,
      activoSinAsignar: this.helmets.filter(h => h.status === 'activo-sin-asignar').length,
      activoAsignado: this.helmets.filter(h => h.status === 'activo-asignado').length
    };
    return of(stats);
  }

  getStatusColor(status: Helmet['status']): string {
    switch (status) {
      case 'inactivo': return '#6c757d';
      case 'activo': return '#28a745';
      case 'activo-sin-asignar': return '#ffc107';
      case 'activo-asignado': return '#007bff';
      default: return '#6c757d';
    }
  }

  getStatusText(status: Helmet['status']): string {
    switch (status) {
      case 'inactivo': return 'Inactivo';
      case 'activo': return 'Activo';
      case 'activo-sin-asignar': return 'Sin Asignar';
      case 'activo-asignado': return 'Asignado';
      default: return 'Desconocido';
    }
  }
} 