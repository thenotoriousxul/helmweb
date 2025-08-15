import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HelmetService, Helmet, HelmetStats } from '../../services/helmet.service';
import { SensorService, SensorReading } from '../../services/sensor.service';
import { SupervisorService, Supervisor } from '../../services/supervisor.service';
import { AuthService } from '../../services/auth.service';
import { MineroService, Minero } from '../../services/minero.service';
import { AlertService } from '../../services/alert.service';

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
  showActivateModal = false;
  newHelmet: Partial<Helmet> = {};
  helmetStats: HelmetStats = {
    total: 0,
    active: 0,
    assigned: 0,
    inactive: 0,
    utilizationRate: 0
  };
  showDetailModal = false;
  detailHelmetData: Partial<Helmet> & { supervisorName?: string } = {};
  detailHelmetDataReadings: SensorReading[] = [];
  showEditModal = false;
  editHelmetData: Partial<Helmet> = {};
  expandedSensors: { [helmetId: string]: boolean } = {};
  originalEditHelmetData: Partial<Helmet> = {};
  showDeleteModal = false;
  helmetToDelete: Helmet | null = null;
  errorMessage = '';
  isLoading = false;

  // Modal de asignación
  showAssignModal = false;
  helmetToAssign: Helmet | null = null;
  minersForAssign: Minero[] = [];
  filteredMinersForAssign: Minero[] = [];
  assignSearchTerm = '';

  // Supervisores para crear casco (solo admin)
  supervisorsForCreate: Supervisor[] = [];
  private supervisorsLoaded = false;

  constructor(
    private router: Router,
    private helmetService: HelmetService,
    public authService: AuthService,
    private mineroService: MineroService,
    private sensorService: SensorService,
    private supervisorService: SupervisorService,
    private cdr: ChangeDetectorRef,
    private alert: AlertService,
  ) {}

  ngOnInit() {
    this.loadHelmets();
    this.loadStats();
    // Cargar supervisores para el formulario de creación (solo admin)
    this.loadSupervisorsForCreate();
  }

  private loadSupervisorsForCreate() {
    if (!this.authService.isAdmin()) return;
    if (this.supervisorsLoaded) return;
    this.supervisorService.getSupervisors().subscribe({
      next: (list) => {
        this.supervisorsForCreate = list || [];
        this.supervisorsLoaded = true;
        this.cdr.detectChanges();
      },
      error: () => {
        this.supervisorsForCreate = [];
      }
    });
  }

  getSupervisorNameById(id?: string): string {
    if (!id) return '';
    const sup = this.supervisorsForCreate.find(s => s.id === id);
    return sup ? (sup.fullName || sup.email || id) : id;
  }

  loadHelmets() {
    this.helmetService.getAllHelmets().subscribe({
      next: (helmets) => {
        this.helmets = helmets || [];
        this.filteredHelmets = [...this.helmets];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading helmets:', err);
        this.helmets = [];
        this.filteredHelmets = [];
        this.cdr.detectChanges();
      }
    });
  }

  loadStats() {
    this.helmetService.getHelmetStats().subscribe(stats => {
      this.helmetStats = stats;
      this.cdr.detectChanges();
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
      next: (apiData: any) => {
        const mapped: Partial<Helmet> & { supervisorName?: string } = {
          id: apiData?.id || helmet.id,
          serialNumber: apiData?.serial || apiData?.serialNumber || helmet.serialNumber,
          uuid: apiData?.physicalId || apiData?.uuid || helmet.uuid,
          status: apiData?.isActive ? (apiData?.asignadoMinero ? 'activo-asignado' : 'activo') : 'inactivo',
          assignedTo: apiData?.minero?.fullName || undefined,
          assignedToEmail: apiData?.minero?.email || undefined,
          assignedToId: apiData?.minero?.id || undefined,
          supervisorId: apiData?.supervisorId || apiData?.supervisor?.id || undefined,
          supervisorName: apiData?.supervisor?.fullName || undefined,
          lastHeartbeat: apiData?.updatedAt || helmet.lastHeartbeat || '',
          temperature: apiData?.temperature ?? helmet.temperature ?? 0
        };

        this.detailHelmetData = mapped;
        this.showDetailModal = true;

        // Enriquecer con nombre de supervisor si solo tenemos el ID
        if (!this.detailHelmetData.supervisorName && this.detailHelmetData.supervisorId && this.authService.isAdmin()) {
          this.supervisorService.getSupervisors().subscribe({
            next: (list: any[]) => {
              const match = (list || []).find((s: any) => s.id === this.detailHelmetData.supervisorId);
              if (match) {
                this.detailHelmetData.supervisorName = match.fullName || match.name;
                this.cdr.detectChanges();
              }
            },
            error: () => {
              // Ignorar; no disponible
            }
          });
        }

        // Cargar lecturas recientes por createdAt para este casco
        const cascoId = (this.detailHelmetData?.id || '').toString();
        const start = new Date('1970-01-01T00:00:00Z');
        const end = new Date('2100-01-01T00:00:00Z');
        this.sensorService
          .getReadingsByCreated('cascoId', cascoId, start.toISOString(), end.toISOString(), 5000)
          .subscribe({
            next: (readings: SensorReading[]) => {
              (this as any).detailHelmetDataReadings = readings;
              this.cdr.detectChanges();
            },
            error: () => {
              (this as any).detailHelmetDataReadings = [];
              this.cdr.detectChanges();
            },
          });
      },
      error: () => {
        this.alert.error('No se pudo obtener el detalle del casco.');
      }
    });
  }

  closeDetailModal() {
    this.showDetailModal = false;
    this.detailHelmetData = {};
    this.detailHelmetDataReadings = [];
  }

  editHelmet(helmet: Helmet) {
    this.editHelmetData = { ...helmet };
    this.originalEditHelmetData = { ...helmet };
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
    this.editHelmetData = {};
  }

  private isEditUnchanged(): boolean {
    const serialNow = (this.editHelmetData.serialNumber || '').trim();
    const serialOrig = (this.originalEditHelmetData.serialNumber || '').trim();
    const uuidNow = (this.editHelmetData.uuid || '').trim();
    const uuidOrig = (this.originalEditHelmetData.uuid || '').trim();
    const statusNow = (this.editHelmetData.status || '').toString();
    const statusOrig = (this.originalEditHelmetData.status || '').toString();
    return serialNow === serialOrig && uuidNow === uuidOrig && statusNow === statusOrig;
  }

  editFormError = '';

  saveEditHelmet(form?: any) {
    if (form && form.controls) Object.values(form.controls).forEach((c: any) => c.markAsTouched());
    this.editFormError = '';
    if (!this.editHelmetData.id) return;

    const serialOk = !!this.editHelmetData.serialNumber && (this.editHelmetData.serialNumber as string).trim().length >= 3;
    const uuidOk = !!this.editHelmetData.uuid && (this.editHelmetData.uuid as string).trim().length > 0;
    const statusOk = !!this.editHelmetData.status && (this.editHelmetData.status as string).trim().length > 0;

    if (!serialOk) { this.editFormError = 'El serial es obligatorio (mín. 3 caracteres)'; return; }
    if (!uuidOk) { this.editFormError = 'El UUID es obligatorio'; return; }
    if (!statusOk) { this.editFormError = 'El estado es obligatorio'; return; }
    if (this.isEditUnchanged()) { this.editFormError = 'No hay cambios para guardar.'; return; }

    if (this.editHelmetData.id) {
      this.isLoading = true;
      this.helmetService.updateHelmet(this.editHelmetData.id, this.editHelmetData).subscribe({
        next: () => {
          this.loadHelmets();
          this.loadStats();
          this.closeEditModal();
          this.alert.success('Casco actualizado exitosamente');
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error actualizando casco:', err);
          this.editFormError = err?.error?.message || 'Error al actualizar casco';
          this.isLoading = false;
        }
      });
    }
  }

  async deleteHelmet(helmet: Helmet) {
    this.helmetToDelete = helmet;
    const confirmed = await this.alert.confirm('¿Estás seguro de que quieres eliminar este casco?');
    if (!confirmed || !this.helmetToDelete) return;
    this.helmetService.deleteHelmet(this.helmetToDelete.id).subscribe({
      next: () => {
        this.loadHelmets();
        this.loadStats();
        this.closeDeleteModal();
        this.alert.success('Casco eliminado exitosamente');
      },
      error: (err) => {
        console.error('Error eliminando casco:', err);
        this.alert.error(err?.error?.message || 'Error al eliminar casco');
      }
    });
  }

  confirmDeleteHelmet() { /* Obsoleto, flujo unificado con deleteHelmet() */ }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.helmetToDelete = null;
  }

  activateHelmet(helmet: Helmet) {
    if (helmet.status === 'inactivo') {
      this.helmetService.activateHelmet(helmet.serialNumber).subscribe({
        next: () => {
          this.loadHelmets();
          this.loadStats();
          this.alert.success('Casco activado exitosamente');
        },
        error: (err) => {
          console.error('Error activando casco:', err);
          this.alert.error(err?.error?.message || 'Error al activar casco');
        }
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
          this.alert.success('Casco asignado exitosamente');
      },
      error: (err) => {
        console.error('Error al asignar casco:', err);
          this.alert.error(err?.error?.message || 'Error al asignar casco');
      }
    });
  }

  unassignHelmet(helmet: Helmet) {
    if (helmet.status === 'activo-asignado') {
      this.helmetService.unassignHelmet(helmet.id).subscribe({
        next: () => {
          this.loadHelmets();
          this.loadStats();
          this.alert.success('Casco desasignado exitosamente');
        },
        error: (err) => {
          console.error('Error al desasignar casco:', err);
          this.alert.error(err?.error?.message || 'Error al desasignar casco');
        }
      });
    }
  }

  openCreateModal() {
    this.showCreateModal = true;
    this.newHelmet = {};
    // asegurar carga de supervisores al abrir el modal
    this.loadSupervisorsForCreate();
  }

  openActivateModal() {
    this.showActivateModal = true;
    this.newHelmet = {};
  }

  closeCreateModal() {
    this.showCreateModal = false;
    this.newHelmet = {};
  }

  closeActivateModal() {
    this.showActivateModal = false;
    this.newHelmet = {};
  }

  createHelmet(form?: any) {
    if (form && form.controls) Object.values(form.controls).forEach((c: any) => c.markAsTouched());
    this.errorMessage = '';
    const serialOk = !!this.newHelmet.serialNumber && (this.newHelmet.serialNumber as string).trim().length >= 3
    if (serialOk) {
      this.isLoading = true;
      const currentUser = this.authService.getCurrentUser();
      if (currentUser) {
        this.helmetService.createHelmet(this.newHelmet).subscribe({
          next: () => {
            this.loadHelmets();
            this.loadStats();
            this.closeCreateModal();
            this.alert.success('Casco creado exitosamente');
            this.isLoading = false;
          },
          error: (err) => {
            console.error('Error creando casco:', err);
            this.errorMessage = err?.error?.message || 'Error al crear casco';
            this.isLoading = false;
          }
        });
      }
    } else {
      this.errorMessage = 'Ingresa un identificador válido (mínimo 3 caracteres).';
    }
  }

  activateNewHelmet(form?: any) {
    if (form && form.controls) Object.values(form.controls).forEach((c: any) => c.markAsTouched());
    this.errorMessage = '';
    const serial = (this.newHelmet.serialNumber || '').toString().trim();
    const serialOk = serial.length >= 3;
    if (!serialOk) {
      this.errorMessage = 'Ingresa un identificador válido (mínimo 3 caracteres).';
      return;
    }
    this.isLoading = true;
    this.helmetService.activateHelmet(serial).subscribe({
      next: () => {
        this.loadHelmets();
        this.loadStats();
        this.closeActivateModal();
        this.alert.success('Casco activado exitosamente');
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error activando casco:', err);
        const msg = (err?.error?.message) || (err?.message) || 'Error al activar casco';
        this.alert.error(msg);
        this.errorMessage = msg;
        this.isLoading = false;
      }
    });
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
    return this.authService.canModifyHelmet();
  }

  canActivateHelmet(): boolean {
    return this.authService.canActivateHelmet();
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

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Fecha inválida';
    }
  }

  getSensorTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'gps': 'GPS',
      'heart_rate': 'Ritmo Cardíaco',
      'body_temperature': 'Temperatura Corporal',
      'gas': 'Detector de Gas',
      'accelerometer': 'Acelerómetro',
      'gyroscope': 'Giroscopio',
      'battery': 'Batería'
    };
    return labels[type] || type;
  }

  getUnassignedCount(): number {
    const value = (this.helmetStats.active || 0) - (this.helmetStats.assigned || 0)
    return value < 0 ? 0 : value
  }

  toggleSensors(helmetId: string): void {
    this.expandedSensors[helmetId] = !this.expandedSensors[helmetId];
  }

  isSensorsExpanded(helmetId: string): boolean {
    return !!this.expandedSensors[helmetId];
  }
} 