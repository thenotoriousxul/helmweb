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
      <header class="page-header">
        <h1>Mi Casco</h1>
        <p>Información del casco asignado y lecturas recientes.</p>
      </header>

      <section *ngIf="isLoading">
        <p>Cargando...</p>
      </section>

      <section *ngIf="!isLoading && !myHelmet">
        <div class="empty-state">
          <i class="fas fa-hard-hat"></i>
          <h3>No tienes un casco asignado</h3>
          <p>Contacta a tu supervisor para que te asignen un casco.</p>
        </div>
      </section>

      <section *ngIf="!isLoading && myHelmet" class="helmet-card">
        <div class="card">
          <div class="card-header">
            <div class="title">
              <i class="fas fa-hard-hat"></i>
              <h3>Casco: {{ myHelmet.serialNumber }}</h3>
            </div>
            <span class="status" [style.background]="'#eef'">{{ myHelmet.status | uppercase }}</span>
          </div>
          <div class="card-body">
            <div class="stat">
              <span class="label">Último latido:</span>
              <span class="value">{{ myHelmet.lastHeartbeat || 'N/D' }}</span>
            </div>
            <div class="stat">
              <span class="label">Ubicación:</span>
              <span class="value">{{ myHelmet.location || 'N/D' }}</span>
            </div>
          </div>
        </div>

        <div class="card readings">
          <div class="card-header">
            <div class="title">
              <i class="fas fa-wave-square"></i>
              <h3>Lecturas recientes</h3>
            </div>
          </div>
          <div class="card-body">
            <div *ngIf="readings.length === 0" class="empty-state">
              <p>No hay lecturas disponibles.</p>
            </div>
            <ul *ngIf="readings.length > 0" class="reading-list">
              <li *ngFor="let r of readings | slice:0:50">
                <span>{{ r.createdAtLocal || r.createdAt || r.timestampLocal || r.timestamp || '-' }}</span>
                <span>{{ r.value }} {{ r.unit }}</span>
                <span [class.alert]="r.isAlert">{{ r.isAlert ? 'Alerta' : (r.isNormal ? 'Normal' : 'N/A') }}</span>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .my-helmet-container { padding: 2rem; max-width: 1000px; margin: 0 auto; }
    .page-header { margin-bottom: 1rem; }
    .empty-state { text-align: center; padding: 2rem; color: #666; }
    .helmet-card .card { background: #fff; border-radius: 12px; padding: 1rem; margin-bottom: 1rem; box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
    .card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: .5rem; }
    .card-header .title { display: flex; gap: .5rem; align-items: center; }
    .card-header .status { padding: .25rem .5rem; border-radius: 8px; font-size: .8rem; }
    .card-body .stat { display: flex; gap: .5rem; margin: .25rem 0; }
    .readings .reading-list { list-style: none; padding: 0; margin: 0; display: grid; gap: .25rem; }
    .readings .reading-list li { display: grid; grid-template-columns: 1fr auto auto; gap: .75rem; padding: .5rem; border-bottom: 1px solid #eee; }
    .readings .reading-list li .alert { color: #dc3545; font-weight: 600; }
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
    this.helmetService.getAllHelmets().subscribe({
      next: (helmets) => {
        const user = this.authService.getCurrentUser();
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
}


