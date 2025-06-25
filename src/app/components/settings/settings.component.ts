import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface AlertThreshold {
  id: string;
  type: 'temperature' | 'battery' | 'gas' | 'impact' | 'signal';
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  minValue?: number;
  maxValue?: number;
}

interface NotificationSetting {
  id: string;
  type: 'email' | 'sms' | 'webhook' | 'push';
  enabled: boolean;
  recipients?: string[];
  webhookUrl?: string;
}

interface SystemSetting {
  id: string;
  name: string;
  description: string;
  type: 'string' | 'number' | 'boolean' | 'select';
  value: any;
  category: 'general' | 'security' | 'performance' | 'integration';
  options?: string[];
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent {
  activeTab = 'general';
  showSaveModal = false;

  systemSettings: SystemSetting[] = [
    {
      id: '1',
      name: 'Nombre del Sistema',
      description: 'Nombre que se mostrará en la interfaz',
      type: 'string',
      value: 'HELM IoT Mining',
      category: 'general'
    },
    {
      id: '2',
      name: 'Zona Horaria',
      description: 'Zona horaria para las fechas y horas',
      type: 'select',
      value: 'America/Santiago',
      category: 'general',
      options: ['America/Santiago', 'UTC', 'America/New_York', 'Europe/London']
    },
    {
      id: '3',
      name: 'Idioma',
      description: 'Idioma de la interfaz',
      type: 'select',
      value: 'es',
      category: 'general',
      options: ['es', 'en', 'pt']
    },
    {
      id: '4',
      name: 'Modo Oscuro',
      description: 'Activar el tema oscuro por defecto',
      type: 'boolean',
      value: true,
      category: 'general'
    },
    {
      id: '5',
      name: 'Tiempo de Sesión',
      description: 'Tiempo de inactividad antes de cerrar sesión (minutos)',
      type: 'number',
      value: 30,
      category: 'security'
    },
    {
      id: '6',
      name: 'Autenticación de Dos Factores',
      description: 'Requerir 2FA para todos los usuarios',
      type: 'boolean',
      value: false,
      category: 'security'
    },
    {
      id: '7',
      name: 'Intervalo de Actualización',
      description: 'Frecuencia de actualización de datos (segundos)',
      type: 'number',
      value: 5,
      category: 'performance'
    },
    {
      id: '8',
      name: 'Caché de Datos',
      description: 'Activar caché para mejorar el rendimiento',
      type: 'boolean',
      value: true,
      category: 'performance'
    },
    {
      id: '9',
      name: 'API Key',
      description: 'Clave de API para integraciones externas',
      type: 'string',
      value: 'sk-1234567890abcdef',
      category: 'integration'
    },
    {
      id: '10',
      name: 'Webhook URL',
      description: 'URL para enviar notificaciones webhook',
      type: 'string',
      value: 'https://api.ejemplo.com/webhook',
      category: 'integration'
    }
  ];

  alertThresholds: AlertThreshold[] = [
    {
      id: '1',
      type: 'temperature',
      severity: 'high',
      enabled: true,
      minValue: 15,
      maxValue: 35
    },
    {
      id: '2',
      type: 'battery',
      severity: 'medium',
      enabled: true,
      minValue: 10,
      maxValue: 100
    },
    {
      id: '3',
      type: 'gas',
      severity: 'critical',
      enabled: true,
      minValue: 0,
      maxValue: 50
    },
    {
      id: '4',
      type: 'impact',
      severity: 'high',
      enabled: true
    },
    {
      id: '5',
      type: 'signal',
      severity: 'medium',
      enabled: false
    }
  ];

  notificationSettings: NotificationSetting[] = [
    {
      id: '1',
      type: 'email',
      enabled: true,
      recipients: ['admin@minera.com', 'supervisor@minera.com']
    },
    {
      id: '2',
      type: 'sms',
      enabled: false,
      recipients: ['+56912345678']
    },
    {
      id: '3',
      type: 'webhook',
      enabled: true,
      webhookUrl: 'https://api.ejemplo.com/webhook'
    },
    {
      id: '4',
      type: 'push',
      enabled: true
    }
  ];

  // Propiedades computadas para filtrar configuraciones
  get generalSettings(): SystemSetting[] {
    return this.systemSettings.filter(s => s.category === 'general');
  }

  get systemAdvancedSettings(): SystemSetting[] {
    return this.systemSettings.filter(s => s.category !== 'general');
  }

  constructor() {}

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  updateSystemSetting(setting: SystemSetting) {
    console.log('Actualizando configuración:', setting);
    // Aquí se implementaría la lógica para guardar en el backend
  }

  updateThreshold(threshold: AlertThreshold) {
    console.log('Actualizando umbral:', threshold);
    // Aquí se implementaría la lógica para guardar en el backend
  }

  updateNotification(notification: NotificationSetting) {
    console.log('Actualizando notificación:', notification);
    // Aquí se implementaría la lógica para guardar en el backend
  }

  addEmailRecipient(notification: NotificationSetting) {
    if (!notification.recipients) {
      notification.recipients = [];
    }
    notification.recipients.push('');
  }

  removeEmailRecipient(notification: NotificationSetting, index: number) {
    if (notification.recipients) {
      notification.recipients.splice(index, 1);
    }
  }

  exportSettings() {
    const settings = {
      systemSettings: this.systemSettings,
      alertThresholds: this.alertThresholds,
      notificationSettings: this.notificationSettings
    };
    
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'helm-settings.json';
    link.click();
    
    URL.revokeObjectURL(url);
  }

  importSettings(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        try {
          const settings = JSON.parse(e.target.result);
          this.systemSettings = settings.systemSettings || this.systemSettings;
          this.alertThresholds = settings.alertThresholds || this.alertThresholds;
          this.notificationSettings = settings.notificationSettings || this.notificationSettings;
          alert('Configuración importada correctamente');
        } catch (error) {
          alert('Error al importar la configuración');
        }
      };
      reader.readAsText(file);
    }
  }

  saveAllSettings() {
    this.showSaveModal = true;
    
    // Simulación de guardado
    setTimeout(() => {
      this.showSaveModal = false;
      alert('Configuración guardada correctamente');
    }, 2000);
  }

  getSeverityColor(severity: string): string {
    switch (severity) {
      case 'low': return '#64ffda';
      case 'medium': return '#ffd93d';
      case 'high': return '#ff6b6b';
      case 'critical': return '#ff0000';
      default: return '#8892b0';
    }
  }

  getSeverityText(severity: string): string {
    switch (severity) {
      case 'low': return 'Baja';
      case 'medium': return 'Media';
      case 'high': return 'Alta';
      case 'critical': return 'Crítica';
      default: return 'Desconocida';
    }
  }

  getThresholdTypeIcon(type: string): string {
    switch (type) {
      case 'temperature': return 'fas fa-thermometer-half';
      case 'battery': return 'fas fa-battery-three-quarters';
      case 'gas': return 'fas fa-wind';
      case 'impact': return 'fas fa-exclamation-triangle';
      case 'signal': return 'fas fa-wifi';
      default: return 'fas fa-cog';
    }
  }

  getThresholdTypeText(type: string): string {
    switch (type) {
      case 'temperature': return 'Temperatura';
      case 'battery': return 'Batería';
      case 'gas': return 'Gas';
      case 'impact': return 'Impacto';
      case 'signal': return 'Señal';
      default: return 'Desconocido';
    }
  }

  getNotificationTypeIcon(type: string): string {
    switch (type) {
      case 'email': return 'fas fa-envelope';
      case 'sms': return 'fas fa-sms';
      case 'webhook': return 'fas fa-link';
      case 'push': return 'fas fa-bell';
      default: return 'fas fa-cog';
    }
  }

  getNotificationTypeText(type: string): string {
    switch (type) {
      case 'email': return 'Email';
      case 'sms': return 'SMS';
      case 'webhook': return 'Webhook';
      case 'push': return 'Push';
      default: return 'Desconocido';
    }
  }

  getCategoryColor(category: string): string {
    switch (category) {
      case 'security': return '#ff6b6b';
      case 'performance': return '#64ffda';
      case 'integration': return '#ffd93d';
      default: return '#8892b0';
    }
  }

  getCategoryText(category: string): string {
    switch (category) {
      case 'security': return 'Seguridad';
      case 'performance': return 'Rendimiento';
      case 'integration': return 'Integración';
      default: return 'General';
    }
  }
} 