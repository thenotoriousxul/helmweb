import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface Helmet {
  id: string;
  serialNumber: string;
  assignedTo: string;
  status: 'online' | 'offline' | 'alert' | 'maintenance';
  batteryLevel: number;
  temperature: number;
  lastHeartbeat: string;
  location: string;
  equipment: string;
  alerts: number;
  sensors: {
    temperature: number;
    humidity: number;
    pressure: number;
    movement: string;
    gps: {
      lat: number;
      lng: number;
    };
  };
}

@Component({
  selector: 'app-helmets',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './helmets.component.html',
  styleUrls: ['./helmets.component.css']
})
export class HelmetsComponent {
  helmets: Helmet[] = [
    {
      id: '1',
      serialNumber: 'HELM-001',
      assignedTo: 'Carlos Mendoza',
      status: 'online',
      batteryLevel: 85,
      temperature: 36.5,
      lastHeartbeat: '2 min',
      location: 'Zona A-12',
      equipment: 'Equipo Mina Norte',
      alerts: 0,
      sensors: {
        temperature: 36.5,
        humidity: 45,
        pressure: 1013,
        movement: 'Normal',
        gps: { lat: -33.4489, lng: -70.6693 }
      }
    },
    {
      id: '2',
      serialNumber: 'HELM-002',
      assignedTo: 'Ana Rodríguez',
      status: 'online',
      batteryLevel: 92,
      temperature: 37.1,
      lastHeartbeat: '1 min',
      location: 'Zona A-12',
      equipment: 'Equipo Mina Norte',
      alerts: 0,
      sensors: {
        temperature: 37.1,
        humidity: 42,
        pressure: 1012,
        movement: 'Normal',
        gps: { lat: -33.4491, lng: -70.6695 }
      }
    },
    {
      id: '3',
      serialNumber: 'HELM-003',
      assignedTo: 'Miguel Torres',
      status: 'alert',
      batteryLevel: 15,
      temperature: 38.5,
      lastHeartbeat: '30 seg',
      location: 'Zona A-12',
      equipment: 'Equipo Mina Norte',
      alerts: 2,
      sensors: {
        temperature: 38.5,
        humidity: 55,
        pressure: 1010,
        movement: 'Irregular',
        gps: { lat: -33.4487, lng: -70.6691 }
      }
    },
    {
      id: '4',
      serialNumber: 'HELM-004',
      assignedTo: 'Luis Pérez',
      status: 'online',
      batteryLevel: 78,
      temperature: 36.8,
      lastHeartbeat: '3 min',
      location: 'Zona B-8',
      equipment: 'Equipo Mina Sur',
      alerts: 0,
      sensors: {
        temperature: 36.8,
        humidity: 48,
        pressure: 1014,
        movement: 'Normal',
        gps: { lat: -33.4495, lng: -70.6700 }
      }
    },
    {
      id: '5',
      serialNumber: 'HELM-005',
      assignedTo: 'María González',
      status: 'maintenance',
      batteryLevel: 0,
      temperature: 0,
      lastHeartbeat: '2 horas',
      location: 'Taller',
      equipment: 'Equipo Mina Sur',
      alerts: 0,
      sensors: {
        temperature: 0,
        humidity: 0,
        pressure: 0,
        movement: 'Inactivo',
        gps: { lat: 0, lng: 0 }
      }
    },
    {
      id: '6',
      serialNumber: 'HELM-006',
      assignedTo: 'Roberto Silva',
      status: 'offline',
      batteryLevel: 0,
      temperature: 0,
      lastHeartbeat: '45 min',
      location: 'Zona B-8',
      equipment: 'Equipo Mina Sur',
      alerts: 1,
      sensors: {
        temperature: 0,
        humidity: 0,
        pressure: 0,
        movement: 'Inactivo',
        gps: { lat: 0, lng: 0 }
      }
    }
  ];

