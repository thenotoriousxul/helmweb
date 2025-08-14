import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map, catchError, shareReplay } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Team {
  id: string;
  nombre: string;
  zona: string;
  supervisorId: string;
  supervisor?: {
    id: string;
    fullName: string;
    email: string;
  };
  mineros?: TeamMiner[];
  createdAt?: string;
  updatedAt?: string;
}

export interface TeamMiner {
  id: string;
  equipoId: string;
  mineroId: string;
  activo: boolean;
  minero?: {
    id: string;
    fullName: string;
    email: string;
    status: string;
    rfc?: string;
    phone?: string;
  };
  fechaAsignacion?: string;
}

export interface TeamStats {
  totalTeams: number;
  totalSupervisors: number;
  avgMinersPerTeam: number;
}

@Injectable({
  providedIn: 'root'
})
export class TeamService {
  private apiUrl = environment.apiUrl;
  private teamsCache$: Observable<Team[]> | null = null;
  private statsCache$: Observable<TeamStats> | null = null;

  constructor(private http: HttpClient) {}

  private generateUuid(): string {
    // Usa crypto.randomUUID si está disponible, si no, fallback
    const g = (window as any)?.crypto?.randomUUID?.();
    if (g) return g;
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  /**
   * Obtiene todos los equipos con cache
   */
  getAllTeams(): Observable<Team[]> {
    if (!this.teamsCache$) {
      this.teamsCache$ = this.http.get<any>(`${this.apiUrl}/teams`, { withCredentials: true }).pipe(
        map(response => response.data || []),
        catchError(error => {
          console.error('Error fetching teams:', error);
          return of([]);
        }),
        shareReplay(1)
      );
    }
    return this.teamsCache$;
  }

  /**
   * Limpia el cache de equipos
   */
  clearCache(): void {
    this.teamsCache$ = null;
    this.statsCache$ = null;
  }

  /**
   * Obtiene un equipo por ID
   */
  getTeamById(id: string): Observable<Team> {
    return this.http.get<any>(`${this.apiUrl}/teams/${id}`, { withCredentials: true }).pipe(
      map(response => response.data),
      catchError(error => {
        console.error('Error fetching team:', error);
        throw error;
      })
    );
  }

  /**
   * Crea un nuevo equipo
   */
  createTeam(team: Partial<Team>): Observable<Team> {
    this.clearCache(); // Limpiar cache después de modificar
    return this.http.post<any>(`${this.apiUrl}/teams`, team, { withCredentials: true }).pipe(
      map(response => response.data),
      catchError(error => {
        console.error('Error creating team:', error);
        throw error;
      })
    );
  }

  /**
   * Actualiza un equipo existente
   */
  updateTeam(id: string, team: Partial<Team>): Observable<Team> {
    this.clearCache(); // Limpiar cache después de modificar
    return this.http.put<any>(`${this.apiUrl}/teams/${id}`, team, { withCredentials: true }).pipe(
      map(response => response.data),
      catchError(error => {
        console.error('Error updating team:', error);
        throw error;
      })
    );
  }

  /**
   * Elimina un equipo
   */
  deleteTeam(id: string): Observable<void> {
    this.clearCache(); // Limpiar cache después de modificar
    return this.http.delete<any>(`${this.apiUrl}/teams/${id}`, { withCredentials: true }).pipe(
      map(() => {}),
      catchError(error => {
        console.error('Error deleting team:', error);
        throw error;
      })
    );
  }

  /**
   * Asigna un minero a un equipo (backend Adonis)
   */
  assignMinerToTeam(teamId: string, mineroId: string): Observable<any> {
    this.clearCache();
    const payload: any = { teamId, mineroId };
    // Proveer un id generado por cliente por si el backend lo acepta
    payload.id = this.generateUuid();
    return this.http.post<any>(`${this.apiUrl}/teams/${teamId}/assign-miner`, payload, { withCredentials: true }).pipe(
      map(response => response.data),
      catchError(error => {
        console.error('Error asignando minero a equipo:', error);
        throw error;
      })
    );
  }

  /**
   * Remueve un minero de un equipo
   */
  removeMinerFromTeam(teamId: string, mineroId: string): Observable<void> {
    this.clearCache(); // Limpiar cache después de modificar
    return this.http.delete<any>(`${this.apiUrl}/teams/${teamId}/miners/${mineroId}`, { withCredentials: true }).pipe(
      map(() => {}),
      catchError(error => {
        console.error('Error removing miner from team:', error);
        throw error;
      })
    );
  }

  /**
   * Obtiene estadísticas de equipos con cache
   */
  getTeamStats(): Observable<TeamStats> {
    if (!this.statsCache$) {
      this.statsCache$ = this.http.get<any>(`${this.apiUrl}/teams/stats`, { withCredentials: true }).pipe(
        map(response => response.data),
        catchError(error => {
          console.error('Error fetching team stats:', error);
          return of({
            totalTeams: 0,
            totalSupervisors: 0,
            avgMinersPerTeam: 0
          });
        }),
        shareReplay(1)
      );
    }
    return this.statsCache$;
  }

  /**
   * Obtiene equipos por supervisor
   */
  getTeamsBySupervisor(supervisorId: string): Observable<Team[]> {
    return this.getAllTeams().pipe(
      map(teams => teams.filter(team => team.supervisorId === supervisorId))
    );
  }

  /**
   * Obtiene equipos disponibles para asignar mineros
   */
  getAvailableTeams(): Observable<Team[]> {
    return this.getAllTeams().pipe(
      map(teams => teams.filter(team => team.mineros && team.mineros.length < 10)) // Máximo 10 mineros por equipo
    );
  }
} 