import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

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
  description: string;
  capacity: number;
}

@Component({
  selector: 'app-equipment-edit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './equipment-edit.component.html',
  styleUrls: ['./equipment-edit.component.css']
})
export class EquipmentEditComponent implements OnInit {
  equipment: Equipment | null = null;
  isSaving = false;
  showDeleteConfirm = false;

  equipmentTypes = ['Extracción', 'Perforación', 'Carga', 'Transporte', 'Mantenimiento'];

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const equipmentId = params['id'];
      this.loadEquipmentData(equipmentId);
    });
  }

  loadEquipmentData(equipmentId: string) {
    // Simulación de datos del equipo
    this.equipment = {
      id: equipmentId,
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
      description: 'Equipo principal de extracción en la zona norte de la mina. Responsable de la extracción de minerales en los niveles 3-5.',
      capacity: 50,
      miners: [
        { id: '1', name: 'Carlos M.', avatar: 'CM', status: 'online' },
        { id: '2', name: 'Ana R.', avatar: 'AR', status: 'online' },
        { id: '3', name: 'Miguel T.', avatar: 'MT', status: 'alert' }
      ]
    };
  }

  saveEquipment() {
    if (!this.equipment) return;

    this.isSaving = true;
    
    // Simulación de guardado
    setTimeout(() => {
      this.isSaving = false;
      alert('Equipo actualizado correctamente');
      this.router.navigate(['/equipment-detail', this.equipment?.id]);
    }, 1000);
  }

  cancelEdit() {
    this.router.navigate(['/equipment-detail', this.equipment?.id]);
  }

  deleteEquipment() {
    if (!this.equipment) return;

    this.showDeleteConfirm = true;
  }

  confirmDelete() {
    if (!this.equipment) return;

    // Simulación de eliminación
    setTimeout(() => {
      this.showDeleteConfirm = false;
      alert('Equipo eliminado correctamente');
      this.router.navigate(['/equipments']);
    }, 1000);
  }

  cancelDelete() {
    this.showDeleteConfirm = false;
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
} 