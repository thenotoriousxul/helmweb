import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

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

interface SensorData {
  timestamp: string;
  temperature: number;
  humidity: number;
  pressure: number;
  movement: number;
  battery: number;
}

interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  timestamp: string;
  miner?: string;
  resolved: boolean;
}

interface MinerDetail {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'offline' | 'alert';
  temperature: number;
  battery: number;
  location: string;
  lastActivity: string;
  alerts: number;
  heartRate: number;
  oxygenLevel: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'supervisor' | 'operator';
  status: 'active' | 'inactive';
  lastLogin: string;
  avatar: string;
  permissions: string[];
}

interface AlertRule {
  id: string;
  name: string;
  type: 'temperature' | 'battery' | 'movement' | 'heart_rate' | 'oxygen';
  condition: 'above' | 'below' | 'equals';
  value: number;
  enabled: boolean;
  notification: 'email' | 'sms' | 'push' | 'all';
}

interface SystemConfig {
  companyName: string;
  timezone: string;
  language: string;
  dateFormat: string;
  temperatureUnit: 'celsius' | 'fahrenheit';
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  autoBackup: boolean;
  dataRetention: number;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
  imports: [ReactiveFormsModule, FormsModule, CommonModule]
})
export class App {
  title = 'helm';
  isLoginView = false;
  isRegisterView = false;
  isDashboardView = false;
  isDetailView = false;
  isSettingsView = false;
  loginForm: FormGroup;
  registerForm: FormGroup;
  settingsForm: FormGroup;
  loginError = '';
  registerError = '';

  // Dashboard data
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

  filteredEquipments: Equipment[] = [];
  searchTerm = '';
  statusFilter = 'all';
  activeSidebarItem = 'dashboard';

  // Detail View Data
  selectedEquipment: Equipment | null = null;
  sensorData: SensorData[] = [];
  alerts: Alert[] = [];
  minersDetail: MinerDetail[] = [];
  selectedTimeRange = '24h';
  selectedMiner: string | null = null;

