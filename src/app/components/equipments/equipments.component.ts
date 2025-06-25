import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

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
  type: string;
  supervisor: string;
  startDate: string;
}

@Component({
  selector: 'app-equipments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './equipments.component.html',
  styleUrls: ['./equipments.component.css']
})
export class EquipmentsComponent {
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
      type: 'Extracción',
      supervisor: 'Carlos Mendoza',
      startDate: '2024-01-15',
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
      type: 'Perforación',
      supervisor: 'Ana Rodríguez',
      startDate: '2024-01-20',
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
      type: 'Carga',
      supervisor: 'Miguel Torres',
      startDate: '2024-01-10',
      miners: [
        { id: '7', name: 'Elena V.', avatar: 'EV', status: 'alert' },
        { id: '8', name: 'Diego H.', avatar: 'DH', status: 'online' },
        { id: '9', name: 'Sofia L.', avatar: 'SL', status: 'alert' }
      ]
    }
  ];

  filteredEquipments: Equipment[] = [];
  searchTerm = '';
  statusFilter = 'all';
  typeFilter = 'all';
  showCreateModal = false;
  newEquipment: Partial<Equipment> = {};

  constructor(private router: Router) {
    this.filteredEquipments = [...this.equipments];
  }

  // Propiedades computadas para evitar filtros en el template
  get totalEquipments(): number {
    return this.equipments.length;
  }

  get activeEquipments(): number {
    return this.equipments.filter(eq => eq.status === 'active').length;
  }

  get warningEquipments(): number {
    return this.equipments.filter(eq => eq.status === 'warning').length;
  }

  get totalHelmets(): number {
    return this.equipments.reduce((sum, eq) => sum + eq.totalHelmets, 0);
  }

  onSearchChange() {
    this.filterEquipments();
  }

  onStatusFilterChange() {
    this.filterEquipments();
  }

  onTypeFilterChange() {
    this.filterEquipments();
  }

  filterEquipments() {
    this.filteredEquipments = this.equipments.filter(equipment => {
      const matchesSearch = equipment.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           equipment.location.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           equipment.supervisor.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesStatus = this.statusFilter === 'all' || equipment.status === this.statusFilter;
      const matchesType = this.typeFilter === 'all' || equipment.type === this.typeFilter;
      return matchesSearch && matchesStatus && matchesType;
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

  showDetail(equipment: Equipment) {
    this.router.navigate(['/equipment-detail', equipment.id]);
  }

  editEquipment(equipment: Equipment) {
    this.router.navigate(['/equipment-edit', equipment.id]);
  }

  deleteEquipment(equipment: Equipment) {
    if (confirm(`¿Estás seguro de que quieres eliminar el equipo "${equipment.name}"?`)) {
      this.equipments = this.equipments.filter(eq => eq.id !== equipment.id);
      this.filterEquipments();
    }
  }

  openCreateModal() {
    this.showCreateModal = true;
    this.newEquipment = {};
  }

  closeCreateModal() {
    this.showCreateModal = false;
    this.newEquipment = {};
  }

  createEquipment() {
    if (this.newEquipment.name && this.newEquipment.location && this.newEquipment.type) {
      const newEq: Equipment = {
        id: Date.now().toString(),
        name: this.newEquipment.name!,
        totalHelmets: this.newEquipment.totalHelmets || 0,
        activeHelmets: 0,
        status: 'inactive',
        alerts: 0,
        location: this.newEquipment.location!,
        lastUpdate: 'Ahora',
        type: this.newEquipment.type!,
        supervisor: this.newEquipment.supervisor || 'Sin asignar',
        startDate: new Date().toISOString().split('T')[0],
        miners: []
      };
      
      this.equipments.push(newEq);
      this.filterEquipments();
      this.closeCreateModal();
    }
  }

  getEquipmentTypes(): string[] {
    return [...new Set(this.equipments.map(eq => eq.type))];
  }
} 