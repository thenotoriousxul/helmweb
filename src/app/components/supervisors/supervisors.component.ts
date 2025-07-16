import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
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
  imports: [CommonModule, FormsModule, HttpClientModule],
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
    private http: HttpClient,
    public authService: AuthService
  ) {}

  ngOnInit() {
    this.loadSupervisors();
  }

  loadSupervisors() {
    // Simular datos de supervisores con códigos reales
    this.supervisors = [
      {
        id: '1',
        fullName: 'Juan',
        email: 'juan.supervisor@helmmining.com',
        role: 'supervisor',
        avatar: 'JS',
        department: 'Minería',
        totalHelmets: 15,
        activeHelmets: 12,
        inactiveHelmets: 3,
        accessCode: 'A1B2C3D4E5F6',
        createdAt: '2024-01-15'
      },
      {
        id: '2',
        fullName: 'María',
        email: 'maria.supervisor@helmmining.com',
        role: 'supervisor',
        avatar: 'MS',
        department: 'Minería',
        totalHelmets: 20,
        activeHelmets: 18,
        inactiveHelmets: 2,
        accessCode: 'F7G8H9I0J1K2',
        createdAt: '2024-02-10'
      },
      {
        id: '3',
        fullName: 'Pedro',
        email: 'pedro.supervisor@helmmining.com',
        role: 'supervisor',
        avatar: 'PS',
        department: 'Minería',
        totalHelmets: 10,
        activeHelmets: 8,
        inactiveHelmets: 2,
        accessCode: 'L3M4N5O6P7Q8',
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
      const fullName = supervisor.fullName.toLowerCase();
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

  async createSupervisor() {
    if (!this.newSupervisor.email) {
      alert('Por favor, ingresa un correo electrónico válido');
      return;
    }

    try {
      // Llamar a la API para generar el código de acceso
      const response: any = await this.http.post('http://localhost:3333/access-codes', {
        email: this.newSupervisor.email
      }, { withCredentials: true }).toPromise();

      const accessCode = response.data.code;
      
      // Crear el supervisor en la lista local (simulado)
      const newSupervisor: Supervisor = {
        id: (this.supervisors.length + 1).toString(),
        fullName: 'Pendiente de Registro',
        email: this.newSupervisor.email,
        role: 'supervisor',
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
      
      // Mostrar el código generado en el modal
      this.selectedSupervisor = newSupervisor;
      this.generatedAccessCode = accessCode;
      this.showAccessCodeModal = true;
      
      console.log('Código de acceso generado exitosamente:', response.data);
    } catch (error: any) {
      console.error('Error al generar código de acceso:', error);
      const errorMessage = error.error?.message || error.message || 'Error desconocido';
      alert('Error al generar código de acceso: ' + errorMessage);
    }
  }



  showAccessCode(supervisor: Supervisor) {
    this.selectedSupervisor = supervisor;
    this.generatedAccessCode = supervisor.accessCode || 'Código no disponible';
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

  copyToClipboard() {
    if (this.generatedAccessCode) {
      navigator.clipboard.writeText(this.generatedAccessCode).then(() => {
        alert('Código copiado al portapapeles');
      }).catch(() => {
        alert('Error al copiar al portapapeles');
      });
    }
  }

} 