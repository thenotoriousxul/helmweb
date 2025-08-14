import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map, catchError, shareReplay } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

export interface Minero {
  id: string;
  fullName: string;
  email: string;
  role: string;
  birthDate: string;
  phone: string;
  rfc: string;
  address: string;
  photo: string;
  teamId?: string;
  genero?: 'masculino' | 'femenino';
  especialidadEnMineria?: string;
  fechaContratacion?: string;
  cascoId?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface MineroStats {
  totalMiners: number;
  activeMiners: number;
  inactiveMiners: number;
  avgAge: number;
}

@Injectable({
  providedIn: 'root'
})
export class MineroService {
  private apiUrl = environment.apiUrl;
  private minersCache$: Observable<Minero[]> | null = null;
  private statsCache$: Observable<MineroStats> | null = null;

  constructor(private http: HttpClient, private authService: AuthService) {}

  /**
   * Obtiene todos los mineros con cache
   */
  getAllMiners(): Observable<Minero[]> {
    if (!this.minersCache$) {
      // Determinar el endpoint basado en el rol del usuario
      const endpoint = this.authService.isSupervisor() ? '/supervisor/mineros' : '/mineros';
      
      this.minersCache$ = this.http.get<any>(`${this.apiUrl}${endpoint}`, { withCredentials: true }).pipe(
        map(response => {
          return (response.data || []).map((item: any) => {
            const rawPhoto: string = (
              item.photo ||
              item.photoUrl ||
              item.photoURL ||
              item.profilePhoto ||
              item.profilePhotoUrl ||
              item.avatarUrl ||
              item.avatar_url ||
              item.avatar ||
              item.imageUrl ||
              item.image ||
              item.pictureUrl ||
              ''
            );
            const photo: string = rawPhoto && /^https?:\/\//i.test(rawPhoto)
              ? rawPhoto
              : (rawPhoto ? `${this.apiUrl}${rawPhoto.startsWith('/') ? '' : '/'}${rawPhoto}` : '');
            return ({
            id: item.id,
            fullName: item.fullName || '',
            email: item.email || '',
            role: item.role || '',
            birthDate: item.birthDate || '',
            phone: item.phone || '',
            rfc: item.rfc || '',
            address: item.address || '',
            photo,
            teamId: undefined, // Ajustar si hay campo en backend
            genero: item.genero || undefined,
            especialidadEnMineria: item.especialidadEnMineria || undefined,
            fechaContratacion: item.fechaContratacion || undefined,
            cascoId: item.cascoId || undefined,
            status: item.estado || '',
            createdAt: item.createdAt || '',
            updatedAt: item.updatedAt || ''
          });
          });
        }),
        catchError(error => {
          console.error('Error fetching miners:', error);
          return of([]);
        }),
        shareReplay(1)
      );
    }
    return this.minersCache$;
  }

  /**
   * Limpia el cache de mineros
   */
  clearCache(): void {
    this.minersCache$ = null;
    this.statsCache$ = null;
  }

  /**
   * Obtiene un minero por ID
   */
  getMineroById(id: string): Observable<Minero> {
    return this.http.get<any>(`${this.apiUrl}/mineros/${id}`, { withCredentials: true }).pipe(
      map(response => response.data),
      catchError(error => {
        console.error('Error obteniendo detalle de minero:', error);
        throw error;
      })
    );
  }

  /**
   * Crea un nuevo minero
   */
  createMinero(minero: Partial<Minero>): Observable<Minero> {
    this.clearCache(); // Limpiar cache después de modificar
    return this.http.post<any>(`${this.apiUrl}/mineros`, minero, { withCredentials: true }).pipe(
      map(response => response.data),
      catchError(error => {
        console.error('Error creating miner:', error);
        throw error;
      })
    );
  }

  /**
   * Actualiza un minero existente
   */
  updateMinero(id: string, minero: Partial<Minero>): Observable<Minero> {
    this.clearCache(); // Limpiar cache después de modificar
    return this.http.put<any>(`${this.apiUrl}/mineros/${id}`, minero, { withCredentials: true }).pipe(
      map(response => response.data),
      catchError(error => {
        console.error('Error updating miner:', error);
        throw error;
      })
    );
  }

  /**
   * Elimina un minero
   */
  deleteMinero(id: string): Observable<void> {
    this.clearCache(); // Limpiar cache después de modificar
    return this.http.delete<any>(`${this.apiUrl}/mineros/${id}`, { withCredentials: true }).pipe(
      map(() => {}),
      catchError(error => {
        console.error('Error deleting miner:', error);
        throw error;
      })
    );
  }

  /**
   * Obtiene estadísticas de mineros con cache
   */
  getMineroStats(): Observable<MineroStats> {
    if (!this.statsCache$) {
      // Determinar el endpoint basado en el rol del usuario
      const endpoint = this.authService.isSupervisor() ? '/supervisor/mineros/stats' : '/mineros/stats';
      
      this.statsCache$ = this.http.get<any>(`${this.apiUrl}${endpoint}`, { withCredentials: true }).pipe(
        map(response => response.data),
        catchError(error => {
          console.error('Error fetching miner stats:', error);
          return of({
            totalMiners: 0,
            activeMiners: 0,
            inactiveMiners: 0,
            avgAge: 0
          });
        }),
        shareReplay(1)
      );
    }
    return this.statsCache$;
  }
} 