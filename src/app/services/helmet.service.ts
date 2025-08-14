import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map, catchError, shareReplay } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Helmet {
  id: string;
  uuid: string;
  serialNumber: string;
  status: 'inactivo' | 'activo' | 'activo-asignado' | 'activo-sin-asignar';
  assignedTo?: string;
  assignedToId?: string;
  assignedToEmail?: string;
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

export interface HelmetStats {
  total: number;
  active: number;
  assigned: number;
  inactive: number;
  utilizationRate: number;
}

@Injectable({
  providedIn: 'root'
})
export class HelmetService {
  private apiUrl = environment.apiUrl;
  private helmetsCache$: Observable<Helmet[]> | null = null;

  constructor(private http: HttpClient) { }

  /**
   * Obtiene todos los cascos con cache
   */
  getAllHelmets(): Observable<Helmet[]> {
    if (!this.helmetsCache$) {
      this.helmetsCache$ = this.http.get<any>(`${this.apiUrl}/cascos/my-helmets`, { withCredentials: true }).pipe(
        map(response => (response.data || []).map((item: any) => ({
          id: item.id,
          uuid: item.physicalId || item.uuid || '',
          serialNumber: item.serial || item.serialNumber || '',
          status: (item.isActive === 1 || item.isActive === true) ? ((item.asignadoMinero === 1 || item.asignadoMinero === true) ? 'activo-asignado' : 'activo-sin-asignar') : 'inactivo',
          assignedTo: item.minero ? item.minero.fullName : undefined,
          assignedToId: (item.minero ? item.minero.id : undefined) || item.mineroId || undefined,
          assignedToEmail: item.minero ? item.minero.email : undefined,
          equipmentId: undefined, // Ajustar si hay campo en backend
          equipmentName: undefined, // Ajustar si hay campo en backend
          supervisorId: item.supervisorId,
          lastHeartbeat: item.updatedAt || '',
          batteryLevel: undefined, // Ajustar si hay campo en backend
          temperature: undefined, // Ajustar si hay campo en backend
          location: undefined, // Ajustar si hay campo en backend
          sensors: undefined // Ajustar si hay campo en backend
        }))),
        catchError(error => {
          console.error('Error fetching helmets:', error);
          return of([]);
        }),
        shareReplay(1)
      );
    }
    return this.helmetsCache$;
  }

  /**
   * Limpia el cache de cascos
   */
  clearCache(): void {
    this.helmetsCache$ = null;
  }

  /**
   * Obtiene un casco por ID
   */
  getHelmetById(id: string): Observable<Helmet> {
    return this.http.get<any>(`${this.apiUrl}/cascos/${id}`, { withCredentials: true }).pipe(
      map(response => response.data),
      catchError(error => {
        console.error('Error fetching helmet:', error);
        throw error;
      })
    );
  }

  /**
   * Activa un casco
   */
  activateHelmet(physicalId: string): Observable<any> {
    this.clearCache();
    return this.http.post<any>(`${this.apiUrl}/cascos/activate`, { physicalId }, { withCredentials: true }).pipe(
      map(response => response.data),
      catchError(error => {
        console.error('Error activating helmet:', error);
        throw error;
      })
    );
  }

  /**
   * Asigna un casco a un minero
   */
  assignHelmet(helmetId: string, mineroId: string): Observable<any> {
    this.clearCache();
    return this.http.post<any>(`${this.apiUrl}/cascos/assign`, { cascoId: helmetId, mineroId }, { withCredentials: true }).pipe(
      map(response => response.data),
      catchError(error => {
        console.error('Error assigning helmet:', error);
        throw error;
      })
    );
  }

  /**
   * Desasigna un casco
   */
  unassignHelmet(helmetId: string): Observable<any> {
    this.clearCache();
    return this.http.post<any>(`${this.apiUrl}/cascos/unassign`, { cascoId: helmetId }, { withCredentials: true }).pipe(
      map(response => response.data),
      catchError(error => {
        console.error('Error unassigning helmet:', error);
        throw error;
      })
    );
  }

  /**
   * Crea un nuevo casco
   */
  createHelmet(helmet: Partial<Helmet>): Observable<Helmet> {
    console.log('Creating helmet:', helmet);
    this.clearCache(); // Limpiar cache después de modificar
    // Mapear serialNumber a physicalId para el backend
    const payload: any = { ...helmet };
    if (helmet.serialNumber) {
      payload.physicalId = helmet.serialNumber;
      delete payload.serialNumber;
    }
    if (helmet.supervisorId) {
      payload.supervisorId = helmet.supervisorId;
    }
    return this.http.post<any>(`${this.apiUrl}/cascos`, payload, { withCredentials: true }).pipe(
      map(response => response.data),
      catchError(error => {
        console.error('Error creating helmet:', error);
        throw error;
      })
    );
  }

  /**
   * Actualiza un casco existente
   */
  updateHelmet(id: string, helmet: Partial<Helmet>): Observable<Helmet> {
    this.clearCache();
    // Mapear serialNumber a serial y physicalId si corresponde
    const payload: any = { ...helmet };
    if (helmet.serialNumber) payload.serial = helmet.serialNumber;
    if (helmet.uuid) payload.physicalId = helmet.uuid;
    return this.http.put<any>(`${this.apiUrl}/cascos/${id}`, payload, { withCredentials: true }).pipe(
      map(response => response.data),
      catchError(error => {
        console.error('Error updating helmet:', error);
        throw error;
      })
    );
  }

  /**
   * Elimina un casco
   */
  deleteHelmet(id: string): Observable<void> {
    this.clearCache();
    return this.http.delete<any>(`${this.apiUrl}/cascos/${id}`, { withCredentials: true }).pipe(
      map(() => { }),
      catchError(error => {
        console.error('Error deleting helmet:', error);
        throw error;
      })
    );
  }

  getHelmetStats(): Observable<HelmetStats> {
    return this.getAllHelmets().pipe(
      map(helmets => {
        const total = helmets.length
        const active = helmets.filter(h => h.status === 'activo').length
        const assigned = helmets.filter(h => h.status === 'activo-asignado').length
        const inactive = helmets.filter(h => h.status === 'inactivo').length

        return {
          total,
          active,
          assigned,
          inactive,
          utilizationRate: total > 0 ? (assigned / total) * 100 : 0
        }
      }),
      catchError(error => {
        console.error('Error calculating helmet stats:', error);
        return of({
          total: 0,
          active: 0,
          assigned: 0,
          inactive: 0,
          utilizationRate: 0
        });
      })
    )
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