  // Settings Data
  users: User[] = [];
  alertRules: AlertRule[] = [];
  systemConfig: SystemConfig = {
    companyName: 'HelmIoT Mining Corp',
    timezone: 'America/Mexico_City',
    language: 'es',
    dateFormat: 'DD/MM/YYYY',
    temperatureUnit: 'celsius',
    notifications: {
      email: true,
      sms: false,
      push: true
    },
    autoBackup: true,
    dataRetention: 90
  };
  activeSettingsTab = 'general';
  showAddUserModal = false;
  showAddRuleModal = false;
  newUserForm: FormGroup;
  newRuleForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });

    this.settingsForm = this.fb.group({
      companyName: ['HelmIoT Mining Corp'],
      timezone: ['America/Mexico_City'],
      language: ['es'],
      dateFormat: ['DD/MM/YYYY'],
      temperatureUnit: ['celsius'],
      emailNotifications: [true],
      smsNotifications: [false],
      pushNotifications: [true],
      autoBackup: [true],
      dataRetention: [90]
    });

    this.newUserForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      role: ['operator', [Validators.required]]
    });

    this.newRuleForm = this.fb.group({
      name: ['', [Validators.required]],
      type: ['temperature', [Validators.required]],
      condition: ['above', [Validators.required]],
      value: ['', [Validators.required, Validators.min(0)]],
      notification: ['email', [Validators.required]]
    });

    this.filteredEquipments = [...this.equipments];
    this.initializeDetailData();
    this.initializeSettingsData();
  }

  initializeSettingsData() {
    // Simular usuarios
    this.users = [
      {
        id: '1',
        name: 'Admin Principal',
        email: 'admin@helmiot.com',
        role: 'admin',
        status: 'active',
        lastLogin: 'Hace 2 horas',
        avatar: 'AP',
        permissions: ['all']
      },
      {
        id: '2',
        name: 'Carlos Mendoza',
        email: 'carlos.m@helmiot.com',
        role: 'supervisor',
        status: 'active',
        lastLogin: 'Hace 30 min',
        avatar: 'CM',
        permissions: ['dashboard', 'equipments', 'alerts', 'reports']
      },
      {
        id: '3',
        name: 'Ana Rodríguez',
        email: 'ana.r@helmiot.com',
        role: 'supervisor',
        status: 'active',
        lastLogin: 'Hace 1 hora',
        avatar: 'AR',
        permissions: ['dashboard', 'equipments', 'alerts']
      },
      {
        id: '4',
        name: 'Luis Pérez',
        email: 'luis.p@helmiot.com',
        role: 'operator',
        status: 'active',
        lastLogin: 'Hace 15 min',
        avatar: 'LP',
        permissions: ['dashboard', 'equipments']
      },
      {
        id: '5',
        name: 'María García',
        email: 'maria.g@helmiot.com',
        role: 'operator',
        status: 'inactive',
        lastLogin: 'Hace 2 días',
        avatar: 'MG',
        permissions: ['dashboard']
      }
    ];

    // Simular reglas de alerta
    this.alertRules = [
      {
        id: '1',
        name: 'Temperatura Crítica',
        type: 'temperature',
        condition: 'above',
        value: 38,
        enabled: true,
        notification: 'all'
      },
      {
        id: '2',
        name: 'Batería Baja',
        type: 'battery',
        condition: 'below',
        value: 20,
        enabled: true,
        notification: 'email'
      },
      {
        id: '3',
        name: 'Sin Movimiento',
        type: 'movement',
        condition: 'equals',
        value: 0,
        enabled: true,
        notification: 'push'
      },
      {
        id: '4',
        name: 'Ritmo Cardíaco Alto',
        type: 'heart_rate',
        condition: 'above',
        value: 100,
        enabled: false,
        notification: 'sms'
      },
      {
        id: '5',
        name: 'Nivel de Oxígeno Bajo',
        type: 'oxygen',
        condition: 'below',
        value: 95,
        enabled: true,
        notification: 'all'
      }
    ];
  }

  initializeDetailData() {
    // Simular datos de sensores para las últimas 24 horas
    const now = new Date();
    this.sensorData = Array.from({ length: 24 }, (_, i) => {
      const time = new Date(now.getTime() - (23 - i) * 60 * 60 * 1000);
      return {
        timestamp: time.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        temperature: 35 + Math.random() * 5 + Math.sin(i / 3) * 2,
        humidity: 40 + Math.random() * 20 + Math.cos(i / 4) * 5,
        pressure: 1013 + Math.random() * 10 + Math.sin(i / 2) * 3,
        movement: Math.random() * 100,
        battery: 85 - (i * 0.5) + Math.random() * 5
      };
    });

    // Simular alertas
    this.alerts = [
      {
        id: '1',
        type: 'critical',
        title: 'Temperatura Elevada',
        description: 'Miguel T. registra temperatura de 39.2°C',
        timestamp: '2 min',
        miner: 'Miguel T.',
        resolved: false
      },
      {
        id: '2',
        type: 'warning',
        title: 'Batería Baja',
        description: 'Ana R. tiene 15% de batería restante',
        timestamp: '5 min',
        miner: 'Ana R.',
        resolved: false
      },
      {
        id: '3',
        type: 'info',
        title: 'Mineros en Zona',
        description: '3 mineros activos en Zona A-12',
        timestamp: '10 min',
        resolved: true
      }
    ];

    // Simular datos detallados de mineros
    this.minersDetail = [
      {
        id: '1',
        name: 'Carlos M.',
        avatar: 'CM',
        status: 'online',
        temperature: 36.8,
        battery: 87,
        location: 'Zona A-12, Nivel 3',
        lastActivity: '1 min',
        alerts: 0,
        heartRate: 72,
        oxygenLevel: 98
      },
      {
        id: '2',
        name: 'Ana R.',
        avatar: 'AR',
        status: 'online',
        temperature: 37.1,
        battery: 15,
        location: 'Zona A-12, Nivel 2',
        lastActivity: '30 seg',
        alerts: 1,
        heartRate: 68,
        oxygenLevel: 97
      },
      {
        id: '3',
        name: 'Miguel T.',
        avatar: 'MT',
        status: 'alert',
        temperature: 39.2,
        battery: 45,
        location: 'Zona A-12, Nivel 1',
        lastActivity: '2 min',
        alerts: 2,
        heartRate: 95,
        oxygenLevel: 92
      }
    ];
  }

  passwordMatchValidator(control: AbstractControl) {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      if (confirmPassword) {
        confirmPassword.setErrors(null);
      }
      return null;
    }
  }

  showLogin() {
    this.isLoginView = true;
    this.isRegisterView = false;
    this.isDashboardView = false;
    this.isDetailView = false;
    this.isSettingsView = false;
  }

  showRegister() {
    this.isRegisterView = true;
    this.isLoginView = false;
    this.isDashboardView = false;
    this.isDetailView = false;
    this.isSettingsView = false;
  }

  showDashboard() {
    this.isDashboardView = true;
    this.isLoginView = false;
    this.isRegisterView = false;
    this.isDetailView = false;
    this.isSettingsView = false;
  }

  showDetail(equipment: Equipment) {
    this.selectedEquipment = equipment;
    this.isDetailView = true;
    this.isLoginView = false;
    this.isRegisterView = false;
    this.isDashboardView = false;
    this.isSettingsView = false;
  }

  showSettings() {
    this.isSettingsView = true;
    this.isLoginView = false;
    this.isRegisterView = false;
    this.isDashboardView = false;
    this.isDetailView = false;
  }

  hideLogin() {
    this.isLoginView = false;
    this.loginError = '';
    this.loginForm.reset();
  }

  hideRegister() {
    this.isRegisterView = false;
    this.registerError = '';
    this.registerForm.reset();
  }

  hideDashboard() {
    this.isDashboardView = false;
  }

  hideDetail() {
    this.isDetailView = false;
    this.selectedEquipment = null;
  }

  hideSettings() {
    this.isSettingsView = false;
  }

  onSubmit() {
    if (this.loginForm.valid) {
      // Simular login exitoso
      console.log('Login attempt:', this.loginForm.value);
      this.hideLogin();
      this.showDashboard();
    } else {
      this.loginForm.markAllAsTouched();
    }
  }

  onRegisterSubmit() {
    if (this.registerForm.valid) {
      // Simular registro exitoso
      console.log('Register attempt:', this.registerForm.value);
      this.hideRegister();
      this.showLogin();
    } else {
      this.registerForm.markAllAsTouched();
    }
  }

  getErrorMessage(field: string): string {
    const control = this.loginForm.get(field);
    if (control?.errors && control.touched) {
      if (control.errors['required']) return 'Este campo es requerido';
      if (control.errors['email']) return 'Email inválido';
      if (control.errors['minlength']) return 'Mínimo 6 caracteres';
    }
    return '';
  }

  getRegisterErrorMessage(field: string): string {
    const control = this.registerForm.get(field);
    if (control?.errors && control.touched) {
      if (control.errors['required']) return 'Este campo es requerido';
      if (control.errors['email']) return 'Email inválido';
      if (control.errors['minlength']) {
        const minLength = control.errors['minlength'].requiredLength;
        return `Mínimo ${minLength} caracteres`;
      }
      if (field === 'confirmPassword' && control.errors['passwordMismatch']) {
        return 'Las contraseñas no coinciden';
      }
    }
    return '';
  }

  getFieldStatus(field: string): 'valid' | 'invalid' | 'neutral' {
    const control = this.registerForm.get(field);
    if (!control) return 'neutral';
    
    if (control.touched) {
      if (control.valid) return 'valid';
      if (control.invalid) return 'invalid';
    }
    return 'neutral';
  }

  getPasswordStrength(): 'weak' | 'medium' | 'strong' | 'none' {
    const password = this.registerForm.get('password')?.value;
    if (!password) return 'none';
    
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const length = password.length;
    
    if (length >= 8 && hasLetter && hasNumber && hasSpecial) return 'strong';
    if (length >= 6 && ((hasLetter && hasNumber) || (hasLetter && hasSpecial) || (hasNumber && hasSpecial))) return 'medium';
    if (length >= 4) return 'weak';
    return 'weak';
  }

  // Dashboard methods
  onSearchChange() {
    this.filterEquipments();
  }

  onStatusFilterChange() {
    this.filterEquipments();
  }

  filterEquipments() {
    this.filteredEquipments = this.equipments.filter(equipment => {
      const matchesSearch = equipment.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           equipment.location.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesStatus = this.statusFilter === 'all' || equipment.status === this.statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'active': return 'var(--success)';
      case 'warning': return 'var(--warning)';
      case 'inactive': return 'var(--text-secondary)';
      default: return 'var(--text-secondary)';
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

  getMinersStatusColor(status: string): string {
    switch (status) {
      case 'online': return 'var(--success)';
      case 'alert': return 'var(--error)';
      case 'offline': return 'var(--text-secondary)';
      default: return 'var(--text-secondary)';
    }
  }

  setActiveSidebarItem(item: string) {
    this.activeSidebarItem = item;
    if (item === 'settings') {
      this.showSettings();
    }
  }

  getTotalStats() {
    return {
      totalEquipments: this.equipments.length,
      totalHelmets: this.equipments.reduce((sum, eq) => sum + eq.totalHelmets, 0),
      activeHelmets: this.equipments.reduce((sum, eq) => sum + eq.activeHelmets, 0),
      totalAlerts: this.equipments.reduce((sum, eq) => sum + eq.alerts, 0)
    };
  }

  // Detail View methods
  onTimeRangeChange() {
    // Simular cambio de datos según el rango de tiempo
    console.log('Time range changed to:', this.selectedTimeRange);
  }

  onMinerSelect(minerId: string) {
    this.selectedMiner = minerId;
  }

  getAlertTypeColor(type: string): string {
    switch (type) {
      case 'critical': return 'var(--error)';
      case 'warning': return 'var(--warning)';
      case 'info': return 'var(--primary)';
      default: return 'var(--text-secondary)';
    }
  }

  getAlertTypeIcon(type: string): string {
    switch (type) {
      case 'critical': return 'fas fa-exclamation-triangle';
      case 'warning': return 'fas fa-exclamation-circle';
      case 'info': return 'fas fa-info-circle';
      default: return 'fas fa-bell';
    }
  }

  resolveAlert(alertId: string) {
    this.alerts = this.alerts.map(alert => 
      alert.id === alertId ? { ...alert, resolved: true } : alert
    );
  }

  getTemperatureColor(temp: number): string {
    if (temp >= 38) return 'var(--error)';
    if (temp >= 37.5) return 'var(--warning)';
    return 'var(--success)';
  }

  getBatteryColor(battery: number): string {
    if (battery <= 20) return 'var(--error)';
    if (battery <= 50) return 'var(--warning)';
    return 'var(--success)';
  }

  getHeartRateColor(hr: number): string {
    if (hr >= 100 || hr <= 60) return 'var(--error)';
    if (hr >= 90 || hr <= 70) return 'var(--warning)';
    return 'var(--success)';
  }

  getOxygenColor(oxygen: number): string {
    if (oxygen < 95) return 'var(--error)';
    if (oxygen < 97) return 'var(--warning)';
    return 'var(--success)';
  }

  getFilteredAlerts() {
    return this.alerts.filter(alert => !alert.resolved);
  }

  getFilteredMiners() {
    if (this.selectedMiner) {
      return this.minersDetail.filter(miner => miner.id === this.selectedMiner);
    }
    return this.minersDetail;
  }

  // Settings methods
  setActiveSettingsTab(tab: string) {
    this.activeSettingsTab = tab;
  }

  getRoleColor(role: string): string {
    switch (role) {
      case 'admin': return 'var(--error)';
      case 'supervisor': return 'var(--warning)';
      case 'operator': return 'var(--success)';
      default: return 'var(--text-secondary)';
    }
  }

  getRoleText(role: string): string {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'supervisor': return 'Supervisor';
      case 'operator': return 'Operador';
      default: return 'Desconocido';
    }
  }

  toggleUserStatus(userId: string) {
    this.users = this.users.map(user => 
      user.id === userId ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' } : user
    );
  }

  deleteUser(userId: string) {
    this.users = this.users.filter(user => user.id !== userId);
  }

  toggleAlertRule(ruleId: string) {
    this.alertRules = this.alertRules.map(rule => 
      rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
    );
  }

  deleteAlertRule(ruleId: string) {
    this.alertRules = this.alertRules.filter(rule => rule.id !== ruleId);
  }

  getAlertTypeText(type: string): string {
    switch (type) {
      case 'temperature': return 'Temperatura';
      case 'battery': return 'Batería';
      case 'movement': return 'Movimiento';
      case 'heart_rate': return 'Ritmo Cardíaco';
      case 'oxygen': return 'Oxígeno';
      default: return 'Desconocido';
    }
  }

  getConditionText(condition: string): string {
    switch (condition) {
      case 'above': return 'Mayor que';
      case 'below': return 'Menor que';
      case 'equals': return 'Igual a';
      default: return 'Desconocido';
    }
  }

  getNotificationText(notification: string): string {
    switch (notification) {
      case 'email': return 'Email';
      case 'sms': return 'SMS';
      case 'push': return 'Push';
      case 'all': return 'Todos';
      default: return 'Desconocido';
    }
  }

  onSettingsSubmit() {
    if (this.settingsForm.valid) {
      console.log('Settings saved:', this.settingsForm.value);
      // Aquí se guardarían las configuraciones
    }
  }

  addUser() {
    if (this.newUserForm.valid) {
      const newUser: User = {
        id: Date.now().toString(),
        name: this.newUserForm.value.name,
        email: this.newUserForm.value.email,
        role: this.newUserForm.value.role,
        status: 'active',
        lastLogin: 'Nunca',
        avatar: this.newUserForm.value.name.split(' ').map((n: string) => n[0]).join(''),
        permissions: this.getPermissionsForRole(this.newUserForm.value.role)
      };
      
      this.users.push(newUser);
      this.newUserForm.reset();
      this.showAddUserModal = false;
    }
  }

  addAlertRule() {
    if (this.newRuleForm.valid) {
      const newRule: AlertRule = {
        id: Date.now().toString(),
        name: this.newRuleForm.value.name,
        type: this.newRuleForm.value.type,
        condition: this.newRuleForm.value.condition,
        value: this.newRuleForm.value.value,
        enabled: true,
        notification: this.newRuleForm.value.notification
      };
      
      this.alertRules.push(newRule);
      this.newRuleForm.reset();
      this.showAddRuleModal = false;
    }
  }

  getPermissionsForRole(role: string): string[] {
    switch (role) {
      case 'admin': return ['all'];
      case 'supervisor': return ['dashboard', 'equipments', 'alerts', 'reports'];
      case 'operator': return ['dashboard', 'equipments'];
      default: return ['dashboard'];
    }
  }

  getActiveUsers() {
    return this.users.filter(user => user.status === 'active');
  }

  getActiveRules() {
    return this.alertRules.filter(rule => rule.enabled);
  }
}
