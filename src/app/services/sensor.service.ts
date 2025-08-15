import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface SensorReading {
  _id?: string;
  localId?: string | null;
  sensorId: string;
  sensorLocalId?: string | null;
  identificador?: string;
  cascoId: string;
  mineroId?: string;
  value: number;
  unit: string;
  isNormal: boolean;
  isAlert: boolean;
  batteryLevel?: number | null;
  signalStrength?: number | null;
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

export interface TimeSeriesPoint {
  t: string;
  y: number;
}

export interface SensorTimeSeries {
  unit: string;
  points: TimeSeriesPoint[];
}

export interface TriSeriesResponse {
  success: boolean;
  message: string;
  data: {
    meta: {
      agg: string;
      bucket: string;
      tz: string;
      start: string | null;
      end: string | null;
      filters: {
        cascoId: string;
        sensorId: string | null;
        mineroId: string | null;
      };
    };
    mq7: SensorTimeSeries;
    temp: SensorTimeSeries;
    bpm: SensorTimeSeries;
  };
}

@Injectable({ providedIn: 'root' })
export class SensorService {
  private apiUrl = environment.apiUrl;

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

  getTriSeries(cascoId: string, startDate?: string, endDate?: string): Observable<TriSeriesResponse> {
    let params = new HttpParams().set('cascoId', cascoId);
    if (startDate) params = params.set('start', startDate);
    if (endDate) params = params.set('end', endDate);

    return this.http
      .get<TriSeriesResponse>(`${this.apiUrl}/sensors/readings/tri-series`, { params, withCredentials: true })
      .pipe(
        catchError((err) => {
          console.error('Error fetching tri-series data:', err);
          return of({
            success: false,
            message: 'Error fetching data',
            data: {
              meta: {
                agg: 'avg',
                bucket: 'hour',
                tz: 'America/Monterrey',
                start: null,
                end: null,
                filters: { cascoId, sensorId: null, mineroId: null }
              },
              mq7: { unit: 'ppm', points: [] },
              temp: { unit: '°C', points: [] },
              bpm: { unit: 'bpm', points: [] }
            }
          });
        }),
        shareReplay(1)
      );
  }
}


