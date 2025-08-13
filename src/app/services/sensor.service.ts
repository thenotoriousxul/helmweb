import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';

export interface SensorReading {
  _id?: string;
  sensorId: string;
  cascoId: string;
  mineroId?: string;
  value: number;
  unit: string;
  isNormal: boolean;
  isAlert: boolean;
  batteryLevel?: number;
  signalStrength?: number;
  location?: { latitude: number; longitude: number; accuracy?: number } | string | null;
  metadata?: Record<string, any>;
  timestamp?: string;
  receivedAt?: string;
  createdAt?: string;
  // Campos enriquecidos por el backend (UTC y Local)
  createdAtUtc?: string | null;
  createdAtLocal?: string | null;
  timestampUtc?: string | null;
  timestampLocal?: string | null;
}

@Injectable({ providedIn: 'root' })
export class SensorService {
  private apiUrl = 'http://localhost:3333';

  constructor(private http: HttpClient) {}

  getReadingsByCreated(
    field: 'sensorId' | 'cascoId' | 'mineroId',
    identifier: string,
    startDate?: string,
    endDate?: string,
    limit?: number
  ): Observable<SensorReading[]> {
    let params = new HttpParams().set('field', field).set('identifier', identifier);
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    if (limit) params = params.set('limit', String(limit));

    return this.http
      .get<any>(`${this.apiUrl}/sensors/readings/by-created`, { params, withCredentials: true })
      .pipe(
        map((res) => res?.data || []),
        catchError((err) => {
          console.error('Error fetching sensor readings:', err);
          return of([]);
        }),
        shareReplay(1)
      );
  }
}


