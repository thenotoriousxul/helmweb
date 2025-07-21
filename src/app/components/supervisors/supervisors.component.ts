import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService, User, Helmet } from '../../services/auth.service';
import { SupervisorService, Supervisor } from '../../services/supervisor.service';
import { firstValueFrom } from 'rxjs';

interface SupervisorWithAccessCode extends Supervisor {
  accessCode?: string;
}

@Component({
  selector: 'app-supervisors',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './supervisors.component.html',
  styleUrls: ['./supervisors.component.css']
})
export class SupervisorsComponent implements OnInit {
  supervisors: SupervisorWithAccessCode[] = [];
  filteredSupervisors: SupervisorWithAccessCode[] = [];
  searchTerm = '';
  showCreateModal = false;
  showAccessCodeModal = false;
  selectedSupervisor: SupervisorWithAccessCode | null = null;
  newSupervisor: Partial<SupervisorWithAccessCode> = {};
  generatedAccessCode = '';

  constructor(
    private router: Router,
    private http: HttpClient,
    public authService: AuthService,
    private supervisorService: SupervisorService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Verificar si el usuario está autenticado antes de cargar supervisores
    if (this.authService.isAuthenticated()) {
      // Verificar si el usuario es admin
      if (this.authService.isAdmin()) {
        this.loadSupervisors();
      } else {
        alert('No tienes permisos para acceder a esta sección');
        this.router.navigate(['/dashboard']);
      }
    } else {
      this.router.navigate(['/login']);
    }
  }

  loadSupervisors() {
    this.supervisorService.getSupervisors().subscribe({
      next: (response: any) => {
        // Verificar si la respuesta tiene la estructura esperada
        const supervisors = response.data || response;
        
        // Convertir los supervisores de la API al formato esperado
        this.supervisors = supervisors.map((supervisor: any) => ({
          ...supervisor,
          accessCode: undefined // Los códigos de acceso no se incluyen en la lista por seguridad
        }));
        this.filteredSupervisors = [...this.supervisors];
        
        // Forzar la detección de cambios
        this.cdr.detectChanges();
      },
      error: (error) => {
        if (error.status === 401) {
          alert('No estás autenticado. Por favor, inicia sesión.');
          this.router.navigate(['/login']);
        } else if (error.status === 403) {
          alert('No tienes permisos para ver supervisores. Se requieren permisos de administrador.');
          this.router.navigate(['/dashboard']);
        } else {
          alert('Error al cargar la lista de supervisores: ' + (error.error?.message || error.message || 'Error desconocido'));
        }
      }
    });
  }

  onSearchChange() {
    this.filterSupervisors();
  }

