import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TeamService, Team, TeamStats } from '../../services/team.service';
import { AuthService } from '../../services/auth.service';
import { MineroService } from '../../services/minero.service';

@Component({
  selector: 'app-equipments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './equipments.component.html',
  styleUrls: ['./equipments.component.css']
})
export class EquipmentsComponent implements OnInit {
  teams: Team[] = [];
  filteredTeams: Team[] = [];
  searchTerm = '';
  statusFilter = 'all';
  zoneFilter = 'all';
  showCreateModal = false;
  newTeam: Partial<Team> = {};
  stats: TeamStats = {
    totalTeams: 0,
    totalSupervisors: 0,
    avgMinersPerTeam: 0
  };
  loading = false;
  showDetailModal = false;
  detailTeamData: Partial<Team> = {};
  showEditModal = false;
  editTeamData: Partial<Team> = {};
  showDeleteModal = false;
  teamToDelete: Team | null = null;
  showAssignMinerModal = false;
  teamToAssignMiner: Team | null = null;
  availableMiners: any[] = [];
  selectedMinerId: string = '';

  constructor(
    private router: Router,
    private teamService: TeamService,
    private authService: AuthService,
    private mineroService: MineroService
  ) {}

  ngOnInit() {
    this.loadTeams();
    this.loadStats();
  }

  loadTeams() {
    this.loading = true;
    this.teamService.getAllTeams().subscribe({
      next: (teams) => {
        this.teams = teams || [];
        this.filteredTeams = [...this.teams];
        this.loading = false;
        // asegurar refresco inmediato de la UI
        // (Angular 20 con TS estricto puede retrasar detección en algunos casos)
      },
      error: (error) => {
        console.error('Error loading teams:', error);
        this.teams = [];
        this.filteredTeams = [];
        this.loading = false;
      }
    });
  }

  loadStats() {
    this.teamService.getTeamStats().subscribe({
      next: (stats) => {
        this.stats = stats;
      },
      error: (error) => {
        console.error('Error loading stats:', error);
      }
    });
  }

  // Propiedades computadas
  get totalTeams(): number {
    return this.teams.length;
  }

  get activeTeams(): number {
    return this.teams.filter(team => this.getTeamStatus(team) === 'active').length;
  }

  get warningTeams(): number {
    return this.teams.filter(team => this.getTeamStatus(team) === 'warning').length;
  }

  get totalMiners(): number {
    return this.teams.reduce((sum, team) => sum + (team.mineros?.length || 0), 0);
  }

  onSearchChange() {
    this.filterTeams();
  }

  onStatusFilterChange() {
    this.filterTeams();
  }

  onZoneFilterChange() {
    this.filterTeams();
  }

  filterTeams() {
    this.filteredTeams = this.teams.filter(team => {
      const matchesSearch = team.nombre.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           team.zona.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           (team.supervisor?.fullName || '').toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesStatus = this.statusFilter === 'all' || this.getTeamStatus(team) === this.statusFilter;
      const matchesZone = this.zoneFilter === 'all' || team.zona === this.zoneFilter;
      return matchesSearch && matchesStatus && matchesZone;
    });
  }

