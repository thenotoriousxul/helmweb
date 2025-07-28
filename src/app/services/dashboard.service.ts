import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

export interface DashboardStats {
  totalTeams: number;
  totalHelmets: number;
  activeHelmets: number;
  totalAlerts: number;
  totalSupervisors: number;
  helmetsWithSupervisor: number;
  helmetsWithoutMiner: number;
  totalMiners: number;
  activeMiners: number;
}

export interface TeamData {
  id: string;
  name: string;
  location: string;
  status: 'active' | 'inactive' | 'warning';
  totalHelmets: number;
  activeHelmets: number;
  alerts: number;
  miners: Array<{
    id: string;
    name: string;
    avatar: string;
    status: 'online' | 'offline' | 'alert';
  }>;
  lastUpdate: string;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = 'http://localhost:3333';

  constructor(private http: HttpClient) {}

  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<any>(`${this.apiUrl}/dashboard`, { withCredentials: true }).pipe(
      map(response => response.data),
      catchError(error => {
        console.error('Error fetching dashboard stats:', error);
        return of({
          totalTeams: 0,
          totalHelmets: 0,
          activeHelmets: 0,
          totalAlerts: 0,
          totalSupervisors: 0,
          helmetsWithSupervisor: 0,
          helmetsWithoutMiner: 0,
          totalMiners: 0,
          activeMiners: 0
        });
      })
    );
  }

  getTeamsData(): Observable<TeamData[]> {
    return this.http.get<any>(`${this.apiUrl}/dashboard/teams`, { withCredentials: true }).pipe(
      map(response => response.data),
      catchError(error => {
        console.error('Error fetching teams data:', error);
        return of([]);
      })
    );
  }
} 