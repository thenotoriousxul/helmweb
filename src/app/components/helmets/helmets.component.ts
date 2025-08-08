import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HelmetService, Helmet, HelmetStats } from '../../services/helmet.service';
import { AuthService } from '../../services/auth.service';
import { MineroService, Minero } from '../../services/minero.service';

@Component({
  selector: 'app-helmets',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './helmets.component.html',
  styleUrls: ['./helmets.component.css']
})
export class HelmetsComponent implements OnInit {
  helmets: Helmet[] = [];
  filteredHelmets: Helmet[] = [];
  searchTerm = '';
  statusFilter = 'all';
  equipmentFilter = 'all';
  showCreateModal = false;
  newHelmet: Partial<Helmet> = {};
  helmetStats: HelmetStats = {
    total: 0,
    active: 0,
    assigned: 0,
    inactive: 0,
    utilizationRate: 0
  };
  showDetailModal = false;
  detailHelmetData: Partial<Helmet> = {};
  showEditModal = false;
  editHelmetData: Partial<Helmet> = {};
  showDeleteModal = false;
  helmetToDelete: Helmet | null = null;

  // Modal de asignación
  showAssignModal = false;
  helmetToAssign: Helmet | null = null;
  minersForAssign: Minero[] = [];
  filteredMinersForAssign: Minero[] = [];
  assignSearchTerm = '';

  constructor(
    private router: Router,
    private helmetService: HelmetService,
    private authService: AuthService,
    private mineroService: MineroService
  ) {}

  ngOnInit() {
    this.loadHelmets();
    this.loadStats();
  }

  loadHelmets() {
    this.helmetService.getAllHelmets().subscribe({
      next: (helmets) => {
        this.helmets = helmets || [];
        this.filteredHelmets = [...this.helmets];
      },
      error: (err) => {
        console.error('Error loading helmets:', err);
        this.helmets = [];
        this.filteredHelmets = [];
      }
    });
  }

