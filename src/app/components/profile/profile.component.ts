import { Component, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, User } from '../../services/auth.service';
import { AlertService } from '../../services/alert.service';
import { ToastService } from '../../services/toast.service';

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
          <div class="header-right">
        </div>
      </div>
    </header>

    <!-- Profile Content -->
    <div class="profile-container">
      <!-- Profile Card -->
      <div class="profile-card glass">
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
      <div class="profile-grid">
        <!-- Personal Information -->
        <div class="profile-section glass">
          <div class="section-header">
            <h3><i class="fas fa-user"></i> Información Personal</h3>
          </div>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Nombre Completo</span>
              <span class="info-value" *ngIf="!isEditing">{{ userProfile.name }}</span>
              <input class="edit-input" *ngIf="isEditing" [value]="userProfile.name" #nameInput (input)="onNameChange(nameInput.value)" placeholder="Nombre" />
            </div>
            <div class="info-item">
              <span class="info-label">Correo Electrónico</span>
              <span class="info-value" *ngIf="!isEditing">{{ userProfile.email }}</span>
              <input class="edit-input" *ngIf="isEditing" [value]="userProfile.email" #emailInput (input)="onEmailChange(emailInput.value)" placeholder="Email" />
            </div>
            <div class="info-item">
              <span class="info-label">Teléfono</span>
              <span class="info-value" *ngIf="!isEditing">{{ userProfile.phone }}</span>
              <input class="edit-input" *ngIf="isEditing" [value]="userProfile.phone" #phoneInput (input)="onPhoneChange(phoneInput.value)" placeholder="Teléfono" />
            </div>
          </div>
        </div>

        
      </div>
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
  isUpdatingPassword = false;
  passwordError = '';

  isEditing = false;
  get canEdit() { return !this.auth.isAdmin(); }

  constructor(
    private router: Router, 
    private auth: AuthService, 
    private alert: AlertService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) {
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
        this.alert.success('Perfil actualizado');
      },
      error: (e) => this.alert.error(e.message || 'Error al actualizar perfil'),
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
    
    this.auth.changePassword(
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

  updatePreference(preference: string) {
    // Implementar actualización de preferencias
    console.log('Actualizando preferencia:', preference, this.userProfile.preferences[preference as keyof typeof this.userProfile.preferences]);
  }

  togglePreference(key: 'notifications' | 'emailAlerts' | 'darkMode', checked: boolean) {
    this.userProfile.preferences = {
      ...this.userProfile.preferences,
      [key]: checked,
    } as any;
    this.updatePreference(key);
  }

  setLanguage(lang: string) {
    this.userProfile.preferences = {
      ...this.userProfile.preferences,
      language: lang,
    };
    this.updatePreference('language');
  }

  onNameChange(value: string) { this.userProfile.name = value; }
  onEmailChange(value: string) { this.userProfile.email = value; }
  onPhoneChange(value: string) { this.userProfile.phone = value; }


  logout() {
    // Implementar logout
    this.router.navigate(['/']);
  }
} 