  filteredHelmets: Helmet[] = [];
  searchTerm = '';
  statusFilter = 'all';
  equipmentFilter = 'all';
  showCreateModal = false;
  newHelmet: Partial<Helmet> = {};

  constructor(private router: Router) {
    this.filteredHelmets = [...this.helmets];
  }

  // Propiedades computadas para estadísticas
  get totalHelmets(): number {
    return this.helmets.length;
  }

  get onlineHelmets(): number {
    return this.helmets.filter(h => h.status === 'online').length;
  }

  get alertHelmets(): number {
    return this.helmets.filter(h => h.status === 'alert').length;
  }

  get totalAlerts(): number {
    return this.helmets.reduce((sum, h) => sum + h.alerts, 0);
  }

  onSearchChange() {
    this.filterHelmets();
  }

  onStatusFilterChange() {
    this.filterHelmets();
  }

  onEquipmentFilterChange() {
    this.filterHelmets();
  }

  filterHelmets() {
    this.filteredHelmets = this.helmets.filter(helmet => {
      const matchesSearch = helmet.serialNumber.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           helmet.assignedTo.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           helmet.location.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesStatus = this.statusFilter === 'all' || helmet.status === this.statusFilter;
      const matchesEquipment = this.equipmentFilter === 'all' || helmet.equipment === this.equipmentFilter;
      return matchesSearch && matchesStatus && matchesEquipment;
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'online': return '#64ffda';
      case 'alert': return '#ff6b6b';
      case 'offline': return '#8892b0';
      case 'maintenance': return '#ffd93d';
      default: return '#8892b0';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'online': return 'En línea';
      case 'alert': return 'Alerta';
      case 'offline': return 'Desconectado';
      case 'maintenance': return 'Mantenimiento';
      default: return 'Desconocido';
    }
  }

  getBatteryColor(level: number): string {
    if (level > 60) return '#64ffda';
    if (level > 20) return '#ffd93d';
    return '#ff6b6b';
  }

  getTemperatureColor(temp: number): string {
    if (temp < 35 || temp > 38) return '#ff6b6b';
    if (temp < 36 || temp > 37.5) return '#ffd93d';
    return '#64ffda';
  }

  showDetail(helmet: Helmet) {
    this.router.navigate(['/helmet-detail', helmet.id]);
  }

  editHelmet(helmet: Helmet) {
    this.router.navigate(['/helmet-edit', helmet.id]);
  }

  deleteHelmet(helmet: Helmet) {
    if (confirm(`¿Estás seguro de que quieres eliminar el casco "${helmet.serialNumber}"?`)) {
      this.helmets = this.helmets.filter(h => h.id !== helmet.id);
      this.filterHelmets();
    }
  }

  openCreateModal() {
    this.showCreateModal = true;
    this.newHelmet = {};
  }

  closeCreateModal() {
    this.showCreateModal = false;
    this.newHelmet = {};
  }

  createHelmet() {
    if (this.newHelmet.serialNumber && this.newHelmet.assignedTo && this.newHelmet.equipment) {
      const newHelm: Helmet = {
        id: Date.now().toString(),
        serialNumber: this.newHelmet.serialNumber!,
        assignedTo: this.newHelmet.assignedTo!,
        status: 'offline',
        batteryLevel: 0,
        temperature: 0,
        lastHeartbeat: 'Nunca',
        location: this.newHelmet.location || 'Sin asignar',
        equipment: this.newHelmet.equipment!,
        alerts: 0,
        sensors: {
          temperature: 0,
          humidity: 0,
          pressure: 0,
          movement: 'Inactivo',
          gps: { lat: 0, lng: 0 }
        }
      };
      
      this.helmets.push(newHelm);
      this.filterHelmets();
      this.closeCreateModal();
    }
  }

  getEquipmentTypes(): string[] {
    return [...new Set(this.helmets.map(h => h.equipment))];
  }
} 