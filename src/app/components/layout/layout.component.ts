import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, User } from '../../services/auth.service';

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
      <aside class="sidebar" [class.open]="sidebarOpen">
        <div class="sidebar-header">
          <div class="logo">
            <h2>Helm</h2>
          </div>
          <button class="close-btn" (click)="toggleSidebar()">
            <i class="fas fa-bars"></i>
          </button>
        </div>
        
        <nav class="sidebar-nav">
          <ul class="nav-list">
            <li class="nav-item" [class.active]="activeSidebarItem === 'dashboard'">
              <a (click)="setActiveSidebarItem('dashboard')">
                <i class="fas fa-tachometer-alt"></i>
                <span>{{ authService.isMinero() ? 'Mi Dashboard' : 'Dashboard' }}</span>
              </a>
            </li>
            
            <!-- Opciones para Admin -->
            <li class="nav-item" 
                [class.active]="activeSidebarItem === 'supervisors'"
                *ngIf="authService.isAdmin()">
              <a (click)="setActiveSidebarItem('supervisors')">
                <i class="fas fa-user-tie"></i>
                <span>Supervisores</span>
              </a>
            </li>
            
            <!-- Opciones para Supervisor y Admin -->
            <li class="nav-item" 
                [class.active]="activeSidebarItem === 'equipments'"
                *ngIf="authService.canViewAllEquipments()">
              <a (click)="setActiveSidebarItem('equipments')">
                <i class="fas fa-hard-hat"></i>
                <span>{{ authService.isMinero() ? 'Mi Equipo' : 'Equipos' }}</span>
              </a>
            </li>
            
            <!-- Opciones para Admin -->
            <li class="nav-item" 
                [class.active]="activeSidebarItem === 'helmets'"
                *ngIf="authService.canCreateHelmet()">
              <a (click)="setActiveSidebarItem('helmets')">
                <i class="fas fa-shield-alt"></i>
                <span>Cascos</span>
              </a>
            </li>
            
            <!-- Opciones para Supervisor y Admin -->
            <li class="nav-item" 
                [class.active]="activeSidebarItem === 'miners'"
                *ngIf="authService.canViewAllMiners()">
              <a (click)="setActiveSidebarItem('miners')">
                <i class="fas fa-users"></i>
                <span>Mineros</span>
              </a>
            </li>
            
            <!-- Opciones para Supervisor, Minero y Admin -->
            <li class="nav-item" 
                [class.active]="activeSidebarItem === 'monitoring'">
              <a (click)="setActiveSidebarItem('monitoring')">
                <i class="fas fa-chart-line"></i>
                <span>{{ authService.isMinero() ? 'Mi Casco' : 'Monitoreo' }}</span>
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
            
          </ul>
        </nav>
        
        <div class="sidebar-footer">
          <div class="user-profile" (click)="toggleProfileDropdown()">
            <div class="user-avatar">
              <span>{{ userProfile.avatar }}</span>
            </div>
            <div class="user-info">
              <span class="user-name">{{ userProfile.fullName }}</span>
              <span class="user-role">{{ getRoleDisplayName(userProfile.role) }}</span>
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
      <main class="main-content" [class.sidebar-closed]="!sidebarOpen">
        <!-- Hamburger Menu Button -->
        <button class="hamburger-btn" *ngIf="!sidebarOpen" (click)="openSidebar()">
          <i class="fas fa-bars"></i>
        </button>
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
export class LayoutComponent implements OnInit {
  equipments: Equipment[] = [
    {
      id: '1',
      name: 'Equipo Mina Norte',
      totalHelmets: 45,
      activeHelmets: 42,
      status: 'active',
      alerts: 2,
      location: 'Zona A-12',
      miners: [
        { id: '1', name: 'Carlos Mendoza', avatar: 'CM', status: 'online' },
        { id: '2', name: 'Ana Rodríguez', avatar: 'AR', status: 'online' },
        { id: '3', name: 'Miguel Torres', avatar: 'MT', status: 'alert' }
      ],
      lastUpdate: '2 min'
    },
    {
      id: '2',
      name: 'Equipo Mina Sur',
      totalHelmets: 38,
      activeHelmets: 35,
      status: 'active',
      alerts: 1,
      location: 'Zona B-8',
      miners: [
        { id: '4', name: 'Luis Pérez', avatar: 'LP', status: 'online' },
        { id: '5', name: 'María González', avatar: 'MG', status: 'offline' },
        { id: '6', name: 'Roberto Silva', avatar: 'RS', status: 'online' }
      ],
      lastUpdate: '5 min'
    },
    {
      id: '3',
      name: 'Equipo Mina Este',
      totalHelmets: 32,
      activeHelmets: 28,
      status: 'warning',
      alerts: 3,
      location: 'Zona C-15',
      miners: [
        { id: '7', name: 'Patricia López', avatar: 'PL', status: 'alert' },
        { id: '8', name: 'Fernando Ruiz', avatar: 'FR', status: 'online' }
      ],
      lastUpdate: '1 min'
    }
  ];

