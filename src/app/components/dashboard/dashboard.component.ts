import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, User } from '../../services/auth.service';
import { DashboardService, DashboardStats, TeamData } from '../../services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  isLoading = true;
  equipments: TeamData[] = [];
  filteredEquipments: TeamData[] = [];
  searchTerm = '';
  statusFilter = 'all';
  dashboardStats: DashboardStats = {
    totalTeams: 0,
    totalHelmets: 0,
    activeHelmets: 0,
    totalAlerts: 0,
    totalSupervisors: 0,
    helmetsWithSupervisor: 0,
    helmetsWithoutMiner: 0,
    totalMiners: 0,
    activeMiners: 0
  };

  constructor(
    private router: Router,
    public authService: AuthService,
    private dashboardService: DashboardService
  ) {}

  ngOnInit() {
    console.log('Dashboard: ngOnInit iniciado');
    this.currentUser = this.authService.getCurrentUser();
    console.log('Dashboard: Usuario actual:', this.currentUser);
    this.loadDashboardData();
    this.isLoading = false;
    console.log('Dashboard: Componente inicializado correctamente');
  }

  loadDashboardData() {
    // Cargar estadísticas del dashboard
    this.dashboardService.getDashboardStats().subscribe({
      next: (stats) => {
        this.dashboardStats = stats;
        console.log('Dashboard stats loaded:', stats);
      },
      error: (error) => {
        console.error('Error loading dashboard stats:', error);
      }
    });

    // Cargar datos de equipos
    this.dashboardService.getTeamsData().subscribe({
      next: (teams) => {
        this.equipments = teams;
        this.filteredEquipments = [...teams];
        console.log('Teams data loaded:', teams);
      },
      error: (error) => {
        console.error('Error loading teams data:', error);
        this.equipments = [];
        this.filteredEquipments = [];
      }
    });
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
    return this.dashboardStats;
  }

  getDashboardTitle(): string {
    if (this.authService.isAdmin()) {
      return 'Dashboard Administrativo';
    } else if (this.authService.isSupervisor()) {
      return 'Dashboard de Supervisor';
    } else {
      return 'Mi Dashboard';
    }
  }

  getWelcomeMessage(): string {
    if (this.authService.isAdmin()) {
      return 'Bienvenido, Administrador. Aquí tienes una vista completa del sistema.';
    } else if (this.authService.isSupervisor()) {
      return 'Bienvenido, Supervisor. Gestiona tus equipos y cascos.';
    } else {
      return 'Bienvenido. Aquí puedes ver el estado de tu equipo y casco.';
    }
  }

  canCreateEquipment(): boolean {
    return this.authService.isAdmin() || this.authService.isSupervisor();
  }

  canViewAllEquipments(): boolean {
    return this.authService.isAdmin();
  }

  showDetail(equipment: TeamData) {
    this.router.navigate(['/equipment-detail', equipment.id]);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  hasEquipmentData(): boolean {
    return this.filteredEquipments.length > 0;
  }

  getEmptyStateMessage(): string {
    if (this.searchTerm || this.statusFilter !== 'all') {
      return 'No se encontraron equipos con los filtros aplicados.';
    }
    return 'No hay equipos disponibles en este momento.';
  }

  navigateToEquipments() {
    this.router.navigate(['/equipments']);
  }
} 