import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

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
  }>;
  location: string;
  lastUpdate: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  equipments: Equipment[] = [
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

  filteredEquipments: Equipment[] = [];
  searchTerm = '';
  statusFilter = 'all';

  constructor(
    private router: Router,
    public authService: AuthService
  ) {}

  ngOnInit() {
    this.loadDashboardData();
    this.filteredEquipments = [...this.equipments];
  }

  loadDashboardData() {
    // Filtrar datos según el rol del usuario
    if (this.authService.isMinero()) {
      // Minero solo ve su equipo
      const currentUser = this.authService.getCurrentUser();
      this.equipments = this.equipments.filter(equipment => 
        equipment.miners.some(miner => miner.id === currentUser?.id)
      );
    } else if (this.authService.isSupervisor()) {
      // Supervisor ve solo sus equipos (simulado)
      this.equipments = this.equipments.slice(0, 3); // Primeros 3 equipos
    }
    // Admin ve todos los equipos
  }

  onSearchChange() {
    this.filterEquipments();
  }

  onStatusFilterChange() {
    this.filterEquipments();
  }

  filterEquipments() {
    this.filteredEquipments = this.equipments.filter(equipment => {
      const matchesSearch = equipment.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           equipment.location.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesStatus = this.statusFilter === 'all' || equipment.status === this.statusFilter;
      return matchesSearch && matchesStatus;
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

  getMinersStatusColor(status: string): string {
    switch (status) {
      case 'online': return '#64ffda';
      case 'alert': return '#ff6b6b';
      case 'offline': return '#8892b0';
      default: return '#8892b0';
    }
  }

  getTotalStats() {
    if (this.authService.isAdmin()) {
      return {
        totalEquipments: this.equipments.length,
        totalHelmets: this.equipments.reduce((sum, eq) => sum + eq.totalHelmets, 0),
        activeHelmets: this.equipments.reduce((sum, eq) => sum + eq.activeHelmets, 0),
        totalAlerts: this.equipments.reduce((sum, eq) => sum + eq.alerts, 0),
        totalSupervisors: 3, // Simulado
        helmetsWithSupervisor: 120, // Simulado
        helmetsWithoutMiner: 15 // Simulado
      };
    } else if (this.authService.isSupervisor()) {
      return {
        totalEquipments: this.equipments.length,
        totalHelmets: this.equipments.reduce((sum, eq) => sum + eq.totalHelmets, 0),
        activeHelmets: this.equipments.reduce((sum, eq) => sum + eq.activeHelmets, 0),
        totalAlerts: this.equipments.reduce((sum, eq) => sum + eq.alerts, 0)
      };
    } else {
      // Minero
      return {
        totalEquipments: this.equipments.length,
        totalHelmets: this.equipments.reduce((sum, eq) => sum + eq.totalHelmets, 0),
        activeHelmets: this.equipments.reduce((sum, eq) => sum + eq.activeHelmets, 0),
        totalAlerts: this.equipments.reduce((sum, eq) => sum + eq.alerts, 0)
      };
    }
  }

  showDetail(equipment: Equipment) {
    this.router.navigate(['/equipment-detail', equipment.id]);
  }
} 