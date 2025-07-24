import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SplashScreenComponent } from '../splash-screen/splash-screen.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule, SplashScreenComponent],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css']
})
export class LandingComponent implements OnInit, OnDestroy {
  temperature: number = 36.5;
  displayedTemperature: number = 36.5;
  movement: string = 'Normal';
  lastMovement: string = 'Normal';
  gps: { x: number, y: number } = { x: 50, y: 50 };
  displayedGps: { x: number, y: number } = { x: 50, y: 50 };
  private movementStates = ['Normal', 'Caída', 'Inactivo', 'Movimiento'];
  private gpsDirection = 1;
  private animationFrameId: any;
  private movementIntervalId: any;
  showSplash = true;
  expandedSensor: string | null = null;
  showPhoneModal = false;
  sensorHistory = {
    temperature: [36.5, 36.8, 37.1, 36.9, 37.2, 36.7, 37.0, 36.6, 37.3, 36.8],
    movement: ['Normal', 'Movimiento', 'Normal', 'Caída', 'Normal', 'Inactivo', 'Normal', 'Movimiento', 'Normal', 'Caída'],
    gps: [{x: 50, y: 50}, {x: 52, y: 48}, {x: 55, y: 52}, {x: 58, y: 49}, {x: 61, y: 51}, {x: 64, y: 47}, {x: 67, y: 53}, {x: 70, y: 50}, {x: 73, y: 54}, {x: 76, y: 48}]
  };

  features = [
    {
      iconClass: 'fas fa-thermometer-half',
      iconType: 'temp',
      title: 'Monitoreo de Temperatura',
      description: 'Control en tiempo real de la temperatura corporal de cada minero con alertas automáticas.',
      toggled: false
    },
    {
      iconClass: 'fas fa-running',
      iconType: 'movement',
      title: 'Detección de Movimiento',
      description: 'Sensores de acelerómetro que detectan caídas y movimientos anómalos instantáneamente.',
      toggled: false
    },
    {
      iconClass: 'fas fa-map-marker-alt',
      iconType: 'gps',
      title: 'Rastreo GPS',
      description: 'Ubicación precisa de cada minero en tiempo real con geofencing inteligente.',
      toggled: false
    },
    {
      iconClass: 'fas fa-tachometer-alt',
      iconType: 'pressure',
      title: 'Monitoreo Ambiental',
      description: 'Control de presión atmosférica y humedad para condiciones óptimas de trabajo.',
      toggled: false
    },
    {
      iconClass: 'fas fa-battery-three-quarters',
      iconType: 'battery',
      title: 'Batería de Larga Duración',
      description: 'Hasta 48 horas de autonomía con alertas de batería baja y carga rápida.',
      toggled: false
    },
    {
      iconClass: 'fas fa-chart-line',
      iconType: 'analytics',
      title: 'Analytics Avanzados',
      description: 'Reportes detallados y análisis predictivo para optimizar la seguridad.',
      toggled: false
    }
  ];

