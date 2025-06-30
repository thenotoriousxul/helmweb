import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HelmetService, Helmet } from '../../services/helmet.service';
import { AuthService } from '../../services/auth.service';

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
  helmetStats = {
    total: 0,
    inactivo: 0,
    activo: 0,
    activoSinAsignar: 0,
    activoAsignado: 0
  };

  constructor(
    private router: Router,
    private helmetService: HelmetService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadHelmets();
    this.loadStats();
  }

  loadHelmets() {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      if (this.authService.isAdmin()) {
        this.helmetService.getAllHelmets().subscribe(helmets => {
          this.helmets = helmets;
          this.filteredHelmets = [...helmets];
        });
      } else {
        this.helmetService.getHelmetsBySupervisor(currentUser.id).subscribe(helmets => {
          this.helmets = helmets;
          this.filteredHelmets = [...helmets];
        });
      }
    }
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
    // Implementar navegación al detalle del casco
    console.log('Ver detalle del casco:', helmet);
  }

  editHelmet(helmet: Helmet) {
    // Implementar edición del casco
    console.log('Editar casco:', helmet);
  }

  deleteHelmet(helmet: Helmet) {
    if (confirm('¿Estás seguro de que quieres eliminar este casco?')) {
      // Implementar eliminación del casco
      console.log('Eliminar casco:', helmet);
    }
  }

  activateHelmet(helmet: Helmet) {
    if (helmet.status === 'inactivo') {
      this.helmetService.activateHelmet(helmet.id).subscribe(updatedHelmet => {
        if (updatedHelmet) {
          this.loadHelmets();
          this.loadStats();
        }
      });
    }
  }

  assignHelmet(helmet: Helmet) {
    // Implementar asignación de casco a minero
    console.log('Asignar casco:', helmet);
  }

  unassignHelmet(helmet: Helmet) {
    if (helmet.status === 'activo-asignado') {
      this.helmetService.unassignHelmet(helmet.id).subscribe(updatedHelmet => {
        if (updatedHelmet) {
          this.loadHelmets();
          this.loadStats();
        }
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
    if (this.newHelmet.serialNumber && this.newHelmet.uuid) {
      const currentUser = this.authService.getCurrentUser();
      if (currentUser) {
        this.newHelmet.supervisorId = currentUser.id;
        this.helmetService.createHelmet(this.newHelmet).subscribe(newHelmet => {
          this.helmets.push(newHelmet);
          this.filteredHelmets = [...this.helmets];
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