import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  department: string;
}

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterOutlet],
  template: `
    <div class="dashboard-container">
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="sidebar-header">
          <div class="logo">
            <h2>Helm<span class="accent">IoT</span></h2>
          </div>
        </div>
        
        <nav class="sidebar-nav">
          <ul class="nav-list">
            <li class="nav-item" [class.active]="activeSidebarItem === 'dashboard'">
              <a (click)="setActiveSidebarItem('dashboard')">
                <i class="fas fa-tachometer-alt"></i>
                <span>Dashboard</span>
              </a>
            </li>
            <li class="nav-item" [class.active]="activeSidebarItem === 'equipments'">
              <a (click)="setActiveSidebarItem('equipments')">
                <i class="fas fa-hard-hat"></i>
                <span>Equipos</span>
              </a>
            </li>
            <li class="nav-item" [class.active]="activeSidebarItem === 'helmets'">
              <a (click)="setActiveSidebarItem('helmets')">
                <i class="fas fa-shield-alt"></i>
                <span>Cascos</span>
              </a>
            </li>
            <li class="nav-item" [class.active]="activeSidebarItem === 'alerts'">
              <a (click)="setActiveSidebarItem('alerts')">
                <i class="fas fa-bell"></i>
                <span>Alertas</span>
                <span class="alert-badge" *ngIf="getTotalStats().totalAlerts > 0">{{ getTotalStats().totalAlerts }}</span>
              </a>
            </li>
            <li class="nav-item" [class.active]="activeSidebarItem === 'reports'">
              <a (click)="setActiveSidebarItem('reports')">
                <i class="fas fa-chart-bar"></i>
                <span>Reportes</span>
              </a>
            </li>
            <li class="nav-item" [class.active]="activeSidebarItem === 'settings'">
              <a (click)="setActiveSidebarItem('settings')">
                <i class="fas fa-cog"></i>
                <span>Configuración</span>
              </a>
            </li>
          </ul>
        </nav>
        
        <div class="sidebar-footer">
          <div class="user-profile" (click)="toggleProfileDropdown()">
            <div class="user-avatar">
              <span>{{ userProfile.avatar }}</span>
            </div>
            <div class="user-info">
              <span class="user-name">{{ userProfile.name }}</span>
              <span class="user-role">{{ userProfile.role }}</span>
            </div>
            <div class="dropdown-arrow" [class.open]="showProfileDropdown">
              <i class="fas fa-chevron-down"></i>
            </div>
          </div>
          
          <!-- Profile Dropdown -->
          <div class="profile-dropdown" *ngIf="showProfileDropdown">
            <div class="dropdown-item" (click)="goToProfile()">
              <i class="fas fa-user"></i>
              <span>Mi Perfil</span>
            </div>
            <div class="dropdown-item" (click)="changePassword()">
              <i class="fas fa-key"></i>
              <span>Cambiar Contraseña</span>
            </div>
            <div class="dropdown-divider"></div>
            <div class="dropdown-item danger" (click)="logout()">
              <i class="fas fa-sign-out-alt"></i>
              <span>Cerrar Sesión</span>
            </div>
          </div>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
    </div>

    <!-- Change Password Modal -->
    <div class="modal-overlay" *ngIf="showPasswordModal" (click)="closePasswordModal()">
      <div class="modal-content glass" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>Cambiar Contraseña</h3>
          <button class="close-btn" (click)="closePasswordModal()">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <form (ngSubmit)="updatePassword()">
            <div class="form-group">
              <label for="currentPassword">Contraseña Actual</label>
              <input 
                type="password" 
                id="currentPassword"
                [(ngModel)]="passwordData.currentPassword" 
                name="currentPassword"
                placeholder="Ingresa tu contraseña actual"
                required
              >
            </div>
            
            <div class="form-group">
              <label for="newPassword">Nueva Contraseña</label>
              <input 
                type="password" 
                id="newPassword"
                [(ngModel)]="passwordData.newPassword" 
                name="newPassword"
                placeholder="Ingresa la nueva contraseña"
                required
              >
            </div>
            
            <div class="form-group">
              <label for="confirmPassword">Confirmar Contraseña</label>
              <input 
                type="password" 
                id="confirmPassword"
                [(ngModel)]="passwordData.confirmPassword" 
                name="confirmPassword"
                placeholder="Confirma la nueva contraseña"
                required
              >
            </div>
            
            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" (click)="closePasswordModal()">
                Cancelar
              </button>
              <button type="submit" class="btn btn-primary">
                <i class="fas fa-save"></i>
                Actualizar Contraseña
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent {
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
      miners: [
        { id: '7', name: 'Elena V.', avatar: 'EV', status: 'alert' },
        { id: '8', name: 'Diego H.', avatar: 'DH', status: 'online' },
        { id: '9', name: 'Sofia L.', avatar: 'SL', status: 'alert' }
      ]
    },
    {
      id: '4',
      name: 'Equipo Mina Oeste',
      totalHelmets: 29,
      activeHelmets: 25,
      status: 'inactive',
      alerts: 0,
      location: 'Zona D-3',
      lastUpdate: '15 min',
      miners: [
        { id: '10', name: 'Pedro M.', avatar: 'PM', status: 'offline' },
        { id: '11', name: 'Carmen F.', avatar: 'CF', status: 'offline' },
        { id: '12', name: 'Jorge A.', avatar: 'JA', status: 'offline' }
      ]
    },
    {
      id: '5',
      name: 'Equipo Mina Central',
      totalHelmets: 41,
      activeHelmets: 39,
      status: 'active',
      alerts: 1,
      location: 'Zona E-7',
      lastUpdate: '3 min',
      miners: [
        { id: '13', name: 'Isabel C.', avatar: 'IC', status: 'online' },
        { id: '14', name: 'Fernando R.', avatar: 'FR', status: 'online' },
        { id: '15', name: 'Patricia M.', avatar: 'PM', status: 'alert' }
      ]
    },
    {
      id: '6',
      name: 'Equipo Mina Profunda',
      totalHelmets: 33,
      activeHelmets: 30,
      status: 'active',
      alerts: 3,
      location: 'Zona F-22',
      lastUpdate: '4 min',
      miners: [
        { id: '16', name: 'Ricardo B.', avatar: 'RB', status: 'online' },
        { id: '17', name: 'Lucía N.', avatar: 'LN', status: 'alert' },
        { id: '18', name: 'Alberto K.', avatar: 'AK', status: 'online' }
      ]
    }
  ];

  userProfile: UserProfile = {
    id: '1',
    name: 'Carlos Mendoza',
    email: 'carlos.mendoza@helmmining.com',
    role: 'Supervisor',
    avatar: 'CM',
    department: 'Seguridad Industrial'
  };

  activeSidebarItem = 'dashboard';
  showProfileDropdown = false;
  showPasswordModal = false;
  passwordData = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  constructor(private router: Router) {
    this.setActiveSidebarItemFromRoute();
  }

  setActiveSidebarItemFromRoute() {
    const currentPath = this.router.url;
    if (currentPath.includes('/equipments')) {
      this.activeSidebarItem = 'equipments';
    } else if (currentPath.includes('/helmets')) {
      this.activeSidebarItem = 'helmets';
    } else if (currentPath.includes('/alerts')) {
      this.activeSidebarItem = 'alerts';
    } else if (currentPath.includes('/reports')) {
      this.activeSidebarItem = 'reports';
    } else if (currentPath.includes('/settings')) {
      this.activeSidebarItem = 'settings';
    } else if (currentPath.includes('/profile')) {
      this.activeSidebarItem = 'profile';
    } else {
      this.activeSidebarItem = 'dashboard';
    }
  }

  setActiveSidebarItem(item: string) {
    this.activeSidebarItem = item;
    switch (item) {
      case 'dashboard':
        this.router.navigate(['/dashboard']);
        break;
      case 'equipments':
        this.router.navigate(['/equipments']);
        break;
      case 'helmets':
        this.router.navigate(['/helmets']);
        break;
      case 'alerts':
        this.router.navigate(['/alerts']);
        break;
      case 'reports':
        this.router.navigate(['/reports']);
        break;
      case 'settings':
        this.router.navigate(['/settings']);
        break;
    }
  }

  toggleProfileDropdown() {
    this.showProfileDropdown = !this.showProfileDropdown;
  }

  goToProfile() {
    this.showProfileDropdown = false;
    this.router.navigate(['/profile']);
  }

  changePassword() {
    this.showProfileDropdown = false;
    this.showPasswordModal = true;
  }

  closePasswordModal() {
    this.showPasswordModal = false;
    this.passwordData = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
  }

  updatePassword() {
    if (this.passwordData.newPassword !== this.passwordData.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }
    
    // Implementar actualización de contraseña
    console.log('Actualizando contraseña:', this.passwordData);
    this.closePasswordModal();
  }

  getTotalStats() {
    return {
      totalEquipments: this.equipments.length,
      totalHelmets: this.equipments.reduce((sum, eq) => sum + eq.totalHelmets, 0),
      activeHelmets: this.equipments.reduce((sum, eq) => sum + eq.activeHelmets, 0),
      totalAlerts: this.equipments.reduce((sum, eq) => sum + eq.alerts, 0)
    };
  }

  logout() {
    this.showProfileDropdown = false;
    // Implementar logout
    this.router.navigate(['/']);
  }
} 