import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, User } from '../../services/auth.service';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  department: string;
  phone: string;
  location: string;
  lastLogin: string;
  permissions: string[];
  preferences: {
    notifications: boolean;
    emailAlerts: boolean;
    darkMode: boolean;
    language: string;
  };
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Header -->
    <header class="page-header">
      <div class="header-content">
        <div class="header-left">
          <h1>Mi Perfil</h1>
          <p>Información personal</p>
        </div>
          <div class="header-right" *ngIf="false">
            <button class="btn btn-primary" *ngIf="canEdit" (click)="editProfile()">
            <i class="fas fa-edit"></i>
            Editar Perfil
          </button>
        </div>
      </div>
    </header>

    <!-- Profile Content -->
    <div class="profile-container">
      <!-- Profile Card -->
      <div class="profile-card glass" *ngIf="false">
        <div class="profile-header">
          <div class="profile-avatar">
            <div class="avatar-circle">
              <span>{{ userProfile.avatar }}</span>
            </div>
            <div class="status-indicator online"></div>
          </div>
          <div class="profile-info">
            <h2>{{ userProfile.name }}</h2>
            <p class="user-role">{{ userProfile.role }}</p>
          </div>
          <div class="profile-actions">
            <button class="btn btn-secondary" (click)="changePassword()">
              <i class="fas fa-key"></i>
              Cambiar Contraseña
            </button>
            <button class="btn btn-primary" *ngIf="isEditing && canEdit" (click)="saveProfile()">
              <i class="fas fa-save"></i>
              Guardar
            </button>
            <button class="btn" *ngIf="isEditing && canEdit" (click)="isEditing = false">
              Cancelar
            </button>
            <button class="btn btn-danger" (click)="logout()">
              <i class="fas fa-sign-out-alt"></i>
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

      <!-- Profile Details Grid -->
      <div class="profile-grid" *ngIf="false">
        <!-- Personal Information -->
        <div class="profile-section glass">
          <div class="section-header">
            <h3><i class="fas fa-user"></i> Información Personal</h3>
          </div>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Nombre Completo</span>
              <span class="info-value" *ngIf="!isEditing">{{ userProfile.name }}</span>
              <input class="edit-input" *ngIf="isEditing" [(ngModel)]="userProfile.name" placeholder="Nombre" />
            </div>
            <div class="info-item">
              <span class="info-label">Correo Electrónico</span>
              <span class="info-value" *ngIf="!isEditing">{{ userProfile.email }}</span>
              <input class="edit-input" *ngIf="isEditing" [(ngModel)]="userProfile.email" placeholder="Email" />
            </div>
            <div class="info-item">
              <span class="info-label">Teléfono</span>
              <span class="info-value" *ngIf="!isEditing">{{ userProfile.phone }}</span>
              <input class="edit-input" *ngIf="isEditing" [(ngModel)]="userProfile.phone" placeholder="Teléfono" />
            </div>
          </div>
        </div>

        <!-- Permissions -->
        <div class="profile-section glass">
          <div class="section-header">
            <h3><i class="fas fa-shield-alt"></i> Permisos y Roles</h3>
          </div>
          <div class="permissions-list">
            <div class="permission-item" *ngFor="let permission of userProfile.permissions">
              <i class="fas fa-check-circle"></i>
              <span>{{ permission }}</span>
            </div>
          </div>
        </div>

        <!-- Preferences -->
        <div class="profile-section glass">
          <div class="section-header">
            <h3><i class="fas fa-cog"></i> Preferencias</h3>
          </div>
          <div class="preferences-list">
            <div class="preference-item">
              <div class="preference-info">
                <span class="preference-label">Notificaciones Push</span>
                <span class="preference-description">Recibir notificaciones en tiempo real</span>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" 
                       [(ngModel)]="userProfile.preferences.notifications"
                       (change)="updatePreference('notifications')">
                <span class="slider"></span>
              </label>
            </div>
            
            <div class="preference-item">
              <div class="preference-info">
                <span class="preference-label">Alertas por Email</span>
                <span class="preference-description">Recibir alertas críticas por correo</span>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" 
                       [(ngModel)]="userProfile.preferences.emailAlerts"
                       (change)="updatePreference('emailAlerts')">
                <span class="slider"></span>
              </label>
            </div>
            
            <div class="preference-item">
              <div class="preference-info">
                <span class="preference-label">Modo Oscuro</span>
                <span class="preference-description">Usar tema oscuro en la interfaz</span>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" 
                       [(ngModel)]="userProfile.preferences.darkMode"
                       (change)="updatePreference('darkMode')">
                <span class="slider"></span>
              </label>
            </div>
            
            <div class="preference-item">
              <div class="preference-info">
                <span class="preference-label">Idioma</span>
                <span class="preference-description">Idioma de la interfaz</span>
              </div>
              <select [(ngModel)]="userProfile.preferences.language" 
                      (change)="updatePreference('language')"
                      class="language-select">
                <option value="es">Español</option>
                <option value="en">English</option>
                <option value="pt">Português</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Activity Stats -->
        <div class="profile-section glass">
          <div class="section-header">
            <h3><i class="fas fa-chart-line"></i> Estadísticas de Actividad</h3>
          </div>
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-icon">
                <i class="fas fa-clock"></i>
              </div>
              <div class="stat-content">
                <h4>Horas Activo</h4>
                <span class="stat-value">156 hrs</span>
                <span class="stat-period">Este mes</span>
              </div>
            </div>
            
            <div class="stat-item">
              <div class="stat-icon">
                <i class="fas fa-eye"></i>
              </div>
              <div class="stat-content">
                <h4>Equipos Monitoreados</h4>
                <span class="stat-value">24</span>
                <span class="stat-period">Actualmente</span>
              </div>
            </div>
            
            <div class="stat-item">
              <div class="stat-icon">
                <i class="fas fa-bell"></i>
              </div>
              <div class="stat-content">
                <h4>Alertas Revisadas</h4>
                <span class="stat-value">89</span>
                <span class="stat-period">Este mes</span>
              </div>
            </div>
            
            <div class="stat-item">
              <div class="stat-icon">
                <i class="fas fa-file-alt"></i>
              </div>
              <div class="stat-content">
                <h4>Reportes Generados</h4>
                <span class="stat-value">12</span>
                <span class="stat-period">Este mes</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Change Password Modal -->
    <div class="modal-overlay" *ngIf="false && showPasswordModal" (click)="closePasswordModal()">
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
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent {
  userProfile: UserProfile = {
    id: '',
    name: '',
    email: '',
    role: '',
    avatar: '',
    department: '',
    phone: '',
    location: '',
    lastLogin: '',
    permissions: [],
    preferences: {
      notifications: true,
      emailAlerts: true,
      darkMode: false,
      language: 'es'
    }
  };

  showPasswordModal = false;
  passwordData = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  isEditing = false;
  get canEdit() { return !this.auth.isAdmin(); }

  constructor(private router: Router, private auth: AuthService) {
    this.loadProfile();
  }

  private mapUserToProfile(user: User) {
    const initials = (user.fullName || '')
      .split(' ')
      .map((p) => p[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
    this.userProfile = {
      id: user.id,
      name: user.fullName,
      email: user.email,
      role: user.role,
      avatar: initials || 'U',
      department: user.department || '',
      phone: (user as any).phone || '',
      location: '',
      lastLogin: '',
      permissions: [],
      preferences: this.userProfile.preferences,
    };
  }

  loadProfile() {
    const cached = this.auth.getCurrentUser();
    if (cached) {
      this.mapUserToProfile(cached);
    }
    this.auth.getProfile().subscribe({
      next: (user) => this.mapUserToProfile(user),
      error: () => {}
    });
  }

  editProfile() {
    if (!this.canEdit) return;
    this.isEditing = true;
  }

  saveProfile() {
    const payload = {
      fullName: this.userProfile.name,
      email: this.userProfile.email,
      phone: this.userProfile.phone,
      // Opcionales: rfc/address si agregas campos al UI
    };
    this.auth.updateProfile(payload).subscribe({
      next: (user) => {
        this.mapUserToProfile(user);
        this.isEditing = false;
        alert('Perfil actualizado');
      },
      error: (e) => alert(e.message || 'Error al actualizar perfil'),
    });
  }

  changePassword() {
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

  updatePreference(preference: string) {
    // Implementar actualización de preferencias
    console.log('Actualizando preferencia:', preference, this.userProfile.preferences[preference as keyof typeof this.userProfile.preferences]);
  }

  logout() {
    // Implementar logout
    this.router.navigate(['/']);
  }
} 