  getTeamStatus(team: Team): 'active' | 'warning' | 'inactive' {
    const minerCount = team.mineros?.length || 0;
    if (minerCount === 0) return 'inactive';
    if (minerCount >= 8) return 'warning'; // Equipo casi lleno
    return 'active';
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

  showDetail(team: Team) {
    this.teamService.getTeamById(team.id).subscribe({
      next: (data) => {
        this.detailTeamData = data;
        this.showDetailModal = true;
      },
      error: () => {
        alert('No se pudo obtener el detalle del equipo.');
      }
    });
  }

  closeDetailModal() {
    this.showDetailModal = false;
    this.detailTeamData = {};
  }

  editTeam(team: Team) {
    this.editTeamData = { ...team };
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
    this.editTeamData = {};
  }

  saveEditTeam() {
    if (this.editTeamData.id) {
      this.teamService.updateTeam(this.editTeamData.id, this.editTeamData).subscribe({
        next: () => {
          this.loadTeams();
          this.loadStats();
          this.closeEditModal();
        },
        error: () => {
          alert('Error al actualizar el equipo.');
        }
      });
    }
  }

  deleteTeam(team: Team) {
    this.teamToDelete = team;
    this.showDeleteModal = true;
  }

  confirmDeleteTeam() {
    if (this.teamToDelete) {
      this.teamService.deleteTeam(this.teamToDelete.id).subscribe({
        next: () => {
          this.loadTeams();
          this.loadStats();
          this.closeDeleteModal();
        },
        error: () => {
          alert('Error al eliminar el equipo.');
        }
      });
    }
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.teamToDelete = null;
  }

  openCreateModal() {
    this.showCreateModal = true;
    this.newTeam = {};
  }

  closeCreateModal() {
    this.showCreateModal = false;
    this.newTeam = {};
  }

  createTeam() {
    if (this.newTeam.nombre && this.newTeam.zona) {
      const currentUser = this.authService.getCurrentUser();
      
      // Preparar los datos del equipo
      const teamData: Partial<Team> = {
        nombre: this.newTeam.nombre,
        zona: this.newTeam.zona
      };

      // Siempre incluir supervisorId
      if (currentUser?.role === 'admin') {
        // Si es admin, usar el supervisorId del formulario o el usuario actual
        teamData.supervisorId = this.newTeam.supervisorId || currentUser.id;
      } else if (currentUser?.role === 'supervisor') {
        // Si es supervisor, usar su propio ID
        teamData.supervisorId = currentUser.id;
      } else {
        // Si no tiene rol válido, usar el usuario actual
        teamData.supervisorId = currentUser?.id || '';
      }

      console.log('Creating team with data:', teamData);

      this.teamService.createTeam(teamData).subscribe({
        next: (team) => {
          console.log('Team created successfully:', team);
          // Recargar desde el servidor para asegurar sincronización
          this.loadTeams();
          this.loadStats();
          this.closeCreateModal();
        },
        error: (error) => {
          console.error('Error creating team:', error);
          alert('Error al crear el equipo: ' + (error.error?.message || error.message || 'Error desconocido'));
        }
      });
    } else {
      alert('Por favor completa todos los campos requeridos');
    }
  }

  openAssignMinerModal(team: Team) {
    this.teamToAssignMiner = team;
    this.selectedMinerId = '';
    this.showAssignMinerModal = true;
    this.mineroService.getAllMiners().subscribe(miners => {
      // Filtrar mineros ya asignados a algún equipo
      const assignedIds = (team.mineros || []).map(m => m.id);
      this.availableMiners = miners.filter((m: any) => !assignedIds.includes(m.id));
    });
  }

  closeAssignMinerModal() {
    this.showAssignMinerModal = false;
    this.teamToAssignMiner = null;
    this.availableMiners = [];
    this.selectedMinerId = '';
  }

  assignMinerToTeam() {
    if (this.teamToAssignMiner && this.selectedMinerId) {
      this.teamService.assignMinerToTeam(this.teamToAssignMiner.id, this.selectedMinerId).subscribe({
        next: () => {
          this.loadTeams();
          this.closeAssignMinerModal();
        },
        error: () => {
          alert('Error al asignar minero al equipo.');
        }
      });
    }
  }

  getZones(): string[] {
    return [...new Set(this.teams.map(team => team.zona))];
  }

  canCreateTeam(): boolean {
    const canCreate = this.authService.canCreateEquipment();
    return true; // Temporalmente siempre true para testing
  }

  canModifyTeam(): boolean {
    const canModify = this.authService.canModifyEquipment();
    return true; // Temporalmente siempre true para testing
  }
} 