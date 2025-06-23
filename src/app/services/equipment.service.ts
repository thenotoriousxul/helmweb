import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface Equipment {
  id: string;
  name: string;
  totalHelmets: number;
  activeHelmets: number;
  status: 'active' | 'inactive' | 'warning';
  alerts: number;
  miners: Array<{
    id: string;
    name: string;
    avatar: string;
    status: 'online' | 'offline' | 'alert';
  }>;
  location: string;
  lastUpdate: string;
}

export interface SensorData {
  timestamp: string;
  temperature: number;
  humidity: number;
  pressure: number;
  movement: number;
  battery: number;
}

export interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  timestamp: string;
  miner?: string;
  resolved: boolean;
}

export interface MinerDetail {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'offline' | 'alert';
  temperature: number;
  battery: number;
  location: string;
  lastActivity: string;
  alerts: number;
  heartRate: number;
  oxygenLevel: number;
}

@Injectable({
  providedIn: 'root'
})
export class EquipmentService {
  private equipments: Equipment[] = [
    {
      id: '1',
      name: 'Equipo Mina Norte',
      totalHelmets: 45,
      activeHelmets: 42,
      status: 'active',
      alerts: 2,
      location: 'Zona A-12',
      lastUpdate: '2 min',
      miners: [
        { id: '1', name: 'Carlos M.', avatar: 'CM', status: 'online' },
        { id: '2', name: 'Ana R.', avatar: 'AR', status: 'online' },
        { id: '3', name: 'Miguel T.', avatar: 'MT', status: 'alert' }
      ]
    },
    {
      id: '2',
      name: 'Equipo Mina Sur',
      totalHelmets: 38,
      activeHelmets: 35,
      status: 'active',
      alerts: 1,
      location: 'Zona B-8',
      lastUpdate: '5 min',
      miners: [
        { id: '4', name: 'Luis P.', avatar: 'LP', status: 'online' },
        { id: '5', name: 'María G.', avatar: 'MG', status: 'online' },
        { id: '6', name: 'Roberto S.', avatar: 'RS', status: 'offline' }
      ]
    },
    {
      id: '3',
      name: 'Equipo Mina Este',
      totalHelmets: 52,
      activeHelmets: 48,
      status: 'warning',
      alerts: 5,
      location: 'Zona C-15',
      lastUpdate: '1 min',
      miners: [
        { id: '7', name: 'Elena V.', avatar: 'EV', status: 'alert' },
        { id: '8', name: 'Diego H.', avatar: 'DH', status: 'online' },
        { id: '9', name: 'Sofia L.', avatar: 'SL', status: 'alert' }
      ]
    },
    {
      id: '4',
      name: 'Equipo Mina Oeste',
      totalHelmets: 29,
      activeHelmets: 25,
      status: 'inactive',
      alerts: 0,
      location: 'Zona D-3',
      lastUpdate: '15 min',
      miners: [
        { id: '10', name: 'Pedro M.', avatar: 'PM', status: 'offline' },
        { id: '11', name: 'Carmen F.', avatar: 'CF', status: 'offline' },
        { id: '12', name: 'Jorge A.', avatar: 'JA', status: 'offline' }
      ]
    },
    {
      id: '5',
      name: 'Equipo Mina Central',
      totalHelmets: 41,
      activeHelmets: 39,
      status: 'active',
      alerts: 1,
      location: 'Zona E-7',
      lastUpdate: '3 min',
      miners: [
        { id: '13', name: 'Isabel C.', avatar: 'IC', status: 'online' },
        { id: '14', name: 'Fernando R.', avatar: 'FR', status: 'online' },
        { id: '15', name: 'Patricia M.', avatar: 'PM', status: 'alert' }
      ]
    },
    {
      id: '6',
      name: 'Equipo Mina Profunda',
      totalHelmets: 33,
      activeHelmets: 30,
      status: 'active',
      alerts: 3,
      location: 'Zona F-22',
      lastUpdate: '4 min',
      miners: [
        { id: '16', name: 'Ricardo B.', avatar: 'RB', status: 'online' },
        { id: '17', name: 'Lucía N.', avatar: 'LN', status: 'alert' },
        { id: '18', name: 'Alberto K.', avatar: 'AK', status: 'online' }
      ]
    }
  ];

