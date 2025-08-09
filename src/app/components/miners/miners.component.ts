import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MineroService, Minero, MineroStats } from '../../services/minero.service';

@Component({
  selector: 'app-miners',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './miners.component.html',
  styleUrls: ['./miners.component.css']
})
export class MinersComponent implements OnInit {
  miners: Minero[] = [];
  filteredMiners: Minero[] = [];
  searchTerm = '';
  statusFilter = 'all';
  showCreateModal = false;
  newMiner: Partial<Minero> = {};
  showEditModal = false;
  editMinerData: Partial<Minero> = {};
  originalEditMinerData: Partial<Minero> = {};
  editFormError = '';
  showDetailModal = false;
  detailMinerData: Partial<Minero> = {};
  currentUser: any = null;
  isLoading = true;
  errorMessage = '';
  hasPermissionError = false;
  permissionErrorMessage = '';
  minerStats: MineroStats = {
    totalMiners: 0,
    activeMiners: 0,
    inactiveMiners: 0,
    avgAge: 0
  };
  yesterdayISO = '';
  adultMaxISO = '';

  constructor(
    private router: Router,
    public authService: AuthService,
    private mineroService: MineroService,
    private cdr: ChangeDetectorRef
  ) {
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnInit() {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    yesterday.setHours(0,0,0,0);
    this.yesterdayISO = yesterday.toISOString().slice(0,10);
    const adultMax = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    adultMax.setHours(0,0,0,0);
    this.adultMaxISO = adultMax.toISOString().slice(0,10);
    this.loadMiners();
    this.loadStats();
  }

  // Propiedades computadas para estadísticas
  get totalMiners(): number {
    return this.minerStats.totalMiners;
  }

  get activeMiners(): number {
    return this.minerStats.activeMiners;
  }

  get inactiveMiners(): number {
    return this.minerStats.inactiveMiners;
  }

  get avgAge(): number {
    return this.minerStats.avgAge;
  }

  loadMiners() {
    this.isLoading = true;
    this.hasPermissionError = false;
    
    this.mineroService.getAllMiners().subscribe({
      next: (miners) => {
        this.miners = miners;
        this.filteredMiners = [...miners];
        this.isLoading = false;
        
        // Forzar detección de cambios
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('MinersComponent: Error al cargar mineros:', error);
        this.isLoading = false;
        
        if (error.status === 403) {
          this.hasPermissionError = true;
          this.permissionErrorMessage = 'No tienes permisos para ver la lista de mineros. Solo los administradores pueden acceder a esta sección.';
        } else {
          this.permissionErrorMessage = 'Error al cargar los mineros. Por favor, intenta de nuevo.';
        }
        
        this.cdr.detectChanges();
      }
    });
  }

  loadStats() {
    this.mineroService.getMineroStats().subscribe({
      next: (stats: MineroStats) => {
        this.minerStats = stats;
      },
      error: (error) => {
        console.error('MinersComponent: Error al cargar estadísticas:', error);
        // No mostrar error de permisos para stats ya que loadMiners ya lo maneja
      }
    });
  }

  // Helpers de validación para plantillas (ngModel)
  isInvalidBirthDate(dateStr?: string): boolean {
    if (!dateStr) return true;
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return true;
    const today = new Date();
    const adultMax = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    // Normalizar a medianoche para comparar solo fechas
    date.setHours(0, 0, 0, 0);
    adultMax.setHours(0, 0, 0, 0);
    // Fecha de nacimiento debe ser menor o igual a (hoy - 18 años)
    return date > adultMax;
  }

  isValidEmail(value?: string): boolean {
    const email = (value || '').trim()
    if (!email) return false
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  hasText(value?: string): boolean {
    return (value || '').trim().length > 0
  }

  isEditUnchanged(): boolean {
    const fields: (keyof Minero)[] = ['fullName','email','birthDate','phone','rfc','address']
    for (const f of fields) {
      if ((this.editMinerData as any)[f] !== (this.originalEditMinerData as any)[f]) {
        return false
      }
    }
    return true
  }

  onSearchChange() {
    this.filterMiners();
  }

  onStatusFilterChange() {
    this.filterMiners();
  }

  filterMiners() {
    this.filteredMiners = this.miners.filter(miner => {
      const fullName = miner.fullName.toLowerCase();
      const matchesSearch = fullName.includes(this.searchTerm.toLowerCase()) ||
                           miner.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           miner.rfc.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesStatus = this.statusFilter === 'all' || miner.status === this.statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'online': return '#28a745';
      case 'offline': return '#6c757d';
      case 'alert': return '#dc3545';
      default: return '#6c757d';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'online': return 'En línea';
      case 'offline': return 'Desconectado';
      case 'alert': return 'Alerta';
      default: return 'Desconocido';
    }
  }

  showDetail(miner: Minero) {
    this.openDetailModal(miner.id);
  }

  openDetailModal(id: string) {
    this.mineroService.getMineroById(id).subscribe({
      next: (data) => {
        this.detailMinerData = data;
        this.showDetailModal = true;
      },
      error: (err) => {
        alert('No se pudo obtener el detalle del minero.');
      }
    });
  }

  closeDetailModal() {
    this.showDetailModal = false;
    this.detailMinerData = {};
  }

  editMiner(miner: Minero) {
    this.openEditModal(miner);
  }

  openEditModal(miner: Minero) {
    this.editMinerData = { ...miner };
    this.originalEditMinerData = { ...miner };
    this.editFormError = '';
    this.errorMessage = '';
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
    this.editMinerData = {};
  }

  saveEditMiner(form?: any) {
    if (form && form.controls) {
      Object.values(form.controls).forEach((c: any) => c.markAsTouched());
    }
    this.editFormError = ''
    this.errorMessage = ''
    if (!this.editMinerData.id) return;

    // Validaciones cliente
    const nameOk = !!this.editMinerData.fullName && (this.editMinerData.fullName as string).trim().length >= 3 && /^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$/.test((this.editMinerData.fullName as string).trim())
    if (!nameOk) { return }
    if (!this.isValidEmail(this.editMinerData.email)) { this.errorMessage = 'Proporciona un correo válido.'; return }
    if (this.isInvalidBirthDate(this.editMinerData.birthDate)) { this.errorMessage = 'La fecha de nacimiento debe ser anterior a hoy.'; return }
    const rfcOk = !!this.editMinerData.rfc && /^[A-Z0-9]{12,13}$/.test((this.editMinerData.rfc as string).trim().toUpperCase())
    const phoneOk = this.hasText(this.editMinerData.phone) && (this.editMinerData.phone as string).trim().length >= 10
    const addressOk = this.hasText(this.editMinerData.address)
    if (!rfcOk) { this.errorMessage = 'RFC inválido (12-13 caracteres alfanuméricos).'; return }
    if (!phoneOk) { this.errorMessage = 'El teléfono es obligatorio (mín. 10 dígitos).'; return }
    if (!addressOk) { this.errorMessage = 'La dirección es obligatoria.'; return }
    if (this.isEditUnchanged()) { this.editFormError = 'No hay cambios para guardar.'; return }
    this.isLoading = true;
    this.mineroService.updateMinero(this.editMinerData.id, this.editMinerData).subscribe({
        next: () => {
          this.mineroService.clearCache();
          this.loadMiners();
          this.loadStats();
          this.closeEditModal();
          alert('Minero actualizado exitosamente');
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error al actualizar minero:', err);
          this.errorMessage = err?.error?.message || 'Error al actualizar minero';
          this.isLoading = false;
        }
      });
  }

  deleteMiner(miner: Minero) {
    if (confirm('¿Estás seguro de que quieres eliminar este minero?')) {
      this.mineroService.deleteMinero(miner.id).subscribe({
        next: () => {
          this.mineroService.clearCache(); // Limpiar cache para mostrar datos actualizados
          this.loadMiners();
          this.loadStats();
          alert('Minero eliminado exitosamente');
        },
        error: (err) => {
          console.error('Error al eliminar minero:', err);
          alert(err?.error?.message || 'Error al eliminar minero');
        }
      });
    }
  }

  openCreateModal() {
    this.showCreateModal = true;
    this.newMiner = {};
    this.errorMessage = '';
  }

  closeCreateModal() {
    this.showCreateModal = false;
    this.newMiner = {};
  }

  createMiner(form?: any) {
    if (form && form.controls) {
      Object.values(form.controls).forEach((c: any) => c.markAsTouched());
    }
    this.errorMessage = '';
    const nameOk = !!this.newMiner.fullName && (this.newMiner.fullName as string).trim().length >= 3 && /^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$/.test((this.newMiner.fullName as string).trim())
    const emailOk = !!this.newMiner.email && this.isValidEmail(this.newMiner.email as string)
    const birthOk = !this.isInvalidBirthDate(this.newMiner.birthDate)
    const rfcOk = !!this.newMiner.rfc && /^[A-Z0-9]{12,13}$/.test((this.newMiner.rfc as string).trim().toUpperCase())
    const phoneOk = !!this.newMiner.phone && (this.newMiner.phone as string).trim().length >= 10
    const genderOk = !!this.newMiner.genero
    const specialityOk = !!this.newMiner.especialidadEnMineria && (this.newMiner.especialidadEnMineria as string).trim().length >= 3
    const addressOk = !!this.newMiner.address && (this.newMiner.address as string).trim().length > 0
    const hireDateOk = !!this.newMiner.fechaContratacion
    if (nameOk && emailOk && birthOk && rfcOk && phoneOk && genderOk && specialityOk && addressOk && hireDateOk) {
      this.isLoading = true;
      console.log('Creando minero con datos:', this.newMiner);
      this.mineroService.createMinero(this.newMiner).subscribe({
        next: (response) => {
          console.log('Minero creado exitosamente:', response);
          this.mineroService.clearCache(); // Limpiar cache para mostrar datos actualizados
          this.closeCreateModal();
          // Forzar recarga completa de datos
          setTimeout(() => {
            this.loadMiners();
            this.loadStats();
            alert('Minero creado exitosamente');
          }, 50);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error al crear minero:', error);
          this.errorMessage = error?.error?.message || 'Error al crear el minero. Por favor, inténtalo de nuevo.';
          this.isLoading = false;
        }
      });
    } else {
      if (!nameOk) {
        // Mensaje ya se muestra debajo del campo por validación de plantilla
      }
      else if (!emailOk) this.errorMessage = 'Proporciona un correo válido.';
      else if (!birthOk) this.errorMessage = 'La fecha de nacimiento debe ser anterior a hoy.';
      else if (!rfcOk) this.errorMessage = 'RFC inválido (12-13 caracteres alfanuméricos).';
      else if (!phoneOk) this.errorMessage = 'El teléfono es obligatorio (mín. 10 dígitos).';
      else if (!genderOk) this.errorMessage = 'El género es obligatorio.';
      else if (!specialityOk) this.errorMessage = 'La especialidad es obligatoria (mín. 3 caracteres).';
      else if (!addressOk) this.errorMessage = 'La dirección es obligatoria.';
      else if (!hireDateOk) this.errorMessage = 'La fecha de contratación es obligatoria.';
    }
  }

  canCreateMiner(): boolean {
    return this.authService.canCreateMiner();
  }

  canModifyMiner(): boolean {
    return this.authService.isSupervisor() || this.authService.isAdmin();
  }

  canViewAllMiners(): boolean {
    return this.authService.canViewAllMiners();
  }

  getStatusOptions(): { value: string; label: string }[] {
    return [
      { value: 'all', label: 'Todos los estados' },
      { value: 'online', label: 'En línea' },
      { value: 'offline', label: 'Desconectado' },
      { value: 'alert', label: 'Alerta' }
    ];
  }

  getFullAddress(miner: Minero): string {
    // Since address is a string in the Minero interface, just return it as is
    return miner.address || 'Sin dirección';
  }

  hasAdminPermissions(): boolean {
    return this.authService.isAdmin();
  }

  getPermissionMessage(): string {
    if (this.authService.isSupervisor()) {
      return 'Como supervisor, solo puedes ver los mineros de tus equipos asignados.';
    } else if (this.authService.isMinero()) {
      return 'Como minero, no tienes acceso a la gestión de otros mineros.';
    }
    return 'No tienes permisos para acceder a esta sección.';
  }

  goBack() {
    this.router.navigate(['/equipments']);
  }
} 