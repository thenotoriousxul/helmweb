import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, Miner, Equipment } from '../../services/auth.service';

@Component({
  selector: 'app-miners',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './miners.component.html',
  styleUrls: ['./miners.component.css']
})
export class MinersComponent implements OnInit {
  miners: Miner[] = [];
  filteredMiners: Miner[] = [];
  searchTerm = '';
  statusFilter = 'all';
  showCreateModal = false;
  newMiner: Partial<Miner> = {};
  currentUser: any = null;

  constructor(
    private router: Router,
    public authService: AuthService
  ) {
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnInit() {
    this.loadMiners();
  }

  // Propiedades computadas para estadísticas
  get totalMiners(): number {
    return this.miners.length;
  }

  get onlineMiners(): number {
    return this.miners.filter(m => m.status === 'online').length;
  }

  get alertMiners(): number {
    return this.miners.filter(m => m.status === 'alert').length;
  }

  get minersWithHelmet(): number {
    return this.miners.filter(m => m.helmetId).length;
  }

  loadMiners() {
    // Simular datos de mineros
    this.miners = [
      {
        id: '1',
        name: 'Carlos',
        lastName: 'Mendoza',
        email: 'carlos.mendoza@helmmining.com',
        birthDate: '1985-03-15',
        hireDate: '2020-01-15',
        phone: '+52 55 1234 5678',
        rfc: 'MEMC850315ABC',
        address: {
          country: 'México',
          state: 'Sonora',
          city: 'Hermosillo',
          neighborhood: 'Centro',
          street: 'Revolución',
          number: '123',
          zipCode: '83000'
        },
        photo: 'CM',
        helmetId: '1',
        teamId: '1',
        supervisorId: '1',
        status: 'online'
      },
      {
        id: '2',
        name: 'Ana',
        lastName: 'Rodríguez',
        email: 'ana.rodriguez@helmmining.com',
        birthDate: '1990-07-22',
        hireDate: '2021-03-10',
        phone: '+52 55 9876 5432',
        rfc: 'ROAA900722DEF',
        address: {
          country: 'México',
          state: 'Sonora',
          city: 'Hermosillo',
          neighborhood: 'San Benito',
          street: 'Independencia',
          number: '456',
          zipCode: '83100'
        },
        photo: 'AR',
        helmetId: '2',
        teamId: '1',
        supervisorId: '1',
        status: 'online'
      },
      {
        id: '3',
        name: 'Miguel',
        lastName: 'Torres',
        email: 'miguel.torres@helmmining.com',
        birthDate: '1988-11-08',
        hireDate: '2019-08-20',
        phone: '+52 55 5555 1234',
        rfc: 'TOMM881108GHI',
        address: {
          country: 'México',
          state: 'Sonora',
          city: 'Hermosillo',
          neighborhood: 'Pitic',
          street: 'Morelos',
          number: '789',
          zipCode: '83200'
        },
        photo: 'MT',
        helmetId: '3',
        teamId: '1',
        supervisorId: '1',
        status: 'alert'
      }
    ];

    // Filtrar según el rol del usuario
    if (this.authService.isMinero()) {
      // Minero solo ve su información
      this.miners = this.miners.filter(miner => miner.id === this.currentUser?.id);
    } else if (this.authService.isSupervisor()) {
      // Supervisor ve solo los mineros de sus equipos
      this.miners = this.miners.filter(miner => miner.supervisorId === this.currentUser?.id);
    }
    // Admin ve todos los mineros

    this.filteredMiners = [...this.miners];
  }

  onSearchChange() {
    this.filterMiners();
  }

  onStatusFilterChange() {
    this.filterMiners();
  }

  filterMiners() {
    this.filteredMiners = this.miners.filter(miner => {
      const fullName = `${miner.name} ${miner.lastName}`.toLowerCase();
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

  showDetail(miner: Miner) {
    // Implementar navegación al detalle del minero
    console.log('Ver detalle del minero:', miner);
  }

  editMiner(miner: Miner) {
    // Implementar edición del minero
    console.log('Editar minero:', miner);
  }

  deleteMiner(miner: Miner) {
    if (confirm('¿Estás seguro de que quieres eliminar este minero?')) {
      // Implementar eliminación del minero
      console.log('Eliminar minero:', miner);
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
    if (this.newMiner.name && this.newMiner.lastName && this.newMiner.email) {
      const newMiner: Miner = {
        id: (this.miners.length + 1).toString(),
        name: this.newMiner.name,
        lastName: this.newMiner.lastName,
        email: this.newMiner.email,
        birthDate: this.newMiner.birthDate || '',
        hireDate: this.newMiner.hireDate,
        phone: this.newMiner.phone || '',
        rfc: this.newMiner.rfc || '',
        address: this.newMiner.address || {
          country: '',
          state: '',
          city: '',
          neighborhood: '',
          street: '',
          number: '',
          zipCode: ''
        },
        photo: `${this.newMiner.name?.charAt(0)}${this.newMiner.lastName?.charAt(0)}`,
        supervisorId: this.currentUser?.id || '',
        status: 'offline'
      };

      this.miners.push(newMiner);
      this.filteredMiners = [...this.miners];
      this.closeCreateModal();
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

  getFullAddress(miner: Miner): string {
    const addr = miner.address;
    return `${addr.street} ${addr.number}, ${addr.neighborhood}, ${addr.city}, ${addr.state}, ${addr.country} ${addr.zipCode}`;
  }
} 