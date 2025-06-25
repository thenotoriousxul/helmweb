import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface Alert {
  id: string;
  type: 'temperature' | 'battery' | 'movement' | 'location' | 'system';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  helmetId: string;
  helmetSerial: string;
  assignedTo: string;
  equipment: string;
  location: string;
  timestamp: string;
  status: 'active' | 'acknowledged' | 'resolved';
  sensorData?: {
    temperature?: number;
    batteryLevel?: number;
    movement?: string;
    gps?: { lat: number; lng: number };
  };
}

@Component({
  selector: 'app-alerts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './alerts.component.html',
  styleUrls: ['./alerts.component.css']
})
export class AlertsComponent {
  alerts: Alert[] = [
    {
      id: '1',
      type: 'temperature',
      severity: 'high',
      title: 'Temperatura Corporal Elevada',
      description: 'La temperatura del minero ha superado los límites normales de seguridad.',
      helmetId: '3',
      helmetSerial: 'HELM-003',
      assignedTo: 'Miguel Torres',
      equipment: 'Equipo Mina Norte',
      location: 'Zona A-12',
      timestamp: '2024-01-15 14:30:25',
      status: 'active',
      sensorData: {
        temperature: 38.5,
        batteryLevel: 15,
        movement: 'Irregular'
      }
    },
    {
      id: '2',
      type: 'battery',
      severity: 'medium',
      title: 'Batería Baja',
      description: 'El casco tiene menos del 20% de batería restante.',
      helmetId: '3',
      helmetSerial: 'HELM-003',
      assignedTo: 'Miguel Torres',
      equipment: 'Equipo Mina Norte',
      location: 'Zona A-12',
      timestamp: '2024-01-15 14:25:10',
      status: 'acknowledged',
      sensorData: {
        batteryLevel: 15
      }
    },
    {
      id: '3',
      type: 'movement',
      severity: 'critical',
      title: 'Movimiento Anómalo Detectado',
      description: 'Se ha detectado un patrón de movimiento inusual que podría indicar una caída.',
      helmetId: '7',
      helmetSerial: 'HELM-007',
      assignedTo: 'Elena Vargas',
      equipment: 'Equipo Mina Este',
      location: 'Zona C-15',
      timestamp: '2024-01-15 14:20:45',
      status: 'active',
      sensorData: {
        movement: 'Caída detectada',
        temperature: 36.8
      }
    },
    {
      id: '4',
      type: 'location',
      severity: 'medium',
      title: 'Fuera de Zona Permitida',
      description: 'El minero se ha movido fuera de la zona de trabajo autorizada.',
      helmetId: '9',
      helmetSerial: 'HELM-009',
      assignedTo: 'Sofia López',
      equipment: 'Equipo Mina Este',
      location: 'Zona C-15',
      timestamp: '2024-01-15 14:15:30',
      status: 'resolved',
      sensorData: {
        gps: { lat: -33.4500, lng: -70.6700 }
      }
    },
    {
      id: '5',
      type: 'system',
      severity: 'low',
      title: 'Pérdida de Conexión',
      description: 'El casco ha perdido la conexión con el sistema central.',
      helmetId: '6',
      helmetSerial: 'HELM-006',
      assignedTo: 'Roberto Silva',
      equipment: 'Equipo Mina Sur',
      location: 'Zona B-8',
      timestamp: '2024-01-15 14:10:15',
      status: 'active'
    },
    {
      id: '6',
      type: 'temperature',
      severity: 'medium',
      title: 'Temperatura Ambiental Alta',
      description: 'La temperatura ambiental en la zona ha superado los límites recomendados.',
      helmetId: '15',
      helmetSerial: 'HELM-015',
      assignedTo: 'Patricia Morales',
      equipment: 'Equipo Mina Central',
      location: 'Zona E-7',
      timestamp: '2024-01-15 14:05:00',
      status: 'acknowledged',
      sensorData: {
        temperature: 37.2
      }
    }
  ];

  filteredAlerts: Alert[] = [];
  searchTerm = '';
  severityFilter = 'all';
  typeFilter = 'all';
  statusFilter = 'all';
  showCreateModal = false;
  newAlert: Partial<Alert> = {};

