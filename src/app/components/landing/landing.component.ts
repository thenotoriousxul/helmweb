import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SplashScreenComponent } from '../splash-screen/splash-screen.component';
import { AuthService } from '../../services/auth.service';

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
  // Reemplazar "movimiento" por HR/MQ7 en el mock, mantenemos solo temperatura/gps en demo
  gps: { x: number, y: number } = { x: 50, y: 50 };
  displayedGps: { x: number, y: number } = { x: 50, y: 50 };
  private movementStates: string[] = [];
  private gpsDirection = 1;
  private animationFrameId: any;
  private movementIntervalId: any;
  private authSubscription: any;
  showSplash = true;
  expandedSensor: string | null = null;
  showPhoneModal = false;
  isAuthenticated = false;
  userRole = '';
  mobileMenuOpen = false;
  sensorHistory = {
    temperature: [36.5, 36.8, 37.1, 36.9, 37.2, 36.7, 37.0, 36.6, 37.3, 36.8],
    movement: ['Normal', 'Movimiento', 'Normal', 'Caída', 'Normal', 'Inactivo', 'Normal', 'Movimiento', 'Normal', 'Caída'],
    gps: [{x: 50, y: 50}, {x: 52, y: 48}, {x: 55, y: 52}, {x: 58, y: 49}, {x: 61, y: 51}, {x: 64, y: 47}, {x: 67, y: 53}, {x: 70, y: 50}, {x: 73, y: 54}, {x: 76, y: 48}]
  };

  features = [
    {
      iconClass: 'fas fa-thermometer-half',
      iconType: 'temp',
      title: 'Temperatura Corporal',
      description: 'Lectura en tiempo real (tempC) con umbrales y alertas configurables.',
      toggled: false
    },
    {
      iconClass: 'fas fa-heartbeat',
      iconType: 'hr',
      title: 'Frecuencia Cardíaca',
      description: 'Monitoreo de ritmo cardiaco (bpm) para detectar anomalías y fatiga.',
      toggled: false
    },
    {
      iconClass: 'fas fa-burn',
      iconType: 'mq7',
      title: 'Gas MQ7 (CO)',
      description: 'Medición de MQ7 (ppm) para alerta temprana por presencia de monóxido de carbono.',
      toggled: false
    },
    {
      iconClass: 'fas fa-map-marker-alt',
      iconType: 'gps',
      title: 'Rastreo GPS',
      description: 'Ubicación con gpsFix, satélites y coordenadas para visualización en mapa.',
      toggled: false
    }
  ];

  constructor(
    private router: Router, 
    private cdr: ChangeDetectorRef,
    public authService: AuthService
  ) {}

  ngOnInit() {
    // Verificar estado de autenticación
    this.checkAuthStatus();
    
    // Suscribirse a cambios de autenticación
    this.authSubscription = this.authService.currentUser$.subscribe(() => {
      this.checkAuthStatus();
    });
    
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
      // Simular solo temperatura y un ligero movimiento del GPS
      this.temperature = +(35.5 + Math.random() * 3).toFixed(1);
      if (this.gps.x > 80) this.gpsDirection = -1;
      if (this.gps.x < 20) this.gpsDirection = 1;
      this.gps.x += this.gpsDirection * (Math.random() * 2 + 0.5);
      this.gps.y += (Math.random() - 0.5) * 2;
      if (this.gps.y < 20) this.gps.y = 20;
      if (this.gps.y > 80) this.gps.y = 80;
      this.cdr.detectChanges();
    }, 2000);
  }

  checkAuthStatus() {
    this.isAuthenticated = this.authService.isAuthenticated();
    if (this.isAuthenticated) {
      const user = this.authService.getCurrentUser();
      this.userRole = user?.role || '';
    }
  }

  get displayUserName(): string {
    return this.authService.getCurrentUser()?.fullName || 'Usuario';
  }

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu() {
    this.mobileMenuOpen = false;
  }

  showLogin() {
    if (!this.isAuthenticated) {
      this.closeMobileMenu();
      this.router.navigate(['/login']);
    }
  }

  showRegister() {
    if (!this.isAuthenticated) {
      this.closeMobileMenu();
      this.router.navigate(['/register']);
    }
  }

  goToDashboard() {
    if (this.isAuthenticated) {
      this.closeMobileMenu();
      this.router.navigate(['/equipments']);
    }
  }

  logout() {
    this.authService.logout();
    this.checkAuthStatus();
    this.closeMobileMenu();
    this.router.navigate(['/']);
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
      case 'hr':
        return {
          current: 72,
          average: 74,
          min: 60,
          max: 100,
          trend: 'stable'
        } as any;
      case 'mq7':
        return {
          current: 3977,
          average: 4000,
          min: 3500,
          max: 4500,
          trend: 'stable'
        } as any;
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
    if (this.authSubscription) this.authSubscription.unsubscribe();
  }
} 