import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertService } from '../../services/alert.service';
import { TeamService, Team, TeamMiner as ApiTeamMiner } from '../../services/team.service';
import { MineroService, Minero } from '../../services/minero.service';

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
    private route: ActivatedRoute,
    private alert: AlertService,
    private teamService: TeamService,
    private mineroService: MineroService,
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const equipmentId = params['id'];
      this.loadEquipmentData(equipmentId);
    });
  }

  loadEquipmentData(equipmentId: string) {
    this.teamService.getTeamById(equipmentId).subscribe({
      next: (team: Team) => {
        const mappedMiners = (team.mineros || []).map((tm: any) => ({
          id: Number(tm.id) || Date.now(),
          mineroId: tm.mineroId,
          equipoId: tm.equipoId || team.id,
          activo: tm.activo !== false,
          fechaAsignacion: tm.fechaAsignacion || tm.createdAt || '',
          fechaSalida: tm.fechaSalida || null,
          createdAt: tm.createdAt || '',
          updatedAt: tm.updatedAt || null,
          minero: tm.minero ? {
            id: tm.minero.id,
            fullName: tm.minero.fullName,
            email: tm.minero.email,
            especialidadEnMineria: tm.minero.especialidadEnMineria,
            genero: tm.minero.genero,
            fechaContratacion: tm.minero.fechaContratacion,
            birthDate: tm.minero.birthDate,
            phone: tm.minero.phone,
            address: tm.minero.address,
            rfc: tm.minero.rfc,
          } : undefined
        }));

        this.equipment = {
          id: team.id,
          nombre: team.nombre,
          zona: team.zona,
          supervisor: team.supervisor?.fullName || team.supervisorId,
          createdAt: team.createdAt || '',
          updatedAt: team.updatedAt || '',
          mineros: mappedMiners as any
        };
      },
      error: (err) => {
        this.alert.error('No se pudo cargar el equipo');
      }
    });
  }

  removeMiner(tm: TeamMiner) {
    if (!this.equipment) return;
    this.teamService.removeMinerFromTeam(this.equipment.id, tm.mineroId).subscribe({
      next: () => {
        this.equipment!.mineros = this.equipment!.mineros.filter(m => m.mineroId !== tm.mineroId);
        this.alert.success('Minero desasignado del equipo');
      },
      error: (err) => {
        this.alert.error('No se pudo desasignar al minero');
      }
    });
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

  async deleteEquipment() {
    if (await this.alert.confirm(`¿Estás seguro de que quieres eliminar el equipo "${this.equipment?.nombre}"?`)) {
      this.router.navigate(['/equipments']);
    }
  }

  backToEquipments() {
    this.router.navigate(['/equipments']);
  }
} 