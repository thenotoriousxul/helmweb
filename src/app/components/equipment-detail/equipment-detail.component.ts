import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

interface Equipment {
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
    helmetId: string;
    lastSeen: string;
  }>;
  location: string;
  lastUpdate: string;
  type: string;
  supervisor: string;
  startDate: string;
  description: string;
  capacity: number;
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
    // Simulación de datos del equipo
    this.equipment = {
      id: equipmentId,
      name: 'Equipo Mina Norte',
      totalHelmets: 45,
      activeHelmets: 42,
      status: 'active',
      alerts: 2,
      location: 'Zona A-12',
      lastUpdate: '2 min',
      type: 'Extracción',
      supervisor: 'Carlos Mendoza',
      startDate: '2024-01-15',
      description: 'Equipo principal de extracción en la zona norte de la mina. Responsable de la extracción de minerales en los niveles 3-5.',
      capacity: 50,
      miners: [
        { id: '1', name: 'Carlos M.', avatar: 'CM', status: 'online', helmetId: 'H001', lastSeen: '2 min' },
        { id: '2', name: 'Ana R.', avatar: 'AR', status: 'online', helmetId: 'H002', lastSeen: '1 min' },
        { id: '3', name: 'Miguel T.', avatar: 'MT', status: 'alert', helmetId: 'H003', lastSeen: '5 min' }
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

  editEquipment() {
    this.router.navigate(['/equipment-edit', this.equipment?.id]);
  }

  deleteEquipment() {
    if (confirm(`¿Estás seguro de que quieres eliminar el equipo "${this.equipment?.name}"?`)) {
      this.router.navigate(['/equipments']);
    }
  }

  backToEquipments() {
    this.router.navigate(['/equipments']);
  }
} 