  constructor(private router: Router, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    if (sessionStorage.getItem('helmSplashShown')) {
      this.showSplash = false;
    }

    const animate = () => {
      this.displayedTemperature += (this.temperature - this.displayedTemperature) * 0.2;
      this.displayedGps.x += (this.gps.x - this.displayedGps.x) * 0.25;
      this.displayedGps.y += (this.gps.y - this.displayedGps.y) * 0.25;
      this.cdr.detectChanges();
      this.animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    this.movementIntervalId = setInterval(() => {
      console.log('Actualizando valores...');
      this.temperature = +(35.5 + Math.random() * 3).toFixed(1);
      this.lastMovement = this.movement;
      this.movement = this.movementStates[Math.floor(Math.random() * this.movementStates.length)];
      if (this.gps.x > 80) this.gpsDirection = -1;
      if (this.gps.x < 20) this.gpsDirection = 1;
      this.gps.x += this.gpsDirection * (Math.random() * 2 + 0.5);
      this.gps.y += (Math.random() - 0.5) * 2;
      if (this.gps.y < 20) this.gps.y = 20;
      if (this.gps.y > 80) this.gps.y = 80;

      console.log('Nueva temperatura:', this.temperature, 'Nuevo movimiento:', this.movement);
      this.cdr.detectChanges();
    }, 2000);
  }

  showLogin() {
    this.router.navigate(['/login']);
  }

  showRegister() {
    this.router.navigate(['/register']);
  }

  onSplashDone() {
    this.showSplash = false;
    sessionStorage.setItem('helmSplashShown', '1');
  }

  toggleSensor(sensorType: string) {
    if (this.expandedSensor === sensorType) {
      this.expandedSensor = null;
    } else {
      this.expandedSensor = sensorType;
    }
  }

  getSensorData(sensorType: string) {
    switch(sensorType) {
      case 'temperature':
        return {
          current: this.displayedTemperature,
          average: (this.sensorHistory.temperature.reduce((a, b) => a + b, 0) / this.sensorHistory.temperature.length).toFixed(1),
          min: Math.min(...this.sensorHistory.temperature).toFixed(1),
          max: Math.max(...this.sensorHistory.temperature).toFixed(1),
          trend: this.sensorHistory.temperature[this.sensorHistory.temperature.length - 1] > this.sensorHistory.temperature[0] ? '↑' : '↓'
        };
      case 'movement':
        const normalCount = this.sensorHistory.movement.filter(m => m === 'Normal').length;
        const totalCount = this.sensorHistory.movement.length;
        return {
          current: this.movement,
          normalPercentage: Math.round((normalCount / totalCount) * 100),
          alerts: this.sensorHistory.movement.filter(m => m !== 'Normal').length,
          lastAlert: this.sensorHistory.movement.find(m => m !== 'Normal') || 'Ninguna'
        };
      case 'gps':
        const lastPos = this.sensorHistory.gps[this.sensorHistory.gps.length - 1];
        const firstPos = this.sensorHistory.gps[0];
        const distance = Math.sqrt(Math.pow(lastPos.x - firstPos.x, 2) + Math.pow(lastPos.y - firstPos.y, 2));
        return {
          current: {x: this.displayedGps.x, y: this.displayedGps.y},
          distance: distance.toFixed(1),
          speed: (distance / this.sensorHistory.gps.length).toFixed(1),
          zone: this.displayedGps.x < 50 ? 'Zona A' : 'Zona B'
        };
      default:
        return null;
    }
  }

  getTemperatureChartPoints(): string {
    return this.sensorHistory.temperature.map((t, i) => i * 10 + ',' + (30 - (t - 35) * 10)).join(' ');
  }

  getGpsChartPoints(): string {
    return this.sensorHistory.gps.map(p => p.x + ',' + p.y).join(' ');
  }

  scheduleDemo() {
    // Abrir calendario o enviar email para programar demo
    window.open('mailto:proyectohelm0@gmail.com?subject=Programar Demo Helm&body=Hola, me interesa programar una demostración de Helm para mi empresa.', '_blank');
  }

  openLocation() {
    // Abrir Google Maps con la ubicación de la Universidad Tecnológica de Torreón
    window.open('https://maps.google.com/?q=Universidad+Tecnologica+de+Torreon,Torreon,Coahuila,Mexico', '_blank');
  }

  openPhoneModal() {
    this.showPhoneModal = true;
  }

  closePhoneModal() {
    this.showPhoneModal = false;
  }

  openSocial(platform: string) {
    const urls = {
      linkedin: 'https://linkedin.com/company/helm-mining',
      twitter: 'https://twitter.com/helm_mining',
      facebook: 'https://facebook.com/helmmining',
      instagram: 'https://instagram.com/helm_mining'
    };

    if (urls[platform as keyof typeof urls]) {
      window.open(urls[platform as keyof typeof urls], '_blank');
    }
  }

  ngOnDestroy() {
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    if (this.movementIntervalId) clearInterval(this.movementIntervalId);
  }
} 