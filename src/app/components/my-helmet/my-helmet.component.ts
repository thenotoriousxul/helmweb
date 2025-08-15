import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { HelmetService, Helmet } from '../../services/helmet.service';
import { SensorService, SensorReading } from '../../services/sensor.service';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'app-my-helmet',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="my-helmet-container">

      <!-- Loading State -->
      <section *ngIf="isLoading" class="loading-section">
        <div class="loading-spinner">
          <div class="spinner"></div>
          <p>Cargando información del casco...</p>
        </div>
      </section>

      <!-- Empty State -->
      <section *ngIf="!isLoading && !myHelmet" class="empty-state">
        <div class="empty-content">
          <div class="empty-icon">
            <i class="fas fa-hard-hat"></i>
          </div>
          <h3>No tienes un casco asignado</h3>
          <p>Contacta a tu supervisor para que te asignen un casco y comenzar a monitorear tu seguridad.</p>
          <div class="empty-actions">
            <button class="btn-contact" (click)="contactSupervisor()">
              <i class="fas fa-phone"></i>
              Contactar Supervisor
            </button>
          </div>
        </div>
      </section>

      <!-- Helmet Information -->
      <section *ngIf="!isLoading && myHelmet" class="helmet-section">
        <!-- Main Helmet Card -->
        <div class="helmet-main-card">
          <div class="helmet-visual">
            <div class="helmet-3d">
              <i class="fas fa-hard-hat"></i>
            </div>
            <div class="status-indicator" [ngClass]="getStatusClass(myHelmet.status)">
              <div class="pulse"></div>
            </div>
          </div>
          
          <div class="helmet-info">
            <div class="helmet-title">
              <h2>{{ myHelmet.serialNumber || myHelmet.physicalId }}</h2>
              <span class="status-badge" [ngClass]="getStatusClass(myHelmet.status)">
                {{ getStatusText(myHelmet.status) }}
              </span>
            </div>
            
            <div class="helmet-stats">
              <div class="stat-item">
                <div class="stat-icon">
                  <i class="fas fa-heartbeat"></i>
                </div>
                <div class="stat-content">
                  <span class="stat-label">Última señal</span>
                  <span class="stat-value">{{ formatDateTime(myHelmet.lastHeartbeat) }}</span>
                </div>
              </div>
              
              <div class="stat-item">
                <div class="stat-icon">
                  <i class="fas fa-map-marker-alt"></i>
                </div>
                <div class="stat-content">
                  <span class="stat-label">Ubicación</span>
                  <span class="stat-value">{{ myHelmet.location || 'No disponible' }}</span>
                </div>
              </div>
              
              <div class="stat-item">
                <div class="stat-icon">
                  <i class="fas fa-calendar-alt"></i>
                </div>
                <div class="stat-content">
                  <span class="stat-label">Asignado desde</span>
                  <span class="stat-value">{{ formatDate(myHelmet.createdAt) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sensor Readings Card -->
        <div class="readings-card">
          <div class="card-header">
            <div class="header-left">
              <div class="header-icon">
                <i class="fas fa-chart-line"></i>
              </div>
              <div class="header-text">
                <h3>Lecturas de Sensores</h3>
                <p>Datos en tiempo real de tu casco</p>
              </div>
            </div>
            <div class="header-right">
              <button class="refresh-btn" (click)="refreshReadings()" [disabled]="isLoading">
                <i class="fas fa-sync-alt" [class.spinning]="isLoading"></i>
              </button>
            </div>
          </div>
          
          <div class="card-body">
            <div *ngIf="readings.length === 0" class="no-readings">
              <div class="no-readings-icon">
                <i class="fas fa-chart-bar"></i>
              </div>
              <h4>No hay lecturas disponibles</h4>
              <p>Los sensores aún no han enviado datos. Las lecturas aparecerán aquí cuando estén disponibles.</p>
            </div>
            
            <div *ngIf="readings.length > 0" class="readings-grid">
              <div *ngFor="let reading of readings | slice:0:10" class="reading-item" [ngClass]="{'alert': reading.isAlert}">
                <div class="reading-icon">
                  <i class="fas" [ngClass]="getSensorIcon(getSensorType(reading))"></i>
                </div>
                <div class="reading-content">
                  <div class="reading-header">
                    <span class="sensor-type">{{ getSensorName(getSensorType(reading)) }}</span>
                    <span class="reading-time">{{ formatTime(reading.createdAt || reading.timestamp) }}</span>
                  </div>
                  <div class="reading-value">
                    <span class="value">{{ reading.value }}</span>
                    <span class="unit">{{ reading.unit }}</span>
                  </div>
                  <div class="reading-status" [ngClass]="{'normal': reading.isNormal, 'alert': reading.isAlert}">
                    {{ reading.isAlert ? 'Alerta' : (reading.isNormal ? 'Normal' : 'Sin datos') }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .my-helmet-container {
      padding: 0;
      max-width: none;
      margin: 0;
      min-height: 100vh;
      background: #0a192f;
    }

    /* Header Styles */
    .page-header {
      background: rgba(48, 60, 85, 0.4);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(61, 244, 244, 0.2);
      border-radius: 16px;
      padding: 2rem;
      margin-bottom: 2rem;
      box-shadow: 0 10px 30px rgba(61, 244, 244, 0.1);
    }

    .header-content {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    .header-icon {
      width: 80px;
      height: 80px;
      background: rgba(61, 244, 244, 0.2);
      border: 2px solid rgba(61, 244, 244, 0.3);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .header-icon i {
      font-size: 2.5rem;
      color: #3df4f4;
    }

    .header-text h1 {
      color: #ccd6f6;
      margin: 0;
      font-size: 2.5rem;
      font-weight: 700;
    }

    .header-text p {
      color: #8892b0;
      margin: 0.5rem 0 0 0;
      font-size: 1.1rem;
    }

    /* Loading Styles */
    .loading-section {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 300px;
    }

    .loading-spinner {
      text-align: center;
    }

    .loading-spinner p {
      color: #8892b0;
      margin-top: 1rem;
    }

    .spinner {
      width: 60px;
      height: 60px;
      border: 4px solid rgba(61, 244, 244, 0.2);
      border-top: 4px solid #3df4f4;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    /* Empty State Styles */
    .empty-state {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 400px;
    }

    .empty-content {
      text-align: center;
      max-width: 500px;
      padding: 3rem;
      background: rgba(48, 60, 85, 0.4);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(61, 244, 244, 0.2);
      border-radius: 16px;
    }

    .empty-icon {
      width: 120px;
      height: 120px;
      margin: 0 auto 2rem;
      background: rgba(61, 244, 244, 0.2);
      border: 2px solid rgba(61, 244, 244, 0.3);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .empty-icon i {
      font-size: 3rem;
      color: #3df4f4;
    }

    .empty-content h3 {
      font-size: 1.8rem;
      color: #ccd6f6;
      margin-bottom: 1rem;
    }

    .empty-content p {
      color: #8892b0;
      font-size: 1.1rem;
      line-height: 1.6;
      margin-bottom: 2rem;
    }

    .btn-contact {
      background: linear-gradient(135deg, #3df4f4 0%, #64ffda 100%);
      color: #0a192f;
      border: none;
      padding: 1rem 2rem;
      border-radius: 8px;
      font-size: 1.1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      box-shadow: 0 4px 15px rgba(61, 244, 244, 0.3);
    }

    .btn-contact:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(61, 244, 244, 0.4);
    }

    /* Helmet Section */
    .helmet-section {
      display: grid;
      gap: 2rem;
    }

    /* Main Helmet Card */
    .helmet-main-card {
      background: rgba(48, 60, 85, 0.4);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(61, 244, 244, 0.2);
      border-radius: 16px;
      padding: 2.5rem;
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 2.5rem;
      align-items: center;
    }

    .helmet-visual {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .helmet-3d {
      width: 120px;
      height: 120px;
      background: rgba(61, 244, 244, 0.2);
      border: 2px solid rgba(61, 244, 244, 0.3);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      box-shadow: 0 10px 30px rgba(61, 244, 244, 0.2);
    }

    .helmet-3d i {
      font-size: 3.5rem;
      color: #3df4f4;
    }

    .status-indicator {
      position: absolute;
      bottom: -5px;
      right: -5px;
      width: 35px;
      height: 35px;
      border-radius: 50%;
      border: 4px solid #0a192f;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .status-indicator.active {
      background: #64ffda;
    }

    .status-indicator.assigned {
      background: #3df4f4;
    }

    .status-indicator.inactive {
      background: #8892b0;
    }

    .pulse {
      width: 15px;
      height: 15px;
      border-radius: 50%;
      background: #0a192f;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0% { transform: scale(0.8); opacity: 1; }
      50% { transform: scale(1.2); opacity: 0.7; }
      100% { transform: scale(0.8); opacity: 1; }
    }

    .helmet-info {
      flex: 1;
    }

    .helmet-title {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 2rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .helmet-title h2 {
      font-size: 2.2rem;
      font-weight: 700;
      color: #ccd6f6;
      margin: 0;
    }

    .status-badge {
      padding: 0.5rem 1.5rem;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .status-badge.active {
      background: rgba(100, 255, 218, 0.2);
      color: #64ffda;
      border: 1px solid rgba(100, 255, 218, 0.3);
    }

    .status-badge.assigned {
      background: rgba(61, 244, 244, 0.2);
      color: #3df4f4;
      border: 1px solid rgba(61, 244, 244, 0.3);
    }

    .status-badge.inactive {
      background: rgba(136, 146, 176, 0.2);
      color: #8892b0;
      border: 1px solid rgba(136, 146, 176, 0.3);
    }

    .helmet-stats {
      display: grid;
      gap: 1.5rem;
    }

    .stat-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: rgba(23, 42, 69, 0.5);
      border: 1px solid rgba(61, 244, 244, 0.2);
      border-radius: 12px;
      transition: all 0.3s ease;
    }

    .stat-item:hover {
      background: rgba(61, 244, 244, 0.1);
      border-color: rgba(61, 244, 244, 0.3);
      transform: translateX(5px);
    }

    .stat-icon {
      width: 50px;
      height: 50px;
      background: rgba(61, 244, 244, 0.2);
      border: 2px solid rgba(61, 244, 244, 0.3);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .stat-icon i {
      color: #3df4f4;
      font-size: 1.2rem;
    }

    .stat-content {
      flex: 1;
    }

    .stat-label {
      display: block;
      font-size: 0.9rem;
      color: #8892b0;
      margin-bottom: 0.25rem;
    }

    .stat-value {
      display: block;
      font-size: 1.1rem;
      font-weight: 600;
      color: #ccd6f6;
    }

    /* Readings Card */
    .readings-card {
      background: rgba(48, 60, 85, 0.4);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(61, 244, 244, 0.2);
      border-radius: 16px;
      overflow: hidden;
    }

    .readings-card .card-header {
      background: rgba(61, 244, 244, 0.1);
      border-bottom: 1px solid rgba(61, 244, 244, 0.2);
      padding: 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .header-left .header-icon {
      width: 60px;
      height: 60px;
      background: rgba(61, 244, 244, 0.2);
      border: 2px solid rgba(61, 244, 244, 0.3);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .header-left .header-icon i {
      font-size: 1.5rem;
      color: #3df4f4;
    }

    .header-left .header-text h3 {
      color: #ccd6f6;
      margin: 0;
      font-size: 1.5rem;
      font-weight: 600;
    }

    .header-left .header-text p {
      color: #8892b0;
      margin: 0.25rem 0 0 0;
      font-size: 0.9rem;
    }

    .refresh-btn {
      background: rgba(61, 244, 244, 0.2);
      border: 1px solid rgba(61, 244, 244, 0.3);
      width: 45px;
      height: 45px;
      border-radius: 8px;
      color: #3df4f4;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .refresh-btn:hover {
      background: rgba(61, 244, 244, 0.3);
      border-color: rgba(61, 244, 244, 0.4);
      transform: scale(1.05);
    }

    .refresh-btn i.spinning {
      animation: spin 1s linear infinite;
    }

    .card-body {
      padding: 2rem;
    }

    /* No Readings State */
    .no-readings {
      text-align: center;
      padding: 3rem 1rem;
    }

    .no-readings-icon {
      width: 100px;
      height: 100px;
      margin: 0 auto 1.5rem;
      background: rgba(61, 244, 244, 0.2);
      border: 2px solid rgba(61, 244, 244, 0.3);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .no-readings-icon i {
      font-size: 2.5rem;
      color: #3df4f4;
    }

    .no-readings h4 {
      font-size: 1.5rem;
      color: #ccd6f6;
      margin-bottom: 1rem;
    }

    .no-readings p {
      color: #8892b0;
      font-size: 1rem;
      line-height: 1.6;
    }

    /* Readings Grid */
    .readings-grid {
      display: grid;
      gap: 1rem;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    }

    .reading-item {
      background: rgba(23, 42, 69, 0.5);
      border: 1px solid rgba(61, 244, 244, 0.2);
      border-radius: 12px;
      padding: 1.5rem;
      transition: all 0.3s ease;
      border-left: 4px solid #64ffda;
    }

    .reading-item:hover {
      transform: translateY(-2px);
      background: rgba(61, 244, 244, 0.1);
      border-color: rgba(61, 244, 244, 0.3);
    }

    .reading-item.alert {
      border-left-color: #ff6b6b;
      background: rgba(255, 107, 107, 0.1);
    }

    .reading-item {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .reading-icon {
      width: 50px;
      height: 50px;
      background: rgba(61, 244, 244, 0.2);
      border: 2px solid rgba(61, 244, 244, 0.3);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .reading-icon i {
      color: #3df4f4;
      font-size: 1.2rem;
    }

    .reading-content {
      flex: 1;
    }

    .reading-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .sensor-type {
      font-weight: 600;
      color: #ccd6f6;
      font-size: 0.9rem;
    }

    .reading-time {
      font-size: 0.8rem;
      color: #8892b0;
    }

    .reading-value {
      margin-bottom: 0.5rem;
    }

    .reading-value .value {
      font-size: 1.5rem;
      font-weight: 700;
      color: #ccd6f6;
    }

    .reading-value .unit {
      font-size: 0.9rem;
      color: #8892b0;
      margin-left: 0.25rem;
    }

    .reading-status {
      font-size: 0.8rem;
      font-weight: 600;
      padding: 0.25rem 0.75rem;
      border-radius: 8px;
      display: inline-block;
    }

    .reading-status.normal {
      background: rgba(100, 255, 218, 0.2);
      color: #64ffda;
      border: 1px solid rgba(100, 255, 218, 0.3);
    }

    .reading-status.alert {
      background: rgba(255, 107, 107, 0.2);
      color: #ff6b6b;
      border: 1px solid rgba(255, 107, 107, 0.3);
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .my-helmet-container {
        padding: 1rem;
      }

      .helmet-main-card {
        grid-template-columns: 1fr;
        text-align: center;
        gap: 1.5rem;
      }

      .helmet-title {
        justify-content: center;
      }

      .readings-grid {
        grid-template-columns: 1fr;
      }

      .header-content {
        text-align: center;
        flex-direction: column;
      }

      .header-text h1 {
        font-size: 2rem;
      }
    }
  `]
})
export class MyHelmetComponent implements OnInit {
  myHelmet: Helmet | null = null;
  readings: SensorReading[] = [];
  isLoading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private helmetService: HelmetService,
    private sensorService: SensorService,
    private alert: AlertService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.loadMyHelmet();
  }

  loadMyHelmet() {
    this.isLoading = true;
    const user = this.authService.getCurrentUser();
    
    // Si es un minero, usar el endpoint específico para mineros
    if (user && user.role === 'minero') {
      this.helmetService.getMyHelmet().subscribe({
        next: (helmet) => {
          this.myHelmet = helmet;
          this.isLoading = false;
          this.cdr.detectChanges();
          if (this.myHelmet && this.myHelmet.id) {
            this.loadReadings(this.myHelmet.id);
          }
        },
        error: (err) => {
          console.error('Error cargando mi casco:', err);
          this.errorMessage = 'No se pudo cargar tu casco.';
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      // Para supervisores/admins, usar el método original
      this.helmetService.getAllHelmets().subscribe({
        next: (helmets) => {
          const assigned = (helmets || []).find(h => h.assignedToId === (user ? user.id : undefined));
          this.myHelmet = assigned || null;
          this.isLoading = false;
          this.cdr.detectChanges();
          if (this.myHelmet && this.myHelmet.id) {
            this.loadReadings(this.myHelmet.id);
          }
        },
        error: (err) => {
          console.error('Error cargando cascos:', err);
          this.errorMessage = 'No se pudo cargar tu casco.';
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  loadReadings(cascoId: string) {
    const start = new Date('1970-01-01T00:00:00Z');
    const end = new Date('2100-01-01T00:00:00Z');
    this.sensorService
      .getReadingsByCreated('cascoId', cascoId, start.toISOString(), end.toISOString(), 500)
      .subscribe({
        next: (data) => {
          this.readings = data;
          this.cdr.detectChanges();
        },
        error: () => {
          this.readings = [];
          this.cdr.detectChanges();
        }
      });
  }

  // Métodos para el nuevo diseño
  getStatusClass(status: string): string {
    switch (status) {
      case 'activo-asignado':
        return 'assigned';
      case 'activo':
      case 'activo-sin-asignar':
        return 'active';
      case 'inactivo':
        return 'inactive';
      default:
        return 'inactive';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'activo-asignado':
        return 'Asignado';
      case 'activo':
        return 'Activo';
      case 'activo-sin-asignar':
        return 'Sin Asignar';
      case 'inactivo':
        return 'Inactivo';
      default:
        return 'Desconocido';
    }
  }

  formatDateTime(dateTime: string | undefined): string {
    if (!dateTime) return 'No disponible';
    try {
      const date = new Date(dateTime);
      return date.toLocaleString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Fecha inválida';
    }
  }

  formatDate(dateTime: string | undefined): string {
    if (!dateTime) return 'No disponible';
    try {
      const date = new Date(dateTime);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Fecha inválida';
    }
  }

  formatTime(dateTime: string | undefined): string {
    if (!dateTime) return '--:--';
    try {
      const date = new Date(dateTime);
      return date.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '--:--';
    }
  }

  getSensorType(reading: SensorReading): string {
    // Intentar determinar el tipo de sensor basado en la unidad o metadatos
    if (reading.unit === 'bpm') return 'heart_rate';
    if (reading.unit === '°C' || reading.unit === 'C') return 'body_temperature';
    if (reading.unit === 'ppm' || reading.unit === 'mg/m³') return 'gas';
    if (reading.unit === 'V' || reading.unit === '%') return 'battery';
    if (reading.unit === 'm/s²' || reading.unit === 'g') return 'accelerometer';
    if (reading.unit === 'deg/s' || reading.unit === '°/s') return 'gyroscope';
    if (reading.location || (reading.metadata && (reading.metadata['lat'] || reading.metadata['latitude']))) return 'gps';
    
    // Si no podemos determinar el tipo, usar un tipo genérico
    return 'sensor';
  }

  getSensorIcon(sensorType: string): string {
    const iconMap: { [key: string]: string } = {
      'gps': 'fa-map-marker-alt',
      'heart_rate': 'fa-heartbeat',
      'body_temperature': 'fa-thermometer-half',
      'gas': 'fa-wind',
      'accelerometer': 'fa-running',
      'gyroscope': 'fa-compass',
      'battery': 'fa-battery-half',
      'sensor': 'fa-microchip'
    };
    return iconMap[sensorType] || 'fa-microchip';
  }

  getSensorName(sensorType: string): string {
    const nameMap: { [key: string]: string } = {
      'gps': 'GPS',
      'heart_rate': 'Frecuencia Cardíaca',
      'body_temperature': 'Temperatura Corporal',
      'gas': 'Gas',
      'accelerometer': 'Acelerómetro',
      'gyroscope': 'Giroscopio',
      'battery': 'Batería',
      'sensor': 'Sensor'
    };
    return nameMap[sensorType] || 'Sensor';
  }

  refreshReadings(): void {
    if (this.myHelmet && this.myHelmet.id) {
      this.loadReadings(this.myHelmet.id);
    }
  }

  contactSupervisor(): void {
    // Implementar lógica para contactar al supervisor
    // Por ejemplo, abrir un modal de contacto o redirigir a una página de contacto
    this.alert.info('Esta función estará disponible proximamente.');
  }
}