  loadStats() {
    this.helmetService.getHelmetStats().subscribe(stats => {
      this.helmetStats = stats;
    });
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
                           (helmet.assignedTo && helmet.assignedTo.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
                           (helmet.location && helmet.location.toLowerCase().includes(this.searchTerm.toLowerCase()));
      const matchesStatus = this.statusFilter === 'all' || helmet.status === this.statusFilter;
      const matchesEquipment = this.equipmentFilter === 'all' || 
                              (helmet.equipmentName && helmet.equipmentName === this.equipmentFilter);
      
      return matchesSearch && matchesStatus && matchesEquipment;
    });
  }

  getStatusColor(status: Helmet['status']): string {
    return this.helmetService.getStatusColor(status);
  }

  getStatusText(status: Helmet['status']): string {
    return this.helmetService.getStatusText(status);
  }

  getBatteryColor(level: number): string {
    if (level > 70) return '#28a745';
    if (level > 30) return '#ffc107';
    return '#dc3545';
  }

  getTemperatureColor(temp: number): string {
    if (temp > 37.5) return '#dc3545';
    if (temp > 36.5) return '#ffc107';
    return '#28a745';
  }

  showDetail(helmet: Helmet) {
    this.helmetService.getHelmetById(helmet.id).subscribe({
      next: (data) => {
        this.detailHelmetData = data;
        this.showDetailModal = true;
      },
      error: () => {
        alert('No se pudo obtener el detalle del casco.');
      }
    });
  }

  closeDetailModal() {
    this.showDetailModal = false;
    this.detailHelmetData = {};
  }

  editHelmet(helmet: Helmet) {
    this.editHelmetData = { ...helmet };
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
    this.editHelmetData = {};
  }

  saveEditHelmet() {
    if (this.editHelmetData.id) {
      this.helmetService.updateHelmet(this.editHelmetData.id, this.editHelmetData).subscribe(() => {
        this.loadHelmets();
        this.loadStats();
        this.closeEditModal();
      });
    }
  }

  deleteHelmet(helmet: Helmet) {
    this.helmetToDelete = helmet;
    this.showDeleteModal = true;
  }

  confirmDeleteHelmet() {
    if (this.helmetToDelete) {
      this.helmetService.deleteHelmet(this.helmetToDelete.id).subscribe(() => {
        this.loadHelmets();
        this.loadStats();
        this.closeDeleteModal();
      });
    }
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.helmetToDelete = null;
  }

  activateHelmet(helmet: Helmet) {
    if (helmet.status === 'inactivo') {
      this.helmetService.activateHelmet(helmet.serialNumber).subscribe(() => {
        this.loadHelmets();
        this.loadStats();
      });
    }
  }

  assignHelmet(helmet: Helmet) {
    this.openAssignModal(helmet);
  }

  openAssignModal(helmet: Helmet) {
    this.helmetToAssign = helmet;
    this.showAssignModal = true;
    // Cargar mineros disponibles (del supervisor/admin)
    this.mineroService.getAllMiners().subscribe({
      next: (miners) => {
        this.minersForAssign = miners;
        this.filteredMinersForAssign = [...miners];
      },
      error: (err) => {
        console.error('Error cargando mineros para asignación:', err);
        this.minersForAssign = [];
        this.filteredMinersForAssign = [];
      }
    });
  }

  closeAssignModal() {
    this.showAssignModal = false;
    this.helmetToAssign = null;
    this.assignSearchTerm = '';
    this.minersForAssign = [];
    this.filteredMinersForAssign = [];
  }

  onAssignSearchChange() {
    const term = this.assignSearchTerm.trim().toLowerCase();
    this.filteredMinersForAssign = this.minersForAssign.filter((m) => {
      return (
        (m.fullName || '').toLowerCase().includes(term) ||
        (m.email || '').toLowerCase().includes(term) ||
        (m.rfc || '').toLowerCase().includes(term) ||
        (m.phone || '').toLowerCase().includes(term)
      );
    });
  }

  doAssignMiner(minero: Minero) {
    if (!this.helmetToAssign) return;
    this.helmetService.assignHelmet(this.helmetToAssign.id, minero.id).subscribe({
      next: () => {
        this.closeAssignModal();
        this.loadHelmets();
        this.loadStats();
        alert('Casco asignado exitosamente');
      },
      error: (err) => {
        console.error('Error al asignar casco:', err);
        alert(err?.error?.message || 'Error al asignar casco');
      }
    });
  }

  unassignHelmet(helmet: Helmet) {
    if (helmet.status === 'activo-asignado') {
      this.helmetService.unassignHelmet(helmet.id).subscribe(() => {
        this.loadHelmets();
        this.loadStats();
      });
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
    if (this.newHelmet.serialNumber) {
      const currentUser = this.authService.getCurrentUser();
      if (currentUser) {
        this.newHelmet.supervisorId = currentUser.id;
        this.helmetService.createHelmet(this.newHelmet).subscribe(() => {
          this.loadHelmets();
          this.loadStats();
          this.closeCreateModal();
        });
      }
    }
  }

  getEquipmentTypes(): string[] {
    const equipmentNames = this.helmets
      .map(helmet => helmet.equipmentName)
      .filter((name): name is string => name !== undefined && name !== null);
    return equipmentNames;
  }

  canCreateHelmet(): boolean {
    return this.authService.canCreateHelmet();
  }

  canModifyHelmet(): boolean {
    return this.authService.isSupervisor() || this.authService.isAdmin();
  }

  getStatusOptions(): { value: string; label: string }[] {
    return [
      { value: 'all', label: 'Todos los estados' },
      { value: 'inactivo', label: 'Inactivo' },
      { value: 'activo', label: 'Activo' },
      { value: 'activo-sin-asignar', label: 'Activo Sin Asignar' },
      { value: 'activo-asignado', label: 'Activo Asignado' }
    ];
  }
} 