import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Supervisor {
  id: string;
  fullName: string;
  email: string;
  role: string;
  avatar: string;
  department: string;
  totalHelmets: number;
  activeHelmets: number;
  inactiveHelmets: number;
  createdAt: string;
}

export interface SupervisorStats {
  totalSupervisors: number;
  activeSupervisors: number;
  inactiveSupervisors: number;
  totalHelmets: number;
  activeHelmets: number;
  inactiveHelmets: number;
}

@Injectable({
  providedIn: 'root'
})
export class SupervisorService {
  private apiUrl = environment.apiUrl || 'http://localhost:3333';

  constructor(private http: HttpClient) { }

  /**
   * Obtiene todos los supervisores
   */
  getSupervisors(): Observable<Supervisor[]> {
    return this.http
      .get<any>(`${this.apiUrl}/supervisors`, { withCredentials: true })
      .pipe((source) => new Observable<Supervisor[]>(subscriber => {
        source.subscribe({
          next: (res) => {
            const list = Array.isArray(res) ? res : (res?.data || []);
            subscriber.next(list as Supervisor[]);
            subscriber.complete();
          },
          error: (err) => subscriber.error(err)
        });
      }));
  }

  /**
   * Obtiene un supervisor específico por ID
   */
  getSupervisor(id: string): Observable<Supervisor> {
    return this.http.get<Supervisor>(`${this.apiUrl}/supervisors/${id}`, { withCredentials: true });
  }

  /**
   * Obtiene estadísticas de supervisores
   */
  getSupervisorStats(): Observable<SupervisorStats> {
    return this.http.get<SupervisorStats>(`${this.apiUrl}/supervisors/stats`, { withCredentials: true });
  }

  /**
   * Genera un código de acceso para un nuevo supervisor
   */
  generateAccessCode(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/access-codes`, { email }, { withCredentials: true });
  }

  /**
   * Obtiene el código de acceso para un email específico
   */
  getAccessCodeByEmail(email: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/access-codes/${encodeURIComponent(email)}`, { withCredentials: true });
  }

  /**
   * Obtiene todos los códigos de acceso (para debugging)
   */
  getAllAccessCodes(): Observable<any> {
    return this.http.get(`${this.apiUrl}/access-codes`, { withCredentials: true });
  }

  /**
   * Elimina un supervisor por ID (solo admin)
   */
  deleteSupervisor(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/supervisors/${id}`, { withCredentials: true });
  }

  /**
   * Elimina un código de acceso por su valor (solo admin)
   * Nota: asumimos endpoint DELETE /access-codes/:code
   */
  deleteAccessCode(code: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/access-codes/${encodeURIComponent(code)}`, { withCredentials: true });
  }
} 