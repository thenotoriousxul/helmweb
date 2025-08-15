import { Component, OnInit, ChangeDetectorRef, HostListener } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, User } from '../../services/auth.service';
import { ToastContainerComponent } from '../toast/toast.component';
import { ToastService } from '../../services/toast.service';

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
  imports: [CommonModule, FormsModule, RouterOutlet, ToastContainerComponent],
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
            <!-- Opciones para Admin -->
            <li class="nav-item" 
                [class.active]="activeSidebarItem === 'supervisors'"
                *ngIf="authService.isAdmin()">
              <a (click)="setActiveSidebarItem('supervisors')">
                <i class="fas fa-user-tie"></i>
                <span>Supervisores</span>
              </a>
            </li>
            <!-- Solo Minero: Mi Casco -->
            <li class="nav-item" 
                *ngIf="authService.isMinero()"
                [class.active]="activeSidebarItem === 'my-helmet'">
              <a (click)="setActiveSidebarItem('my-helmet')">
                <i class="fas fa-hard-hat"></i>
                <span>Mi Casco</span>
              </a>
            </li>
            <!-- Opciones para Supervisor y Admin -->
            <li class="nav-item" 
                [class.active]="activeSidebarItem === 'equipments'"
                *ngIf="authService.canViewAllEquipments()">
              <a (click)="setActiveSidebarItem('equipments')">
              <i class="fas fa-shield-alt"></i>
                <span>{{ authService.isMinero() ? 'Mi Equipo' : 'Equipos' }}</span>
              </a>
            </li>
            
            <!-- Cascos: visible para Admin y Supervisor -->
            <li class="nav-item" 
                [class.active]="activeSidebarItem === 'helmets'"
                *ngIf="authService.canViewHelmets()">
              <a (click)="setActiveSidebarItem('helmets')">
                <i class="fas fa-hard-hat"></i>
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
        <button class="hamburger-btn" (click)="toggleSidebar()">
          <i class="fas" [class.fa-bars]="!sidebarOpen" [class.fa-times]="sidebarOpen"></i>
        </button>
        <router-outlet></router-outlet>
        <app-toast-container></app-toast-container>
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
          <form (ngSubmit)="updatePassword()" #passwordForm="ngForm">
            <div class="form-group">
              <label for="currentPassword">Contraseña Actual</label>
              <input 
                type="password" 
                id="currentPassword"
                [(ngModel)]="passwordData.currentPassword" 
                name="currentPassword"
                placeholder="Ingresa tu contraseña actual"
                autocomplete="current-password"
                [disabled]="isUpdatingPassword"
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
                placeholder="Ingresa la nueva contraseña (mín. 8 caracteres)"
                autocomplete="new-password"
                [disabled]="isUpdatingPassword"
                minlength="8"
                required
              >
              <div class="password-requirements">
                <small>La contraseña debe tener al menos 8 caracteres</small>
              </div>
            </div>
            
            <div class="form-group">
              <label for="confirmPassword">Confirmar Contraseña</label>
              <input 
                type="password" 
                id="confirmPassword"
                [(ngModel)]="passwordData.confirmPassword" 
                name="confirmPassword"
                placeholder="Confirma la nueva contraseña"
                autocomplete="new-password"
                [disabled]="isUpdatingPassword"
                required
              >
            </div>
            
            <div class="error-message" *ngIf="passwordError">
              <i class="fas fa-exclamation-triangle"></i>
              {{ passwordError }}
            </div>
            
            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" (click)="closePasswordModal()" [disabled]="isUpdatingPassword">
                Cancelar
              </button>
              <button type="submit" class="btn btn-primary" [disabled]="isUpdatingPassword || !passwordForm.valid">
                <i class="fas fa-spinner fa-spin" *ngIf="isUpdatingPassword"></i>
                <i class="fas fa-save" *ngIf="!isUpdatingPassword"></i>
                {{ isUpdatingPassword ? 'Actualizando...' : 'Actualizar Contraseña' }}
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

  activeSidebarItem = ''; // Will be set based on user role
  showProfileDropdown = false;
  showPasswordModal = false;
  sidebarOpen = window.innerWidth > 1024;
  passwordData = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };
  isUpdatingPassword = false;
  passwordError = '';

  constructor(
    private router: Router,
    public authService: AuthService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    console.log('Layout: ngOnInit iniciado');
    this.loadUserProfile();
    this.setActiveSidebarItemFromRoute();
    this.setDefaultActiveSidebarItem();
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

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    // En pantallas grandes, mantener el sidebar abierto por defecto
    // En pantallas pequeñas, cerrarlo por defecto
    if (event.target.innerWidth > 1024) {
      this.sidebarOpen = true;
    }
  }

  setDefaultActiveSidebarItem() {
    // Solo establecer el item por defecto si no hay uno activo
    if (!this.activeSidebarItem) {
      if (this.authService.isMinero()) {
        this.activeSidebarItem = 'my-helmet';
      } else if (this.authService.canViewAllEquipments()) {
        this.activeSidebarItem = 'equipments';
      } else if (this.authService.isAdmin()) {
        this.activeSidebarItem = 'supervisors';
      }
    }
  }

  loadUserProfile() {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.userProfile = currentUser;
    }
  }

  setActiveSidebarItemFromRoute() {
    const currentRoute = this.router.url;
    if (currentRoute.includes('/supervisors')) {
      this.activeSidebarItem = 'supervisors';
    } else if (currentRoute.includes('/equipments')) {
      this.activeSidebarItem = 'equipments';
    } else if (currentRoute.includes('/helmets')) {
      this.activeSidebarItem = 'helmets';
    } else if (currentRoute.includes('/miners')) {
      this.activeSidebarItem = 'miners';
    } else if (currentRoute.includes('/my-helmet')) {
      this.activeSidebarItem = 'my-helmet';
    } else if (currentRoute.includes('/alerts')) {
      this.activeSidebarItem = 'alerts';
    } else if (currentRoute.includes('/reports')) {
      this.activeSidebarItem = 'reports';
    } else if (currentRoute.includes('/profile')) {
      this.activeSidebarItem = 'profile';
    } else {
      // Default redirect to equipments if no specific route is active
      this.router.navigate(['/equipments']);
    }
  }

  setActiveSidebarItem(item: string) {
    // Solo navegar si no estamos ya en esa ruta
    const currentRoute = this.router.url;
    const targetRoute = '/' + item;
    
    if (currentRoute !== targetRoute) {
      this.activeSidebarItem = item;
      this.router.navigate([targetRoute]);
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
    this.passwordError = '';
    this.isUpdatingPassword = false;
  }

  updatePassword() {
    // Limpiar errores previos
    this.passwordError = '';
    
    // Validaciones del lado del cliente
    if (!this.passwordData.currentPassword) {
      this.passwordError = 'La contraseña actual es requerida';
      return;
    }
    
    if (!this.passwordData.newPassword) {
      this.passwordError = 'La nueva contraseña es requerida';
      return;
    }
    
    if (this.passwordData.newPassword.length < 8) {
      this.passwordError = 'La nueva contraseña debe tener al menos 8 caracteres';
      return;
    }
    
    if (this.passwordData.newPassword !== this.passwordData.confirmPassword) {
      this.passwordError = 'Las contraseñas no coinciden';
      return;
    }
    
    if (this.passwordData.currentPassword === this.passwordData.newPassword) {
      this.passwordError = 'La nueva contraseña debe ser diferente a la actual';
      return;
    }
    
    // Realizar el cambio de contraseña
    this.isUpdatingPassword = true;
    
    this.authService.changePassword(
      this.passwordData.currentPassword,
      this.passwordData.newPassword
    ).subscribe({
      next: (response) => {
        console.log('Password change success:', response);
        this.isUpdatingPassword = false;
        this.cdr.detectChanges(); // Forzar detección de cambios
        this.toastService.success('Contraseña actualizada exitosamente');
        
        // Delay para que el usuario vea el toast antes de cerrar el modal
        setTimeout(() => {
          this.closePasswordModal();
        }, 1500);
      },
      error: (error) => {
        console.error('Password change error:', error);
        this.passwordError = error.message;
        this.isUpdatingPassword = false;
      }
    });
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