import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, Helmet, Miner } from '../../services/auth.service';
import * as L from 'leaflet';

interface SensorData {
  id: string;
  name: string;
  value: number;
  unit: string;
  status: 'normal' | 'warning' | 'danger';
  timestamp: string;
  trend: 'up' | 'down' | 'stable';
}

interface GPSLocation {
  lat: number;
  lng: number;
  altitude: number;
  timestamp: string;
  minerId: string;
  minerName: string;
}

@Component({
  selector: 'app-monitoring',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './monitoring.component.html',
  styleUrls: ['./monitoring.component.css']
})
export class MonitoringComponent implements OnInit, OnDestroy, AfterViewInit {
  selectedSensor = 'all';
  selectedMiner = 'all';
  showMap = false;
  realTimeData: SensorData[] = [];
  gpsLocations: GPSLocation[] = [];
  miners: Miner[] = [];
  helmets: Helmet[] = [];
  mapStatus: { type: string; message: string; icon: string } | null = null;
  private intervalId: any;
  private map: L.Map | null = null;
  private markers: L.Marker[] = [];

  constructor(
    private router: Router,
    public authService: AuthService
  ) {}

  ngOnInit() {
    this.loadData();
    this.startRealTimeUpdates();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.initMap();
    }, 100);
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    if (this.map) {
      this.map.remove();
    }
  }

  loadData() {
    // Simular datos de mineros
    this.miners = [
      {
        id: '1',
        name: 'Carlos',
        lastName: 'Mendoza',
        email: 'carlos.mendoza@helmmining.com',
        birthDate: '1985-03-15',
        hireDate: '2020-01-15',
        phone: '+52 55 1234 5678',
        rfc: 'MEMC850315ABC',
        address: {
          country: 'México',
          state: 'Sonora',
          city: 'Hermosillo',
          neighborhood: 'Centro',
          street: 'Revolución',
          number: '123',
          zipCode: '83000'
        },
        photo: 'CM',
        helmetId: '1',
        teamId: '1',
        supervisorId: '1',
        status: 'online'
      },
      {
        id: '2',
        name: 'Ana',
        lastName: 'Rodríguez',
        email: 'ana.rodriguez@helmmining.com',
        birthDate: '1990-07-22',
        hireDate: '2021-03-10',
        phone: '+52 55 9876 5432',
        rfc: 'ROAA900722DEF',
        address: {
          country: 'México',
          state: 'Sonora',
          city: 'Hermosillo',
          neighborhood: 'San Benito',
          street: 'Independencia',
          number: '456',
          zipCode: '83100'
        },
        photo: 'AR',
        helmetId: '2',
        teamId: '1',
        supervisorId: '1',
        status: 'online'
      }
    ];

    // Simular datos de cascos
    this.helmets = [
      {
        id: '1',
        uuid: 'helmet-001',
        serialNumber: 'HELM-001',
        status: 'activo-asignado',
        assignedTo: 'Carlos Mendoza',
        assignedToId: '1',
        equipmentId: '1',
        equipmentName: 'Equipo A',
        supervisorId: '1',
        lastHeartbeat: new Date().toISOString(),
        batteryLevel: 85,
        temperature: 36.5,
        location: 'Zona Norte',
        sensors: {
          gps: { lat: 29.0729, lng: -110.9559 },
          temperature: 36.5,
          heartRate: 72,
          acceleration: { x: 0.1, y: 0.2, z: 9.8 }
        }
      },
      {
        id: '2',
        uuid: 'helmet-002',
        serialNumber: 'HELM-002',
        status: 'activo-asignado',
        assignedTo: 'Ana Rodríguez',
        assignedToId: '2',
        equipmentId: '1',
        equipmentName: 'Equipo A',
        supervisorId: '1',
        lastHeartbeat: new Date().toISOString(),
        batteryLevel: 92,
        temperature: 37.1,
        location: 'Zona Sur',
        sensors: {
          gps: { lat: 29.0735, lng: -110.9565 },
          temperature: 37.1,
          heartRate: 68,
          acceleration: { x: 0.05, y: 0.1, z: 9.8 }
        }
      }
    ];

    // Filtrar según el rol del usuario
    if (this.authService.isMinero()) {
      const currentUser = this.authService.getCurrentUser();
      this.miners = this.miners.filter(miner => miner.id === currentUser?.id);
      this.helmets = this.helmets.filter(helmet => helmet.assignedToId === currentUser?.id);
    } else if (this.authService.isSupervisor()) {
      const currentUser = this.authService.getCurrentUser();
      this.miners = this.miners.filter(miner => miner.supervisorId === currentUser?.id);
      this.helmets = this.helmets.filter(helmet => helmet.supervisorId === currentUser?.id);
    }

    this.generateGPSLocations();
    this.generateSensorData();
  }

  startRealTimeUpdates() {
    this.intervalId = setInterval(() => {
      this.updateSensorData();
      this.updateGPSLocations();
    }, 5000); // Actualizar cada 5 segundos
  }

  generateSensorData() {
    this.realTimeData = [];
    
    this.helmets.forEach(helmet => {
      const miner = this.miners.find(m => m.id === helmet.assignedToId);
      if (miner) {
        // Temperatura corporal
        this.realTimeData.push({
          id: `${helmet.id}-temp`,
          name: `Temperatura - ${miner.name}`,
          value: helmet.sensors?.temperature || 36.5,
          unit: '°C',
          status: this.getSensorStatus(helmet.sensors?.temperature || 36.5, 35, 38),
          timestamp: new Date().toISOString(),
          trend: 'stable'
        });

        // Frecuencia cardíaca
        this.realTimeData.push({
          id: `${helmet.id}-hr`,
          name: `Frecuencia Cardíaca - ${miner.name}`,
          value: helmet.sensors?.heartRate || 70,
          unit: 'bpm',
          status: this.getSensorStatus(helmet.sensors?.heartRate || 70, 60, 100),
          timestamp: new Date().toISOString(),
          trend: 'stable'
        });

        // Nivel de batería
        this.realTimeData.push({
          id: `${helmet.id}-battery`,
          name: `Batería - ${miner.name}`,
          value: helmet.batteryLevel || 85,
          unit: '%',
          status: this.getBatteryStatus(helmet.batteryLevel || 85),
          timestamp: new Date().toISOString(),
          trend: 'down'
        });
      }
    });
  }

  generateGPSLocations() {
    this.gpsLocations = this.helmets.map(helmet => {
      const miner = this.miners.find(m => m.id === helmet.assignedToId);
      return {
        lat: helmet.sensors?.gps.lat || 29.0729,
        lng: helmet.sensors?.gps.lng || -110.9559,
        altitude: 500 + Math.random() * 100, // Altura simulada
        timestamp: new Date().toISOString(),
        minerId: helmet.assignedToId || '',
        minerName: miner?.name + ' ' + miner?.lastName || 'Desconocido'
      };
    });
  }

  updateSensorData() {
    this.realTimeData.forEach(data => {
      // Simular variaciones en los datos
      const variation = (Math.random() - 0.5) * 2;
      data.value = Math.max(0, Math.min(100, data.value + variation));
      data.timestamp = new Date().toISOString();
      data.status = this.getSensorStatus(data.value, 35, 38);
    });
  }

  updateGPSLocations() {
    this.gpsLocations.forEach(location => {
      // Simular movimiento en el GPS
      const latVariation = (Math.random() - 0.5) * 0.001;
      const lngVariation = (Math.random() - 0.5) * 0.001;
      location.lat += latVariation;
      location.lng += lngVariation;
      location.timestamp = new Date().toISOString();
    });
    
    // Actualizar marcadores del mapa si está visible
    if (this.showMap && this.map) {
      this.updateMapMarkers();
    }
  }

  getSensorStatus(value: number, min: number, max: number): 'normal' | 'warning' | 'danger' {
    if (value < min || value > max) return 'danger';
    if (value < min + (max - min) * 0.1 || value > max - (max - min) * 0.1) return 'warning';
    return 'normal';
  }

  getBatteryStatus(level: number): 'normal' | 'warning' | 'danger' {
    if (level < 20) return 'danger';
    if (level < 50) return 'warning';
    return 'normal';
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'normal': return '#28a745';
      case 'warning': return '#ffc107';
      case 'danger': return '#dc3545';
      default: return '#6c757d';
    }
  }

  getTrendIcon(trend: string): string {
    switch (trend) {
      case 'up': return 'fas fa-arrow-up';
      case 'down': return 'fas fa-arrow-down';
      case 'stable': return 'fas fa-minus';
      default: return 'fas fa-minus';
    }
  }

  getTrendColor(trend: string): string {
    switch (trend) {
      case 'up': return '#28a745';
      case 'down': return '#dc3545';
      case 'stable': return '#6c757d';
      default: return '#6c757d';
    }
  }

  toggleMap() {
    this.showMap = !this.showMap;
    if (this.showMap) {
      setTimeout(() => {
        this.initMap();
        // Forzar un refresh adicional después de un poco más de tiempo
        setTimeout(() => {
          this.map?.invalidateSize();
        }, 200);
      }, 100);
    }
  }

  getFilteredData(): SensorData[] {
    let filtered = this.realTimeData;

    if (this.selectedSensor !== 'all') {
      filtered = filtered.filter(data => data.name.includes(this.selectedSensor));
    }

    if (this.selectedMiner !== 'all') {
      filtered = filtered.filter(data => data.name.includes(this.selectedMiner));
    }

    return filtered;
  }

  getDangerAlerts(): SensorData[] {
    return this.getFilteredData().filter(s => s.status === 'danger');
  }

  getWarningAlerts(): SensorData[] {
    return this.getFilteredData().filter(s => s.status === 'warning');
  }

  getDangerSensors(): SensorData[] {
    return this.getFilteredData().filter(s => s.status === 'danger');
  }

  getWarningSensors(): SensorData[] {
    return this.getFilteredData().filter(s => s.status === 'warning');
  }

  hasAlerts(): boolean {
    return this.getFilteredData().some(s => s.status === 'danger' || s.status === 'warning');
  }

  hasAnyAlerts(): boolean {
    return this.getFilteredData().some(s => s.status === 'danger' || s.status === 'warning');
  }

  getSensorOptions(): { value: string; label: string }[] {
    const sensors = ['Temperatura', 'Frecuencia Cardíaca', 'Batería'];
    return [
      { value: 'all', label: 'Todos los sensores' },
      ...sensors.map(sensor => ({ value: sensor, label: sensor }))
    ];
  }

  getMinerOptions(): { value: string; label: string }[] {
    return [
      { value: 'all', label: 'Todos los mineros' },
      ...this.miners.map(miner => ({ 
        value: miner.name, 
        label: `${miner.name} ${miner.lastName}` 
      }))
    ];
  }

  formatTimestamp(timestamp: string): string {
    return new Date(timestamp).toLocaleTimeString('es-MX');
  }

  initMap() {
    if (!this.showMap) return;
    
    const mapContainer = document.getElementById('map');
    if (!mapContainer) return;

    // Limpiar mapa anterior si existe
    if (this.map) {
      this.map.remove();
    }

    // Crear mapa
    this.map = L.map('map', {
      center: [29.0729, -110.9559],
      zoom: 13,
      zoomControl: true,
      attributionControl: true
    });

    // Agregar múltiples opciones de capas de mapa (con proveedores más confiables)
    const osmLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    });

    const cartoLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '© CartoDB',
      subdomains: 'abcd',
      maxZoom: 19
    });

    const darkLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '© CartoDB',
      subdomains: 'abcd',
      maxZoom: 19
    });

    // Capa de respaldo simple
    const fallbackLayer = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png', {
      attribution: '© Stadia Maps',
      maxZoom: 20
    });

    // Capa offline como último recurso
    const offlineLayer = L.tileLayer('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', {
      attribution: 'Modo Offline',
      tileSize: 256,
      maxZoom: 18
    });

    // Agregar la capa base por defecto con manejo de errores (modo oscuro)
    darkLayer.addTo(this.map);

    // Manejo de errores para las capas
    darkLayer.on('tileerror', () => {
      console.log('Error cargando capa oscura, cambiando a OpenStreetMap...');
      this.mapStatus = {
        type: 'warning',
        message: 'Cambiando a mapa de calles...',
        icon: 'fas fa-exclamation-triangle'
      };
      this.map?.removeLayer(darkLayer);
      osmLayer.addTo(this.map!);
    });

    osmLayer.on('tileerror', () => {
      console.log('Error cargando OpenStreetMap, cambiando a CartoDB...');
      this.mapStatus = {
        type: 'warning',
        message: 'Cambiando a mapa claro...',
        icon: 'fas fa-exclamation-triangle'
      };
      this.map?.removeLayer(osmLayer);
      cartoLayer.addTo(this.map!);
    });

    cartoLayer.on('tileerror', () => {
      console.log('Error cargando CartoDB, cambiando a Stadia Maps...');
      this.mapStatus = {
        type: 'warning',
        message: 'Cambiando a mapa de respaldo...',
        icon: 'fas fa-exclamation-triangle'
      };
      this.map?.removeLayer(cartoLayer);
      fallbackLayer.addTo(this.map!);
    });

    fallbackLayer.on('tileerror', () => {
      console.log('Error cargando Stadia Maps, usando modo offline...');
      this.mapStatus = {
        type: 'error',
        message: 'Modo offline - Sin conexión a mapas',
        icon: 'fas fa-wifi-slash'
      };
      this.map?.removeLayer(fallbackLayer);
      offlineLayer.addTo(this.map!);
    });

    // Mostrar mensaje de éxito cuando se carga correctamente
    darkLayer.on('load', () => {
      this.mapStatus = {
        type: 'info',
        message: 'Mapa oscuro cargado correctamente',
        icon: 'fas fa-check-circle'
      };
      setTimeout(() => {
        this.mapStatus = null;
      }, 3000);
    });

    // Agregar control de capas
    const baseMaps = {
      "Oscuro": darkLayer,
      "Calles": osmLayer,
      "Claro": cartoLayer,
      "Respaldo": fallbackLayer,
      "Offline": offlineLayer
    };

    L.control.layers(baseMaps).addTo(this.map);

    // Agregar marcadores para cada ubicación
    this.updateMapMarkers();

    // Forzar un refresh del mapa
    setTimeout(() => {
      this.map?.invalidateSize();
    }, 100);

    // Verificar si el mapa se cargó correctamente después de un tiempo
    setTimeout(() => {
      if (this.map && !this.map.hasLayer(darkLayer) && !this.map.hasLayer(osmLayer) && !this.map.hasLayer(cartoLayer)) {
        console.log('Ninguna capa se cargó, usando capa de respaldo...');
        fallbackLayer.addTo(this.map);
      }
    }, 2000);
  }

  updateMapMarkers() {
    if (!this.map) return;

    // Limpiar marcadores anteriores
    this.markers.forEach(marker => marker.remove());
    this.markers = [];

    // Crear icono personalizado para los marcadores
    const createCustomIcon = (color: string) => {
      return L.divIcon({
        html: `
          <div style="
            background: ${color};
            width: 20px;
            height: 20px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 10px;
          ">
            <i class="fas fa-user"></i>
          </div>
        `,
        className: 'custom-marker',
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });
    };

    // Agregar nuevos marcadores
    this.gpsLocations.forEach((location, index) => {
      const markerColor = index === 0 ? '#3df4f4' : '#64ffda';
      const icon = createCustomIcon(markerColor);
      
      const marker = L.marker([location.lat, location.lng], { icon })
        .bindPopup(`
          <div style="text-align: center; min-width: 200px;">
            <div style="
              background: linear-gradient(135deg, #3df4f4 0%, #64ffda 100%);
              color: #0a192f;
              padding: 0.5rem;
              border-radius: 8px 8px 0 0;
              margin: -0.75rem -0.75rem 0.5rem -0.75rem;
              font-weight: bold;
            ">
              <i class="fas fa-user"></i> ${location.minerName}
            </div>
            <div style="padding: 0.5rem;">
              <p style="margin: 0.25rem 0; color: #666; font-size: 0.9rem;">
                <strong>Latitud:</strong> ${location.lat.toFixed(6)}
              </p>
              <p style="margin: 0.25rem 0; color: #666; font-size: 0.9rem;">
                <strong>Longitud:</strong> ${location.lng.toFixed(6)}
              </p>
              <p style="margin: 0.25rem 0; color: #666; font-size: 0.9rem;">
                <strong>Altura:</strong> ${location.altitude.toFixed(0)}m
              </p>
              <hr style="margin: 0.5rem 0; border-color: #eee;">
              <small style="color: #999; font-style: italic;">
                <i class="fas fa-clock"></i> ${this.formatTimestamp(location.timestamp)}
              </small>
            </div>
          </div>
        `, {
          maxWidth: 250,
          className: 'custom-popup'
        })
        .addTo(this.map!);
      
      this.markers.push(marker);
    });
  }
} 