  constructor(private router: Router) {
    this.filteredAlerts = [...this.alerts];
  }

  // Propiedades computadas para estadísticas
  get totalAlerts(): number {
    return this.alerts.length;
  }

  get activeAlerts(): number {
    return this.alerts.filter(a => a.status === 'active').length;
  }

  get criticalAlerts(): number {
    return this.alerts.filter(a => a.severity === 'critical').length;
  }

  get resolvedAlerts(): number {
    return this.alerts.filter(a => a.status === 'resolved').length;
  }

  get criticalSeverityCount(): number {
    return this.alerts.filter(a => a.severity === 'critical').length;
  }

  get highSeverityCount(): number {
    return this.alerts.filter(a => a.severity === 'high').length;
  }

  get mediumSeverityCount(): number {
    return this.alerts.filter(a => a.severity === 'medium').length;
  }

  get lowSeverityCount(): number {
    return this.alerts.filter(a => a.severity === 'low').length;
  }

  onSearchChange() {
    this.filterAlerts();
  }

  onSeverityFilterChange() {
    this.filterAlerts();
  }

  onTypeFilterChange() {
    this.filterAlerts();
  }

  onStatusFilterChange() {
    this.filterAlerts();
  }

  filterAlerts() {
    this.filteredAlerts = this.alerts.filter(alert => {
      const matchesSearch = alert.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           alert.assignedTo.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           alert.helmetSerial.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesSeverity = this.severityFilter === 'all' || alert.severity === this.severityFilter;
      const matchesType = this.typeFilter === 'all' || alert.type === this.typeFilter;
      const matchesStatus = this.statusFilter === 'all' || alert.status === this.statusFilter;
      return matchesSearch && matchesSeverity && matchesType && matchesStatus;
    });
  }

  getSeverityColor(severity: string): string {
    switch (severity) {
      case 'critical': return '#ff6b6b';
      case 'high': return '#ff8e53';
      case 'medium': return '#ffd93d';
      case 'low': return '#64ffda';
      default: return '#8892b0';
    }
  }

  getSeverityText(severity: string): string {
    switch (severity) {
      case 'critical': return 'Crítica';
      case 'high': return 'Alta';
      case 'medium': return 'Media';
      case 'low': return 'Baja';
      default: return 'Desconocida';
    }
  }

  getTypeColor(type: string): string {
    switch (type) {
      case 'temperature': return '#ff6b6b';
      case 'battery': return '#ffd93d';
      case 'movement': return '#ff8e53';
      case 'location': return '#64ffda';
      case 'system': return '#8892b0';
      default: return '#8892b0';
    }
  }

  getTypeText(type: string): string {
    switch (type) {
      case 'temperature': return 'Temperatura';
      case 'battery': return 'Batería';
      case 'movement': return 'Movimiento';
      case 'location': return 'Ubicación';
      case 'system': return 'Sistema';
      default: return 'Desconocido';
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'active': return '#ff6b6b';
      case 'acknowledged': return '#ffd93d';
      case 'resolved': return '#64ffda';
      default: return '#8892b0';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'active': return 'Activa';
      case 'acknowledged': return 'Reconocida';
      case 'resolved': return 'Resuelta';
      default: return 'Desconocida';
    }
  }

  getTypeIcon(type: string): string {
    switch (type) {
      case 'temperature': return 'fas fa-thermometer-half';
      case 'battery': return 'fas fa-battery-quarter';
      case 'movement': return 'fas fa-running';
      case 'location': return 'fas fa-map-marker-alt';
      case 'system': return 'fas fa-exclamation-triangle';
      default: return 'fas fa-bell';
    }
  }

  acknowledgeAlert(alert: Alert) {
    alert.status = 'acknowledged';
    this.filterAlerts();
  }

  resolveAlert(alert: Alert) {
    alert.status = 'resolved';
    this.filterAlerts();
  }

  deleteAlert(alert: Alert) {
    if (confirm(`¿Estás seguro de que quieres eliminar esta alerta?`)) {
      this.alerts = this.alerts.filter(a => a.id !== alert.id);
      this.filterAlerts();
    }
  }

  showDetail(alert: Alert) {
    this.router.navigate(['/alert-detail', alert.id]);
  }
} 