  constructor() {}

  getEquipments(): Observable<Equipment[]> {
    return of(this.equipments);
  }

  getEquipmentById(id: string): Observable<Equipment | undefined> {
    const equipment = this.equipments.find(eq => eq.id === id);
    return of(equipment);
  }

  getSensorData(): Observable<SensorData[]> {
    // Simular datos de sensores para las últimas 24 horas
    const now = new Date();
    const sensorData = Array.from({ length: 24 }, (_, i) => {
      const time = new Date(now.getTime() - (23 - i) * 60 * 60 * 1000);
      return {
        timestamp: time.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        temperature: 35 + Math.random() * 5 + Math.sin(i / 3) * 2,
        humidity: 40 + Math.random() * 20 + Math.cos(i / 4) * 5,
        pressure: 1013 + Math.random() * 10 + Math.sin(i / 2) * 3,
        movement: Math.random() * 100,
        battery: 85 - (i * 0.5) + Math.random() * 5
      };
    });
    return of(sensorData);
  }

  getAlerts(): Observable<Alert[]> {
    const alerts: Alert[] = [
      {
        id: '1',
        type: 'critical',
        title: 'Temperatura Crítica',
        description: 'Temperatura corporal elevada detectada en minero Carlos M.',
        timestamp: 'Hace 2 min',
        miner: 'Carlos M.',
        resolved: false
      },
      {
        id: '2',
        type: 'warning',
        title: 'Batería Baja',
        description: 'Batería del casco por debajo del 20% en minero Ana R.',
        timestamp: 'Hace 5 min',
        miner: 'Ana R.',
        resolved: false
      },
      {
        id: '3',
        type: 'critical',
        title: 'Caída Detectada',
        description: 'Posible caída detectada en minero Miguel T.',
        timestamp: 'Hace 8 min',
        miner: 'Miguel T.',
        resolved: false
      },
      {
        id: '4',
        type: 'info',
        title: 'Mineros Offline',
        description: '3 mineros sin conexión en Equipo Mina Oeste',
        timestamp: 'Hace 15 min',
        resolved: false
      }
    ];
    return of(alerts);
  }

  getMinersDetail(): Observable<MinerDetail[]> {
    const miners: MinerDetail[] = [
      {
        id: '1',
        name: 'Carlos Mendoza',
        avatar: 'CM',
        status: 'online',
        temperature: 37.2,
        battery: 85,
        location: 'Zona A-12, Nivel 3',
        lastActivity: 'Hace 30 seg',
        alerts: 1,
        heartRate: 72,
        oxygenLevel: 98
      },
      {
        id: '2',
        name: 'Ana Rodríguez',
        avatar: 'AR',
        status: 'online',
        temperature: 36.8,
        battery: 18,
        location: 'Zona A-12, Nivel 2',
        lastActivity: 'Hace 1 min',
        alerts: 1,
        heartRate: 68,
        oxygenLevel: 99
      },
      {
        id: '3',
        name: 'Miguel Torres',
        avatar: 'MT',
        status: 'alert',
        temperature: 38.5,
        battery: 92,
        location: 'Zona A-12, Nivel 1',
        lastActivity: 'Hace 2 min',
        alerts: 2,
        heartRate: 95,
        oxygenLevel: 96
      },
      {
        id: '4',
        name: 'Luis Pérez',
        avatar: 'LP',
        status: 'online',
        temperature: 36.5,
        battery: 78,
        location: 'Zona B-8, Nivel 4',
        lastActivity: 'Hace 45 seg',
        alerts: 0,
        heartRate: 70,
        oxygenLevel: 98
      },
      {
        id: '5',
        name: 'María García',
        avatar: 'MG',
        status: 'online',
        temperature: 37.0,
        battery: 65,
        location: 'Zona B-8, Nivel 3',
        lastActivity: 'Hace 1 min',
        alerts: 0,
        heartRate: 75,
        oxygenLevel: 97
      }
    ];
    return of(miners);
  }
} 