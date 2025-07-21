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
  showDetailModal = false;
  detailMinerData: Partial<Minero> = {};
  currentUser: any = null;
  minerStats: MineroStats = {
    totalMiners: 0,
    activeMiners: 0,
    inactiveMiners: 0,
    avgAge: 0
  };

  constructor(
    private router: Router,
    public authService: AuthService,
    private mineroService: MineroService,
    private cdr: ChangeDetectorRef
  ) {
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnInit() {
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
    this.mineroService.getAllMiners().subscribe({
      next: (miners) => {
        this.miners = miners;
        this.filteredMiners = [...miners];
        
        // Forzar detección de cambios
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('MinersComponent: Error al cargar mineros:', error);
      }
    });
  }

  loadStats() {
    this.mineroService.getMineroStats().subscribe((stats: MineroStats) => {
      this.minerStats = stats;
    });
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
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
    this.editMinerData = {};
  }

  saveEditMiner() {
    if (this.editMinerData.id) {
      this.mineroService.updateMinero(this.editMinerData.id, this.editMinerData).subscribe(() => {
        this.mineroService.clearCache(); // Limpiar cache para mostrar datos actualizados
        this.loadMiners();
        this.loadStats();
        this.closeEditModal();
      });
    }
  }

  deleteMiner(miner: Minero) {
    if (confirm('¿Estás seguro de que quieres eliminar este minero?')) {
      this.mineroService.deleteMinero(miner.id).subscribe(() => {
        this.mineroService.clearCache(); // Limpiar cache para mostrar datos actualizados
        this.loadMiners();
        this.loadStats();
      });
    }
  }

  openCreateModal() {
    this.showCreateModal = true;
    this.newMiner = {};
  }

  closeCreateModal() {
    this.showCreateModal = false;
    this.newMiner = {};
  }

  createMiner() {
    if (this.newMiner.fullName && this.newMiner.email) {
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
          }, 100);
        },
        error: (error) => {
          console.error('Error al crear minero:', error);
          alert('Error al crear el minero. Por favor, inténtalo de nuevo.');
        }
      });
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
} 