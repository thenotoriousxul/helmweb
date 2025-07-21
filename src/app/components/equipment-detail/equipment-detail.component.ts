import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

interface TeamMiner {
  id: number;
  mineroId: string;
  equipoId: string;
  activo: boolean;
  fechaAsignacion: string;
  fechaSalida: string | null;
  createdAt: string;
  updatedAt: string | null;
  minero?: {
    id: string;
    fullName: string;
    email?: string;
    especialidadEnMineria?: string;
    genero?: string;
    fechaContratacion?: string;
    birthDate?: string;
    phone?: string;
    address?: string;
    rfc?: string;
    // otros campos relevantes
  };
}

interface Equipment {
  id: string;
  nombre: string;
  zona: string;
  supervisor?: { fullName: string } | string;
  createdAt: string;
  updatedAt: string;
  mineros: TeamMiner[];
  // otros campos si es necesario
}

interface Helmet {
  id: string;
  minerId: string;
  minerName: string;
  status: 'active' | 'inactive' | 'warning';
  batteryLevel: number;
  lastSignal: string;
  location: string;
  alerts: number;
}

interface Alert {
  id: string;
  type: 'battery' | 'signal' | 'impact' | 'gas' | 'temperature';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  status: 'active' | 'resolved' | 'acknowledged';
  minerId: string;
  minerName: string;
}

@Component({
  selector: 'app-equipment-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './equipment-detail.component.html',
  styleUrls: ['./equipment-detail.component.css']
})
export class EquipmentDetailComponent implements OnInit {
  equipment: Equipment | null = null;
  activeTab = 'summary';
  helmets: Helmet[] = [];
  alerts: Alert[] = [];

  newMiner = {
    fullName: '',
    email: '',
    fechaContratacion: '',
    especialidadEnMineria: '',
    genero: ''
  };

  addMiner() {
    // Aquí deberías hacer la petición HTTP real al backend
    // Por ahora, simulamos el alta en el array local
    if (!this.equipment) return;
    const nuevoMinero: TeamMiner = {
      id: Date.now(),
      mineroId: 'simulado-' + Date.now(),
      equipoId: this.equipment.id,
      activo: true,
      fechaAsignacion: new Date().toISOString(),
      fechaSalida: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      minero: {
        id: 'simulado-' + Date.now(),
        fullName: this.newMiner.fullName,
        email: this.newMiner.email,
        especialidadEnMineria: this.newMiner.especialidadEnMineria,
        fechaContratacion: this.newMiner.fechaContratacion
      }
    };
    this.equipment.mineros.push(nuevoMinero);
    this.newMiner = {
      fullName: '',
      email: '',
      fechaContratacion: '',
      especialidadEnMineria: '',
      genero: ''
    };
  }

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const equipmentId = params['id'];
      this.loadEquipmentData(equipmentId);
    });
  }

  loadEquipmentData(equipmentId: string) {
    this.equipment = {
      id: equipmentId,
      nombre: 'Equipo Mina Norte',
      zona: 'Zona A-12',
      supervisor: { fullName: 'Carlos Mendoza' },
      createdAt: '2024-01-15T08:00:00.000Z',
      updatedAt: '2024-01-15T08:00:00.000Z',
      mineros: [
        {
          id: 1,
          mineroId: '1',
          equipoId: equipmentId,
          activo: true,
          fechaAsignacion: '2024-01-15T08:00:00.000Z',
          fechaSalida: null,
          createdAt: '2024-01-15T08:00:00.000Z',
          updatedAt: '2024-01-15T08:00:00.000Z',
          minero: {
            id: '1',
            fullName: 'Carlos M.',
            email: 'carlos.m@example.com',
            especialidadEnMineria: 'Perforación',
          }
        },
        {
          id: 2,
          mineroId: '2',
          equipoId: equipmentId,
          activo: true,
          fechaAsignacion: '2024-01-15T08:00:00.000Z',
          fechaSalida: null,
          createdAt: '2024-01-15T08:00:00.000Z',
          updatedAt: '2024-01-15T08:00:00.000Z',
          minero: {
            id: '2',
            fullName: 'Ana R.',
            email: 'ana.r@example.com',
            especialidadEnMineria: 'Explosivos',
          }
        }
      ]
    };

    // Simulación de datos de cascos
    this.helmets = [
      { id: 'H001', minerId: '1', minerName: 'Carlos M.', status: 'active', batteryLevel: 85, lastSignal: '2 min', location: 'Zona A-12', alerts: 0 },
      { id: 'H002', minerId: '2', minerName: 'Ana R.', status: 'active', batteryLevel: 92, lastSignal: '1 min', location: 'Zona A-12', alerts: 0 },
      { id: 'H003', minerId: '3', minerName: 'Miguel T.', status: 'warning', batteryLevel: 15, lastSignal: '5 min', location: 'Zona A-12', alerts: 2 }
    ];

    // Simulación de alertas
    this.alerts = [
      { id: '1', type: 'battery', severity: 'high', message: 'Batería baja en casco H003', timestamp: '2024-01-15 14:30', status: 'active', minerId: '3', minerName: 'Miguel T.' },
      { id: '2', type: 'signal', severity: 'medium', message: 'Señal débil en casco H003', timestamp: '2024-01-15 14:25', status: 'acknowledged', minerId: '3', minerName: 'Miguel T.' }
    ];
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'active': return '#64ffda';
      case 'warning': return '#ffd93d';
      case 'inactive': return '#8892b0';
      default: return '#8892b0';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'active': return 'Activo';
      case 'warning': return 'Advertencia';
      case 'inactive': return 'Inactivo';
      default: return 'Desconocido';
    }
  }

  getSeverityColor(severity: string): string {
    switch (severity) {
      case 'low': return '#64ffda';
      case 'medium': return '#ffd93d';
      case 'high': return '#ff6b6b';
      case 'critical': return '#ff0000';
      default: return '#8892b0';
    }
  }

  getAlertTypeText(type: string): string {
    switch (type) {
      case 'battery': return 'Batería';
      case 'signal': return 'Señal';
      case 'impact': return 'Impacto';
      case 'gas': return 'Gas';
      case 'temperature': return 'Temperatura';
      default: return 'Desconocido';
    }
  }

  getSupervisorName(supervisor: any): string {
    if (!supervisor) return 'Sin asignar';
    if (typeof supervisor === 'string') return supervisor;
    if (typeof supervisor === 'object' && supervisor.fullName) return supervisor.fullName;
    return 'Sin asignar';
  }

  editEquipment() {
    this.router.navigate(['/equipment-edit', this.equipment?.id]);
  }

  deleteEquipment() {
    if (confirm(`¿Estás seguro de que quieres eliminar el equipo "${this.equipment?.nombre}"?`)) {
      this.router.navigate(['/equipments']);
    }
  }

  backToEquipments() {
    this.router.navigate(['/equipments']);
  }
} 