  filterSupervisors() {
    this.filteredSupervisors = this.supervisors.filter(supervisor => {
      const fullName = supervisor.fullName.toLowerCase();
      const matchesSearch = fullName.includes(this.searchTerm.toLowerCase()) ||
                           supervisor.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           (supervisor.accessCode && supervisor.accessCode.toLowerCase().includes(this.searchTerm.toLowerCase()));
      
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
    console.log(this.newSupervisor.email);
    if (!this.newSupervisor.email) {
      alert('Por favor, ingresa un correo electrónico válido');
      return;
    }

    try {
      // Llamar a la API para generar el código de acceso
      const response: any = await firstValueFrom(this.supervisorService.generateAccessCode(this.newSupervisor.email));

      const accessCode = response.data.codigo;
      
      this.closeCreateModal();
      
      // Mostrar el código generado en el modal
      this.generatedAccessCode = accessCode;
      this.showAccessCodeModal = true;
      
      // Recargar la lista de supervisores para mostrar el nuevo supervisor si ya se registró
      this.loadSupervisors();
    } catch (error: any) {
      const errorMessage = error.error?.message || error.message || 'Error desconocido';
      alert('Error al generar código de acceso: ' + errorMessage);
    }
  }



  showAccessCode(supervisor: SupervisorWithAccessCode) {
    this.selectedSupervisor = supervisor;
    this.showAccessCodeModal = true;
    
    // Obtener el código de acceso del supervisor
    this.supervisorService.getAccessCodeByEmail(supervisor.email).subscribe({
      next: (response: any) => {
        if (response.data && response.data.codigo) {
          const data = response.data;
          
          if (data.usado) {
            this.generatedAccessCode =
`\nCódigo: ${data.codigo}\nEstado: Usado\nGenerado: ${new Date(data.createdAt).toLocaleDateString()}\nUsado: ${data.fechaUso ? new Date(data.fechaUso).toLocaleDateString() : 'N/A'}`;
          } else {
            this.generatedAccessCode =
`\nCódigo: ${data.codigo}\nEstado: No usado\nGenerado: ${new Date(data.createdAt).toLocaleDateString()}`;
          }
          
          // Forzar la detección de cambios
          this.cdr.detectChanges();
        } else {
          this.generatedAccessCode = 'No se encontró un código de acceso para este supervisor.\n\nPara generar un nuevo código:\n1. Ve a la sección "Invitar Supervisor"\n2. Ingresa el correo: ' + supervisor.email + '\n3. Se generará un código único';
          this.cdr.detectChanges();
        }
      },
      error: (error) => {
        if (error.status === 404) {
          this.generatedAccessCode = 'Este supervisor no tiene un código de acceso generado.\n\nPara generar un nuevo código:\n1. Ve a la sección "Invitar Supervisor"\n2. Ingresa el correo: ' + supervisor.email + '\n3. Se generará un código único';
        } else {
          this.generatedAccessCode = 'Error al obtener el código de acceso.\n\nPor favor, inténtalo de nuevo más tarde.';
        }
        this.cdr.detectChanges();
      }
    });
  }

  closeAccessCodeModal() {
    this.showAccessCodeModal = false;
    this.selectedSupervisor = null;
  }

  async generateNewCode() {
    if (!this.selectedSupervisor?.email) {
      alert('No se puede generar código sin email del supervisor');
      return;
    }

    try {
      // Llamar a la API para generar el código de acceso
      const response: any = await firstValueFrom(this.supervisorService.generateAccessCode(this.selectedSupervisor.email));

      const accessCode = response.data.codigo;
      
      // Mostrar el código generado en el modal
      this.generatedAccessCode = `Código: ${accessCode}\n\nEstado: No usado\nGenerado: ${new Date().toLocaleDateString()}`;
      
      // Recargar la lista de supervisores
      this.loadSupervisors();
    } catch (error: any) {
      const errorMessage = error.error?.message || error.message || 'Error desconocido';
      alert('Error al generar código de acceso: ' + errorMessage);
    }
  }

  // Los códigos de acceso son de un solo uso y no se pueden regenerar
  // regenerateAccessCode() {
  //   if (this.selectedSupervisor) {
  //     this.generatedAccessCode = this.generateAccessCode();
  //     this.selectedSupervisor.accessCode = this.generatedAccessCode;
  //   }
  // }

  viewSupervisorDetail(supervisor: SupervisorWithAccessCode) {
    // Implementar navegación al detalle del supervisor
  }



  getTotalHelmets(): number {
    return this.supervisors.reduce((sum, s) => sum + s.totalHelmets, 0);
  }

  getActiveHelmets(): number {
    return this.supervisors.reduce((sum, s) => sum + s.activeHelmets, 0);
  }

  copyToClipboard() {
    if (this.generatedAccessCode) {
      // Extraer solo el código de la información completa
      const codeMatch = this.generatedAccessCode.match(/Código: ([A-F0-9]+)/);
      const codeToCopy = codeMatch ? codeMatch[1] : this.generatedAccessCode;
      
      navigator.clipboard.writeText(codeToCopy).then(() => {
        alert('Código copiado al portapapeles');
      }).catch(() => {
        alert('Error al copiar al portapapeles');
      });
    }
  }

  checkAccessCodes() {
    this.supervisorService.getAllAccessCodes().subscribe({
      next: (response: any) => {
        if (response.data && response.data.length > 0) {
          const codes = response.data.map((code: any) => 
            `${code.correoSupervisor}: ${code.codigo} (${code.usado ? 'Usado' : 'No usado'})`
          ).join('\n');
          alert('Códigos existentes:\n' + codes);
        } else {
          alert('No hay códigos de acceso en la base de datos');
        }
      },
      error: (error) => {
        alert('Error al obtener códigos de acceso');
      }
    });
  }

  testAccessCode() {
    const testEmail = 'saulsanchezlopez999@gmail.com';
    
    this.http.get(`http://localhost:3333/access-codes/test/${encodeURIComponent(testEmail)}`, { withCredentials: true }).subscribe({
      next: (response: any) => {
        alert('Test completado. Revisa la consola para detalles.');
      },
      error: (error) => {
        alert('Error en test. Revisa la consola para detalles.');
      }
    });
  }

} 