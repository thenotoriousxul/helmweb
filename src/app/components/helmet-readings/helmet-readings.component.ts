import { Component, OnInit, ChangeDetectorRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { ActivatedRoute, Router } from '@angular/router';
import { HelmetService, Helmet } from '../../services/helmet.service';
import { SensorService, SensorReading, TriSeriesResponse } from '../../services/sensor.service';
import { MineroService, Minero } from '../../services/minero.service';
import { AlertService } from '../../services/alert.service';
import { AuthService } from '../../services/auth.service';
import * as L from 'leaflet';

@Component({
  selector: 'app-helmet-readings',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective],
  template: `
    <div class="helmet-readings-container">

      <!-- Loading State -->
      <div *ngIf="isLoading" class="loading-container">
        <div class="spinner"></div>
      </div>

      <!-- Back Button -->
      <div class="back-button-container">
        <button class="back-btn" (click)="goBack()">
          <i class="fas fa-arrow-left"></i>
          Volver a Gestión de Cascos
        </button>
      </div>

      <!-- Helmet Information -->
      <section *ngIf="!isLoading && helmet" class="helmet-section">
        <!-- Main Helmet Card -->
        <div class="helmet-main-card">
          <div class="helmet-visual">
            <div class="helmet-3d">
              <i class="fas fa-hard-hat"></i>
            </div>
            <div class="status-indicator" [ngClass]="getStatusClass(helmet.status)">
              <div class="pulse"></div>
            </div>
          </div>
          
          <div class="helmet-info">
            <div class="helmet-title">
              <h2>{{ helmet.serialNumber || helmet.physicalId }}</h2>
              <span class="status-badge" [ngClass]="getStatusClass(helmet.status)">
                {{ getStatusText(helmet.status) }}
              </span>
            </div>
            
            <div class="helmet-stats">
              <div class="stat-item">
                <div class="stat-icon">
                  <i class="fas fa-user"></i>
                </div>
                <div class="stat-content">
                  <span class="stat-label">Minero asignado</span>
                  <span class="stat-value">{{ assignedMiner?.fullName || 'No asignado' }}</span>
                </div>
              </div>

              <div class="stat-item">
                <div class="stat-icon">
                  <i class="fas fa-heartbeat"></i>
                </div>
                <div class="stat-content">
                  <span class="stat-label">Última señal</span>
                  <span class="stat-value">{{ formatDateTime(helmet.lastHeartbeat) }}</span>
                </div>
              </div>
              
              <div class="stat-item">
                <div class="stat-icon">
                  <i class="fas fa-map-marker-alt"></i>
                </div>
                <div class="stat-content">
                  <span class="stat-label">Ubicación</span>
                  <span class="stat-value">{{ helmet.location || 'No disponible' }}</span>
                </div>
              </div>
              
              <div class="stat-item">
                <div class="stat-icon">
                  <i class="fas fa-calendar-alt"></i>
                </div>
                <div class="stat-content">
                  <span class="stat-label">Creado</span>
                  <span class="stat-value">{{ formatDate(helmet.createdAt) }}</span>
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
                <p>Datos en tiempo real del casco</p>
              </div>
            </div>
            <div class="header-right">
              <button class="refresh-btn" (click)="refreshReadings()" [disabled]="isLoadingReadings">
                <i class="fas fa-sync-alt" [class.spinning]="isLoadingReadings"></i>
              </button>
            </div>
          </div>
          
          <div class="card-body">
            <div *ngIf="readings.length === 0 && !isLoadingReadings" class="no-readings">
              <div class="no-readings-icon">
                <i class="fas fa-chart-bar"></i>
              </div>
              <h4>No hay lecturas disponibles</h4>
              <p>Los sensores aún no han enviado datos. Las lecturas aparecerán aquí cuando estén disponibles.</p>
            </div>

            <div *ngIf="isLoadingReadings" class="loading-readings">
              <div class="loading-spinner"></div>
              <p>Cargando lecturas...</p>
            </div>
            
            <div *ngIf="readings.length > 0 && !isLoadingReadings" class="readings-grid">
              <div *ngFor="let reading of readings" class="reading-item" [ngClass]="{'alert': reading.isAlert}">
                <div class="reading-icon">
                  <i class="fas" [ngClass]="getSensorIcon(getSensorType(reading))"></i>
                </div>
                <div class="reading-content">
                  <div class="reading-header">
                    <span class="sensor-type">{{ getSensorName(getSensorType(reading)) }}</span>
                    <span class="reading-time">{{ formatTime(reading.createdAt || reading.timestamp) }}</span>
                  </div>
                  <div class="reading-value">
                    <span class="value" [ngClass]="{'gps-coordinates': getSensorType(reading) === 'gps'}">{{ formatSensorValue(reading) }}</span>
                    <span class="unit">{{ formatSensorUnit(reading) }}</span>
                  </div>
                  <div class="reading-status" [ngClass]="{'normal': reading.isNormal, 'alert': reading.isAlert}">
                    {{ reading.isAlert ? 'Alerta' : (reading.isNormal ? 'Normal' : 'Sin datos') }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Map Section -->
        <div class="map-card">
          <div class="card-header">
            <div class="header-left">
              <div class="header-icon">
                <i class="fas fa-map-marker-alt"></i>
              </div>
              <div class="header-text">
                <h3>Ubicación del Casco</h3>
                <p>Posición GPS en tiempo real</p>
              </div>
            </div>
            <div class="location-info" *ngIf="currentLocation">
              <span class="coordinates">{{ currentLocation.lat.toFixed(6) }}, {{ currentLocation.lng.toFixed(6) }}</span>
            </div>
          </div>
          
          <div class="map-content">
            <div id="helmet-map" class="map-container">
              <!-- Map will be initialized here -->
            </div>
            <div *ngIf="!currentLocation" class="location-notice">
              <i class="fas fa-info-circle"></i>
              <span>Mostrando ubicación por defecto - Universidad Tecnológica de Torreón</span>
            </div>
          </div>
        </div>

        <!-- Charts Section -->
        <div class="charts-card" *ngIf="helmet">
          <div class="card-header">
            <div class="header-left">
              <div class="header-icon">
                <i class="fas fa-chart-area"></i>
              </div>
              <div class="header-text">
                <h3>Gráficas de Sensores</h3>
                <p>Tendencias históricas de los datos</p>
              </div>
            </div>
            <button class="refresh-btn" (click)="refreshCharts()" [disabled]="isLoadingCharts">
              <i class="fas fa-sync-alt" [class.spinning]="isLoadingCharts"></i>
              Actualizar
            </button>
          </div>

          <div class="chart-content">
            <div *ngIf="isLoadingCharts" class="loading-state">
              <div class="loading-spinner"></div>
              <p>Cargando gráficas...</p>
            </div>

            <div *ngIf="!isLoadingCharts && chartData" class="chart-container">
              <canvas 
                baseChart
                [data]="chartData"
                [options]="chartOptions"
                [type]="chartType">
              </canvas>
            </div>

            <div *ngIf="!isLoadingCharts && !chartData" class="no-chart-data">
              <i class="fas fa-chart-line"></i>
              <p>No hay datos disponibles para mostrar gráficas</p>
              <button class="retry-btn" (click)="refreshCharts()">
                <i class="fas fa-redo"></i>
                Intentar de nuevo
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Error State -->
      <section *ngIf="!isLoading && !helmet" class="error-state">
        <div class="error-content">
          <div class="error-icon">
            <i class="fas fa-exclamation-triangle"></i>
          </div>
          <h3>Casco no encontrado</h3>
          <p>No se pudo cargar la información del casco solicitado.</p>
          <button class="btn-back" (click)="goBack()">
            <i class="fas fa-arrow-left"></i>
            Volver a Gestión de Cascos
          </button>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .helmet-readings-container {
      padding: 0;
      max-width: none;
      margin: 0;
      min-height: 100vh;
      background: #0a192f;
    }

    /* Loading Styles */
    .loading-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 400px;
    }

    .spinner {
      width: 50px;
      height: 50px;
      border: 4px solid rgba(61, 244, 244, 0.2);
      border-top: 4px solid #3df4f4;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    /* Back Button */
    .back-button-container {
      padding: 1rem 2rem;
      background: rgba(23, 42, 69, 0.5);
      border-bottom: 1px solid rgba(61, 244, 244, 0.2);
    }

    .back-btn {
      background: rgba(61, 244, 244, 0.2);
      border: 1px solid rgba(61, 244, 244, 0.3);
      color: #3df4f4;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.9rem;
      font-weight: 500;
    }

    .back-btn:hover {
      background: rgba(61, 244, 244, 0.3);
      border-color: rgba(61, 244, 244, 0.4);
      transform: translateX(-2px);
    }

    /* Helmet Section */
    .helmet-section {
      display: grid;
      gap: 2rem;
      padding: 2rem;
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
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
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

    /* Loading Readings */
    .loading-readings {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem;
      color: #8892b0;
    }

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 3px solid rgba(100, 255, 218, 0.3);
      border-top: 3px solid #64ffda;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 1rem;
    }

    /* Readings Grid */
    .readings-grid {
      display: grid;
      gap: 1rem;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    }

    .reading-item {
      background: rgba(23, 42, 69, 0.5);
      border: 1px solid rgba(61, 244, 244, 0.2);
      border-radius: 12px;
      padding: 1.5rem;
      transition: all 0.3s ease;
      border-left: 4px solid #64ffda;
      display: flex;
      align-items: center;
      gap: 1rem;
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
      word-break: break-word;
      line-height: 1.2;
    }

    .reading-value .value.gps-coordinates {
      font-size: 1.2rem;
      font-family: 'Courier New', monospace;
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

    /* Map Card */
    .map-card {
      background: rgba(48, 60, 85, 0.4);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(61, 244, 244, 0.2);
      border-radius: 16px;
      overflow: hidden;
    }

    .map-card .card-header {
      background: rgba(61, 244, 244, 0.1);
      border-bottom: 1px solid rgba(61, 244, 244, 0.2);
      padding: 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .location-info {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .coordinates {
      font-family: 'Courier New', monospace;
      font-size: 0.9rem;
      color: #64ffda;
      background: rgba(100, 255, 218, 0.1);
      padding: 0.5rem 1rem;
      border-radius: 8px;
      border: 1px solid rgba(100, 255, 218, 0.3);
    }

    .map-content {
      position: relative;
    }

    .map-container {
      height: 400px;
      width: 100%;
      border-radius: 0 0 16px 16px;
      overflow: hidden;
      position: relative;
      z-index: 1;
    }

    #helmet-map {
      height: 400px !important;
      width: 100% !important;
      border-radius: 0 0 16px 16px;
      background: #0a192f;
      display: block;
      position: relative;
    }

    .location-notice {
      position: absolute;
      top: 1rem;
      left: 1rem;
      background: rgba(15, 23, 42, 0.9);
      color: #64ffda;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      border: 1px solid rgba(100, 255, 218, 0.3);
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.85rem;
      z-index: 1000;
      backdrop-filter: blur(10px);
    }

    /* Custom Leaflet marker icon */
    ::ng-deep .custom-div-icon {
      background: transparent !important;
      border: none !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
    }

    /* Charts Card */
    .charts-card {
      background: rgba(48, 60, 85, 0.4);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(61, 244, 244, 0.2);
      border-radius: 16px;
      overflow: hidden;
    }

    .charts-card .card-header {
      background: rgba(61, 244, 244, 0.1);
      border-bottom: 1px solid rgba(61, 244, 244, 0.2);
      padding: 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .chart-content {
      padding: 2rem;
    }

    .chart-container {
      position: relative;
      height: 400px;
      width: 100%;
    }

    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem;
      color: #8892b0;
    }

    .no-chart-data {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem;
      color: #8892b0;
      text-align: center;
    }

    .no-chart-data i {
      font-size: 3rem;
      color: #64ffda;
      margin-bottom: 1rem;
      opacity: 0.6;
    }

    .no-chart-data p {
      margin-bottom: 1.5rem;
      font-size: 1.1rem;
    }

    .retry-btn {
      background: rgba(100, 255, 218, 0.1);
      border: 1px solid rgba(100, 255, 218, 0.3);
      color: #64ffda;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.9rem;
    }

    .retry-btn:hover {
      background: rgba(100, 255, 218, 0.2);
      border-color: rgba(100, 255, 218, 0.5);
      transform: translateY(-1px);
    }

    /* Error State */
    .error-state {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 400px;
      padding: 2rem;
    }

    .error-content {
      text-align: center;
      max-width: 500px;
      padding: 3rem;
      background: rgba(48, 60, 85, 0.4);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 107, 107, 0.3);
      border-radius: 16px;
    }

    .error-icon {
      width: 120px;
      height: 120px;
      margin: 0 auto 2rem;
      background: rgba(255, 107, 107, 0.2);
      border: 2px solid rgba(255, 107, 107, 0.3);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .error-icon i {
      font-size: 3rem;
      color: #ff6b6b;
    }

    .error-content h3 {
      font-size: 1.8rem;
      color: #ccd6f6;
      margin-bottom: 1rem;
    }

    .error-content p {
      color: #8892b0;
      font-size: 1.1rem;
      line-height: 1.6;
      margin-bottom: 2rem;
    }

    .btn-back {
      background: rgba(61, 244, 244, 0.2);
      border: 1px solid rgba(61, 244, 244, 0.3);
      color: #3df4f4;
      padding: 1rem 2rem;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 1rem;
      font-weight: 500;
    }

    .btn-back:hover {
      background: rgba(61, 244, 244, 0.3);
      border-color: rgba(61, 244, 244, 0.4);
      transform: translateY(-2px);
    }

    .spinning {
      animation: spin 1s linear infinite;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .helmet-readings-container {
        padding: 0;
      }

      .helmet-section {
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

      .helmet-stats {
        grid-template-columns: 1fr;
      }

      .readings-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class HelmetReadingsComponent implements OnInit, AfterViewInit, OnDestroy {
  helmetId: string | null = null;
  helmet: Helmet | null = null;
  assignedMiner: Minero | null = null;
  readings: SensorReading[] = [];
  isLoading = false;
  isLoadingReadings = false;
  
  // Chart properties
  chartData: ChartData | null = null;
  chartOptions: ChartConfiguration['options'] = {};
  chartType: ChartType = 'bar';
  isLoadingCharts = false;

  // Map properties
  private map: L.Map | null = null;
  private marker: L.Marker | null = null;
  private mapInitialized = false;
  currentLocation: { lat: number; lng: number } | null = null;
  
  // Universidad Tecnológica de Torreón coordinates
  private readonly defaultLocation = {
    lat: 25.532861,
    lng: -103.322991
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private helmetService: HelmetService,
    private sensorService: SensorService,
    private mineroService: MineroService,
    private alert: AlertService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.helmetId = this.route.snapshot.paramMap.get('id');
    if (this.helmetId) {
      this.loadHelmetData();
      this.setupChartOptions();
    } else {
      this.goBack();
    }
  }

  ngAfterViewInit() {
    // Initialize map after view is ready and data is loaded
    this.initializeMapWhenReady();
  }

  private initializeMapWhenReady(): void {
    // Check if map is already initialized
    if (this.mapInitialized) {
      console.log('Map already initialized, skipping...');
      return;
    }

    console.log('Starting map initialization process...');
    console.log('Current user role:', this.authService.getCurrentUser()?.role);

    // Wait for the helmet data to be loaded and DOM to be ready
    const checkAndInit = () => {
      const mapElement = document.getElementById('helmet-map');
      console.log('Checking map element:', mapElement, 'isLoading:', this.isLoading, 'mapInitialized:', this.mapInitialized);
      console.log('Helmet data:', this.helmet ? 'loaded' : 'not loaded');
      
      if (mapElement && !this.isLoading && !this.mapInitialized) {
        console.log('All conditions met, initializing map...');
        this.initializeMap();
      } else if (!this.mapInitialized) {
        console.log('Retrying map initialization... Element:', !!mapElement, 'Loading:', this.isLoading);
        setTimeout(checkAndInit, 200);
      }
    };
    
    setTimeout(checkAndInit, 100);
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
      this.map = null;
      this.mapInitialized = false;
    }
  }

  loadHelmetData() {
    this.isLoading = true;
    
    this.helmetService.getHelmetById(this.helmetId!).subscribe({
      next: (helmet) => {
        this.helmet = helmet;
        this.isLoading = false;
        this.cdr.detectChanges();
        
        // Load assigned miner info if exists
        if (helmet.assignedToId) {
          this.loadAssignedMiner(helmet.assignedToId);
        }
        
        // Load readings and charts
        this.loadReadings(helmet.id);
        this.loadChartData(helmet.id);
      },
      error: (err) => {
        console.error('Error loading helmet:', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadAssignedMiner(minerId: string) {
    this.mineroService.getMineroById(minerId).subscribe({
      next: (miner) => {
        this.assignedMiner = miner;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading assigned miner:', err);
      }
    });
  }

  loadReadings(cascoId: string) {
    // Use setTimeout to avoid ExpressionChangedAfterItHasBeenCheckedError
    setTimeout(() => {
      this.isLoadingReadings = true;
      this.cdr.detectChanges();
    });
    
    const start = new Date('1970-01-01T00:00:00Z');
    const end = new Date('2100-01-01T00:00:00Z');
    
    this.sensorService
      .getReadingsByCreated('cascoId', cascoId, start.toISOString(), end.toISOString(), 500)
      .subscribe({
        next: (data) => {
          // Group readings by sensor type and get only the latest reading for each
          this.readings = this.groupAndFilterLatestReadings(data);
          this.isLoadingReadings = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.readings = [];
          this.isLoadingReadings = false;
          this.cdr.detectChanges();
        }
      });
  }

  private groupAndFilterLatestReadings(readings: SensorReading[]): SensorReading[] {
    const groupedBySensor = new Map<string, SensorReading[]>();
    
    // Group readings by sensor type
    readings.forEach(reading => {
      const sensorType = this.getSensorType(reading);
      if (!groupedBySensor.has(sensorType)) {
        groupedBySensor.set(sensorType, []);
      }
      groupedBySensor.get(sensorType)!.push(reading);
    });
    
    // Get the latest reading for each sensor type
    const latestReadings: SensorReading[] = [];
    groupedBySensor.forEach((sensorReadings, sensorType) => {
      // Sort by timestamp descending and take the first (most recent)
      const sortedReadings = sensorReadings.sort((a, b) => {
        const dateA = new Date(a.timestamp || a.createdAt || 0).getTime();
        const dateB = new Date(b.timestamp || b.createdAt || 0).getTime();
        return dateB - dateA;
      });
      
      if (sortedReadings.length > 0) {
        latestReadings.push(sortedReadings[0]);
      }
    });
    
    // Sort by sensor priority for consistent display order
    return latestReadings.sort((a, b) => {
      const sensorOrder = ['gps', 'heart_rate', 'gas', 'body_temperature', 'battery', 'accelerometer', 'gyroscope'];
      const typeA = this.getSensorType(a);
      const typeB = this.getSensorType(b);
      const indexA = sensorOrder.indexOf(typeA);
      const indexB = sensorOrder.indexOf(typeB);
      
      if (indexA === -1 && indexB === -1) return 0;
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });
  }

  // Métodos para el diseño
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
    // First check the identificador field which seems to be the sensor type identifier
    if ((reading as any).identificador) {
      const id = ((reading as any).identificador as string).toUpperCase();
      if (id === 'GPS') return 'gps';
      if (id === 'MAX') return 'heart_rate';
      if (id === 'MQ7') return 'gas';
      if (id === 'TMP') return 'body_temperature';
    }

    // Fallback to unit-based detection
    if (reading.unit === 'bpm') return 'heart_rate';
    if (reading.unit === '°C' || reading.unit === 'C') return 'body_temperature';
    if (reading.unit === 'ppm' || reading.unit === 'mg/m³') return 'gas';
    if (reading.unit === 'gps') return 'gps';
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

  formatSensorValue(reading: SensorReading): string {
    const sensorType = this.getSensorType(reading);
    
    // Handle GPS specially - show coordinates
    if (sensorType === 'gps') {
      if (reading.location && typeof reading.location === 'object') {
        const lat = reading.location.latitude;
        const lng = reading.location.longitude;
        
        // If coordinates are 0,0 or very close to 0, show "No disponible" and use default location
        if (Math.abs(lat) < 0.000001 && Math.abs(lng) < 0.000001) {
          // Reset to default location for map
          this.currentLocation = null;
          this.updateMapToDefault();
          return 'No disponible';
        }
        
        // Update current location for the map with real coordinates
        this.currentLocation = { lat, lng };
        this.updateMapLocation();
        
        return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      }
      
      // No location data available, use default
      this.currentLocation = null;
      this.updateMapToDefault();
      return 'No disponible';
    }
    
    // Handle numeric values with proper decimal formatting
    if (typeof reading.value === 'number') {
      // For temperature, show 1 decimal place
      if (sensorType === 'body_temperature') {
        return reading.value.toFixed(1);
      }
      
      // For heart rate, show whole numbers
      if (sensorType === 'heart_rate') {
        return Math.round(reading.value).toString();
      }
      
      // For gas sensors, show 1 decimal place if needed
      if (sensorType === 'gas') {
        return reading.value % 1 === 0 ? reading.value.toString() : reading.value.toFixed(1);
      }
      
      // For other sensors, show up to 2 decimal places, removing unnecessary zeros
      return parseFloat(reading.value.toFixed(2)).toString();
    }
    
    return String(reading.value) || '0';
  }

  formatSensorUnit(reading: SensorReading): string {
    const sensorType = this.getSensorType(reading);
    
    // GPS doesn't need a unit when showing coordinates
    if (sensorType === 'gps') {
      return '';
    }
    
    // Clean up temperature unit
    if (reading.unit === 'C') {
      return '°C';
    }
    
    return reading.unit || '';
  }

  refreshReadings(): void {
    if (this.helmet && this.helmet.id) {
      this.loadReadings(this.helmet.id);
      
      // Only invalidate size if map exists, don't reinitialize
      setTimeout(() => {
        if (this.map && this.mapInitialized) {
          this.map.invalidateSize();
        }
      }, 500);
    }
  }

  setupChartOptions(): void {
    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: '#64ffda',
            font: {
              size: 12
            }
          }
        },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.9)',
          titleColor: '#64ffda',
          bodyColor: '#8892b0',
          borderColor: '#64ffda',
          borderWidth: 1
        }
      },
      scales: {
        x: {
          type: 'category',
          grid: {
            color: 'rgba(100, 255, 218, 0.1)'
          },
          ticks: {
            color: '#8892b0',
            callback: function(value: any, index: number) {
              // Format timestamp to show hour:minute
              if (typeof value === 'number') {
                const date = new Date(value);
                return date.toLocaleTimeString('es-ES', {
                  hour: '2-digit',
                  minute: '2-digit'
                });
              }
              return value;
            }
          }
        },
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(100, 255, 218, 0.1)'
          },
          ticks: {
            color: '#8892b0'
          }
        }
      },
      elements: {
        bar: {
          borderRadius: 4,
          borderSkipped: false
        }
      }
    };
  }

  loadChartData(cascoId: string, skipLoadingState = false): void {
    // Solo establecer loading si no se está llamando desde refreshCharts
    if (!skipLoadingState) {
      // Usar setTimeout para evitar ExpressionChangedAfterItHasBeenCheckedError
      setTimeout(() => {
        this.isLoadingCharts = true;
        this.cdr.detectChanges();
      });
    }
    
    this.sensorService.getTriSeries(cascoId).subscribe({
      next: (response: TriSeriesResponse) => {
        if (response.success && response.data) {
          this.setupChartData(response.data);
        }
        this.isLoadingCharts = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading chart data:', err);
        this.isLoadingCharts = false;
        this.cdr.detectChanges();
      }
    });
  }

  setupChartData(data: TriSeriesResponse['data']): void {
    const labels: string[] = [];
    const gasData: number[] = [];
    const tempData: number[] = [];
    const bpmData: number[] = [];

    // Collect all unique timestamps and sort them
    const allTimestamps = new Set<string>();
    
    if (data.mq7?.points) {
      data.mq7.points.forEach(point => allTimestamps.add(point.t));
    }
    if (data.temp?.points) {
      data.temp.points.forEach(point => allTimestamps.add(point.t));
    }
    if (data.bpm?.points) {
      data.bpm.points.forEach(point => allTimestamps.add(point.t));
    }

    const sortedTimestamps = Array.from(allTimestamps).sort();

    // Create labels and data arrays
    sortedTimestamps.forEach(timestamp => {
      const date = new Date(timestamp);
      labels.push(date.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      }));

      // Find corresponding values for each sensor type
      const gasPoint = data.mq7?.points.find(p => p.t === timestamp);
      const tempPoint = data.temp?.points.find(p => p.t === timestamp);
      const bpmPoint = data.bpm?.points.find(p => p.t === timestamp);

      gasData.push(gasPoint?.y || 0);
      tempData.push(tempPoint?.y || 0);
      bpmData.push(bpmPoint?.y || 0);
    });

    const datasets = [];

    // Gas (MQ7)
    if (data.mq7 && data.mq7.points.length > 0) {
      datasets.push({
        label: `Gas (${data.mq7.unit})`,
        data: gasData,
        backgroundColor: 'rgba(255, 107, 107, 0.7)',
        borderColor: '#ff6b6b',
        borderWidth: 2
      });
    }

    // Temperature
    if (data.temp && data.temp.points.length > 0) {
      datasets.push({
        label: `Temperatura (${data.temp.unit})`,
        data: tempData,
        backgroundColor: 'rgba(78, 205, 196, 0.7)',
        borderColor: '#4ecdc4',
        borderWidth: 2
      });
    }

    // Heart Rate (BPM)
    if (data.bpm && data.bpm.points.length > 0) {
      datasets.push({
        label: `Ritmo Cardíaco (${data.bpm.unit})`,
        data: bpmData,
        backgroundColor: 'rgba(100, 255, 218, 0.7)',
        borderColor: '#64ffda',
        borderWidth: 2
      });
    }

    this.chartData = {
      labels: labels,
      datasets: datasets
    };
  }

  refreshCharts(): void {
    if (this.helmet && this.helmet.id) {
      // Resetear el estado antes de cargar
      this.isLoadingCharts = true;
      this.cdr.detectChanges();
      this.loadChartData(this.helmet.id, true);
    }
  }

  goBack(): void {
    this.router.navigate(['/helmets']);
  }

  private initializeMap(): void {
    try {
      console.log('Starting map initialization...');
      
      // Check if already initialized
      if (this.mapInitialized) {
        console.log('Map already initialized, aborting...');
        return;
      }

      // Fix Leaflet default icon issue
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });

      const mapElement = document.getElementById('helmet-map');
      if (!mapElement) {
        console.warn('Map element not found during initialization');
        return;
      }

      console.log('Map element found:', mapElement);

      // Clear any existing map
      if (this.map) {
        console.log('Removing existing map...');
        this.map.remove();
        this.map = null;
      }

      // Clear the container
      mapElement.innerHTML = '';

      // Use current location if available, otherwise default location
      const location = this.currentLocation || this.defaultLocation;
      console.log('Using location:', location);

      // Initialize map
      console.log('Creating Leaflet map...');
      this.map = L.map('helmet-map', {
        center: [location.lat, location.lng],
        zoom: 15,
        zoomControl: true,
        attributionControl: true,
        preferCanvas: false
      });

      // Mark as initialized immediately
      this.mapInitialized = true;

      console.log('Map created, adding tile layer...');
      // Use CartoDB Positron for better styling and reliability
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap contributors © CARTO',
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(this.map);

      console.log('Tile layer added, setting up final initialization...');
      
      // Add event listeners for tile loading
      this.map.on('load', () => {
        console.log('Map loaded successfully');
      });
      
      this.map.on('tileload', () => {
        console.log('Tile loaded');
      });
      
      this.map.on('tileerror', (e) => {
        console.error('Tile error:', e);
      });

      // Force map to invalidate size after initialization
      setTimeout(() => {
        if (this.map) {
          console.log('Final map setup - invalidating size and adding marker...');
          this.map.invalidateSize();
          this.addMarker(location.lat, location.lng);
          console.log('Map initialization completed successfully');
        }
      }, 500);

    } catch (error) {
      console.error('Error initializing map:', error);
      this.mapInitialized = false;
    }
  }

  private addMarker(lat: number, lng: number): void {
    if (!this.map) return;

    // Remove existing marker
    if (this.marker) {
      this.map.removeLayer(this.marker);
    }

    // Create custom icon for helmet location
    const helmetIcon = L.divIcon({
      html: '<i class="fas fa-hard-hat" style="color: #3df4f4; font-size: 20px;"></i>',
      iconSize: [30, 30],
      className: 'custom-div-icon'
    });

    // Add new marker
    this.marker = L.marker([lat, lng], { icon: helmetIcon }).addTo(this.map);
    
    // Add popup with information
    const isDefault = !this.currentLocation;
    const popupContent = isDefault 
      ? '<b>Universidad Tecnológica de Torreón</b><br>Ubicación por defecto'
      : '<b>Ubicación del Casco</b><br>Posición GPS actual';
    
    this.marker.bindPopup(popupContent);
  }

  private updateMapLocation(): void {
    if (!this.map || !this.currentLocation) return;

    try {
      // Invalidate size first to ensure proper rendering
      this.map.invalidateSize();
      
      // Update map view to new location
      this.map.setView([this.currentLocation.lat, this.currentLocation.lng], 15);
      
      // Update marker
      this.addMarker(this.currentLocation.lat, this.currentLocation.lng);
      
      // Force change detection
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error updating map location:', error);
    }
  }

  private updateMapToDefault(): void {
    if (!this.map) return;

    try {
      // Invalidate size first to ensure proper rendering
      this.map.invalidateSize();
      
      // Update map view to default location (UTT)
      this.map.setView([this.defaultLocation.lat, this.defaultLocation.lng], 15);
      
      // Update marker to default location
      this.addMarker(this.defaultLocation.lat, this.defaultLocation.lng);
      
      // Force change detection
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error updating map to default location:', error);
    }
  }
}
