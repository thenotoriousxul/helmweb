import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, User, Helmet } from '../../services/auth.service';

interface Supervisor extends User {
  totalHelmets: number;
  activeHelmets: number;
  inactiveHelmets: number;
  accessCode?: string;
  createdAt: string;
}

@Component({
  selector: 'app-supervisors',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './supervisors.component.html',
  styleUrls: ['./supervisors.component.css']
})
export class SupervisorsComponent implements OnInit {
  supervisors: Supervisor[] = [];
  filteredSupervisors: Supervisor[] = [];
  searchTerm = '';
  showCreateModal = false;
  showAccessCodeModal = false;
  selectedSupervisor: Supervisor | null = null;
  newSupervisor: Partial<Supervisor> = {};
  generatedAccessCode = '';

  constructor(
    private router: Router,
    public authService: AuthService
  ) {}

  ngOnInit() {
    this.loadSupervisors();
  }

  loadSupervisors() {
    // Simular datos de supervisores
    this.supervisors = [
      {
        id: '1',
        name: 'Juan',
        email: 'juan.supervisor@helmmining.com',
        role: 'SUPERVISOR',
        avatar: 'JS',
        department: 'Minería',
        totalHelmets: 15,
        activeHelmets: 12,
        inactiveHelmets: 3,
        accessCode: 'SUP001',
        createdAt: '2024-01-15'
      },
      {
        id: '2',
        name: 'María',
        email: 'maria.supervisor@helmmining.com',
        role: 'SUPERVISOR',
        avatar: 'MS',
        department: 'Minería',
        totalHelmets: 20,
        activeHelmets: 18,
        inactiveHelmets: 2,
        accessCode: 'SUP002',
        createdAt: '2024-02-10'
      },
      {
        id: '3',
        name: 'Pedro',
        email: 'pedro.supervisor@helmmining.com',
        role: 'SUPERVISOR',
        avatar: 'PS',
        department: 'Minería',
        totalHelmets: 10,
        activeHelmets: 8,
        inactiveHelmets: 2,
        accessCode: 'SUP003',
        createdAt: '2024-03-05'
      }
    ];

    this.filteredSupervisors = [...this.supervisors];
  }

  onSearchChange() {
    this.filterSupervisors();
  }

  filterSupervisors() {
    this.filteredSupervisors = this.supervisors.filter(supervisor => {
      const fullName = supervisor.name.toLowerCase();
      const matchesSearch = fullName.includes(this.searchTerm.toLowerCase()) ||
                           supervisor.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           supervisor.accessCode?.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      return matchesSearch;
    });
  }

  openCreateModal() {
    this.showCreateModal = true;
    this.newSupervisor = {};
  }

  closeCreateModal() {
    this.showCreateModal = false;
    this.newSupervisor = {};
  }

  createSupervisor() {
    if (this.newSupervisor.email) {
      const accessCode = this.generateAccessCode();
      const newSupervisor: Supervisor = {
        id: (this.supervisors.length + 1).toString(),
        name: 'Pendiente de Registro',
        email: this.newSupervisor.email,
        role: 'SUPERVISOR',
        avatar: 'PS',
        department: 'Minería',
        totalHelmets: 0,
        activeHelmets: 0,
        inactiveHelmets: 0,
        accessCode: accessCode,
        createdAt: new Date().toISOString().split('T')[0]
      };

      this.supervisors.push(newSupervisor);
      this.filteredSupervisors = [...this.supervisors];
      this.closeCreateModal();
      
      // Mostrar alerta de confirmación
      alert(`✅ Supervisor registrado exitosamente!\n\n📧 Se ha enviado el código de acceso ${accessCode} al correo:\n${this.newSupervisor.email}\n\nEl supervisor debe usar este código para completar su registro en el sistema.`);
    }
  }

  generateAccessCode(): string {
    const prefix = 'SUP';
    const number = (this.supervisors.length + 1).toString().padStart(3, '0');
    return prefix + number;
  }

  showAccessCode(supervisor: Supervisor) {
    this.selectedSupervisor = supervisor;
    this.generatedAccessCode = supervisor.accessCode || this.generateAccessCode();
    this.showAccessCodeModal = true;
  }

  closeAccessCodeModal() {
    this.showAccessCodeModal = false;
    this.selectedSupervisor = null;
  }

  // Los códigos de acceso son de un solo uso y no se pueden regenerar
  // regenerateAccessCode() {
  //   if (this.selectedSupervisor) {
  //     this.generatedAccessCode = this.generateAccessCode();
  //     this.selectedSupervisor.accessCode = this.generatedAccessCode;
  //   }
  // }

  viewSupervisorDetail(supervisor: Supervisor) {
    // Implementar navegación al detalle del supervisor
    console.log('Ver detalle del supervisor:', supervisor);
  }



  getTotalHelmets(): number {
    return this.supervisors.reduce((sum, s) => sum + s.totalHelmets, 0);
  }

  getActiveHelmets(): number {
    return this.supervisors.reduce((sum, s) => sum + s.activeHelmets, 0);
  }


} 