  userProfile: User = {
    id: '',
    fullName: '',
    email: '',
    role: 'minero',
    avatar: ''
  };

  activeSidebarItem = 'dashboard';
  showProfileDropdown = false;
  showPasswordModal = false;
  sidebarOpen = true;
  passwordData = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  constructor(
    private router: Router,
    public authService: AuthService
  ) {}

  ngOnInit() {
    console.log('Layout: ngOnInit iniciado');
    this.loadUserProfile();
    this.setActiveSidebarItemFromRoute();
    console.log('Layout: Componente inicializado correctamente');
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar() {
    this.sidebarOpen = false;
  }

  openSidebar() {
    this.sidebarOpen = true;
  }

  loadUserProfile() {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.userProfile = currentUser;
    }
  }

  setActiveSidebarItemFromRoute() {
    const currentRoute = this.router.url;
    if (currentRoute.includes('/dashboard')) {
      this.activeSidebarItem = 'dashboard';
    } else if (currentRoute.includes('/supervisors')) {
      this.activeSidebarItem = 'supervisors';
    } else if (currentRoute.includes('/equipments')) {
      this.activeSidebarItem = 'equipments';
    } else if (currentRoute.includes('/helmets')) {
      this.activeSidebarItem = 'helmets';
    } else if (currentRoute.includes('/miners')) {
      this.activeSidebarItem = 'miners';
    } else if (currentRoute.includes('/monitoring')) {
      this.activeSidebarItem = 'monitoring';
    } else if (currentRoute.includes('/alerts')) {
      this.activeSidebarItem = 'alerts';
    } else if (currentRoute.includes('/reports')) {
      this.activeSidebarItem = 'reports';
    } else if (currentRoute.includes('/profile')) {
      this.activeSidebarItem = 'profile';
    }
  }

  setActiveSidebarItem(item: string) {
    this.activeSidebarItem = item;
    
    // Navegar a la ruta correspondiente
    switch (item) {
      case 'dashboard':
        this.router.navigate(['/dashboard']);
        break;
      case 'supervisors':
        this.router.navigate(['/supervisors']);
        break;
      case 'equipments':
        this.router.navigate(['/equipments']);
        break;
      case 'helmets':
        this.router.navigate(['/helmets']);
        break;
      case 'miners':
        this.router.navigate(['/miners']);
        break;
      case 'monitoring':
        this.router.navigate(['/monitoring']);
        break;
      case 'alerts':
        this.router.navigate(['/alerts']);
        break;
      case 'reports':
        this.router.navigate(['/reports']);
        break;
      case 'profile':
        this.router.navigate(['/profile']);
        break;
    }
  }

  toggleProfileDropdown() {
    this.showProfileDropdown = !this.showProfileDropdown;
  }

  goToProfile() {
    this.router.navigate(['/profile']);
    this.showProfileDropdown = false;
  }

  changePassword() {
    this.showPasswordModal = true;
    this.showProfileDropdown = false;
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
    // Implementar lógica de cambio de contraseña
    console.log('Cambiando contraseña:', this.passwordData);
    this.closePasswordModal();
  }

  getTotalStats() {
    const totalAlerts = this.equipments.reduce((sum, eq) => sum + eq.alerts, 0);
    return { totalAlerts };
  }

  getRoleDisplayName(role: string): string {
    switch (role) {
      case 'supervisor': return 'Supervisor';
      case 'minero': return 'Minero';
      case 'admin': return 'Administrador';
      default: return role;
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
} 