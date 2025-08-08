import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface Report {
  id: string;
  title: string;
  type: 'daily' | 'weekly' | 'monthly' | 'custom';
  description: string;
  generatedAt: string;
  status: 'generating' | 'completed' | 'failed';
  fileSize?: string;
  downloadUrl?: string;
  data: {
    totalEquipments: number;
    totalHelmets: number;
    activeHelmets: number;
    totalAlerts: number;
    criticalAlerts: number;
    averageTemperature: number;
    averageBatteryLevel: number;
    topEquipment: string;
    topLocation: string;
  };
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string[];
    borderColor: string[];
    borderWidth: number;
  }[];
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent {
  reports: Report[] = [
    {
      id: '1',
      title: 'Reporte Diario - 15 Enero 2024',
      type: 'daily',
      description: 'Resumen de actividades y alertas del día',
      generatedAt: '2024-01-15 23:59:00',
      status: 'completed',
      fileSize: '2.3 MB',
      downloadUrl: '#',
      data: {
        totalEquipments: 6,
        totalHelmets: 238,
        activeHelmets: 219,
        totalAlerts: 8,
        criticalAlerts: 1,
        averageTemperature: 36.8,
        averageBatteryLevel: 78,
        topEquipment: 'Equipo Mina Norte',
        topLocation: 'Zona A-12'
      }
    },
    {
      id: '2',
      title: 'Reporte Semanal - Semana 2',
      type: 'weekly',
      description: 'Análisis semanal de rendimiento y seguridad',
      generatedAt: '2024-01-14 23:59:00',
      status: 'completed',
      fileSize: '8.7 MB',
      downloadUrl: '#',
      data: {
        totalEquipments: 6,
        totalHelmets: 238,
        activeHelmets: 225,
        totalAlerts: 23,
        criticalAlerts: 3,
        averageTemperature: 37.1,
        averageBatteryLevel: 82,
        topEquipment: 'Equipo Mina Este',
        topLocation: 'Zona C-15'
      }
    },
    {
      id: '3',
      title: 'Reporte Mensual - Diciembre 2023',
      type: 'monthly',
      description: 'Resumen mensual completo de operaciones',
      generatedAt: '2024-01-01 00:00:00',
      status: 'completed',
      fileSize: '15.2 MB',
      downloadUrl: '#',
      data: {
        totalEquipments: 6,
        totalHelmets: 238,
        activeHelmets: 230,
        totalAlerts: 89,
        criticalAlerts: 12,
        averageTemperature: 36.9,
        averageBatteryLevel: 85,
        topEquipment: 'Equipo Mina Central',
        topLocation: 'Zona E-7'
      }
    },
    {
      id: '4',
      title: 'Reporte Personalizado - Análisis de Temperaturas',
      type: 'custom',
      description: 'Análisis detallado de patrones de temperatura',
      generatedAt: '2024-01-15 14:30:00',
      status: 'generating',
      data: {
        totalEquipments: 6,
        totalHelmets: 238,
        activeHelmets: 219,
        totalAlerts: 8,
        criticalAlerts: 1,
        averageTemperature: 36.8,
        averageBatteryLevel: 78,
        topEquipment: 'Equipo Mina Norte',
        topLocation: 'Zona A-12'
      }
    }
  ];

  filteredReports: Report[] = [];
  searchTerm = '';
  typeFilter = 'all';
  statusFilter = 'all';
  showCreateModal = false;
  newReport: Partial<Report> = {};

  // Chart data
  equipmentChartData: ChartData = {
    labels: ['Equipo Mina Norte', 'Equipo Mina Sur', 'Equipo Mina Este', 'Equipo Mina Oeste', 'Equipo Mina Central', 'Equipo Mina Profunda'],
    datasets: [{
      label: 'Cascos Activos',
      data: [42, 35, 48, 25, 39, 30],
      backgroundColor: [
        'rgba(100, 255, 218, 0.8)',
        'rgba(255, 142, 83, 0.8)',
        'rgba(255, 217, 61, 0.8)',
        'rgba(136, 146, 176, 0.8)',
        'rgba(100, 255, 218, 0.8)',
        'rgba(255, 107, 107, 0.8)'
      ],
      borderColor: [
        'rgba(100, 255, 218, 1)',
        'rgba(255, 142, 83, 1)',
        'rgba(255, 217, 61, 1)',
        'rgba(136, 146, 176, 1)',
        'rgba(100, 255, 218, 1)',
        'rgba(255, 107, 107, 1)'
      ],
      borderWidth: 2
    }]
  };

  alertChartData: ChartData = {
    labels: ['Críticas', 'Altas', 'Medias', 'Bajas'],
    datasets: [{
      label: 'Alertas por Severidad',
      data: [1, 2, 3, 2],
      backgroundColor: [
        'rgba(255, 107, 107, 0.8)',
        'rgba(255, 142, 83, 0.8)',
        'rgba(255, 217, 61, 0.8)',
        'rgba(100, 255, 218, 0.8)'
      ],
      borderColor: [
        'rgba(255, 107, 107, 1)',
        'rgba(255, 142, 83, 1)',
        'rgba(255, 217, 61, 1)',
        'rgba(100, 255, 218, 1)'
      ],
      borderWidth: 2
    }]
  };

  constructor(private router: Router) {
    this.filteredReports = [...this.reports];
  }

  // Propiedades computadas para estadísticas
  get totalReports(): number {
    return this.reports.length;
  }

  get completedReports(): number {
    return this.reports.filter(r => r.status === 'completed').length;
  }

  get generatingReports(): number {
    return this.reports.filter(r => r.status === 'generating').length;
  }

  get totalFileSize(): number {
    return this.reports.reduce((sum, r) => {
      const size = parseFloat(r.fileSize?.replace(' MB', '') || '0');
      return sum + size;
    }, 0);
  }

  onSearchChange() {
    this.filterReports();
  }

  onTypeFilterChange() {
    this.filterReports();
  }

  onStatusFilterChange() {
    this.filterReports();
  }

  filterReports() {
    this.filteredReports = this.reports.filter(report => {
      const matchesSearch = report.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           report.description.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesType = this.typeFilter === 'all' || report.type === this.typeFilter;
      const matchesStatus = this.statusFilter === 'all' || report.status === this.statusFilter;
      return matchesSearch && matchesType && matchesStatus;
    });
  }

  getTypeColor(type: string): string {
    switch (type) {
      case 'daily': return '#64ffda';
      case 'weekly': return '#ffd93d';
      case 'monthly': return '#ff8e53';
      case 'custom': return '#8892b0';
      default: return '#8892b0';
    }
  }

  getTypeText(type: string): string {
    switch (type) {
      case 'daily': return 'Diario';
      case 'weekly': return 'Semanal';
      case 'monthly': return 'Mensual';
      case 'custom': return 'Personalizado';
      default: return 'Desconocido';
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'completed': return '#64ffda';
      case 'generating': return '#ffd93d';
      case 'failed': return '#ff6b6b';
      default: return '#8892b0';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'completed': return 'Completado';
      case 'generating': return 'Generando';
      case 'failed': return 'Fallido';
      default: return 'Desconocido';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'completed': return 'fas fa-check-circle';
      case 'generating': return 'fas fa-hourglass-half';
      case 'failed': return 'fas fa-times-circle';
      default: return 'fas fa-question-circle';
    }
  }

  downloadReport(report: Report) {
    if (report.status === 'completed' && report.downloadUrl) {
      // Simular descarga
      console.log(`Descargando reporte: ${report.title}`);
    }
  }

  deleteReport(report: Report) {
    if (confirm(`¿Estás seguro de que quieres eliminar el reporte "${report.title}"?`)) {
      this.reports = this.reports.filter(r => r.id !== report.id);
      this.filterReports();
    }
  }

  openCreateModal() {
    this.showCreateModal = true;
    this.newReport = {};
  }

  closeCreateModal() {
    this.showCreateModal = false;
    this.newReport = {};
  }

  createReport() {
    if (this.newReport.title && this.newReport.type) {
      const newRep: Report = {
        id: Date.now().toString(),
        title: this.newReport.title!,
        type: this.newReport.type!,
        description: this.newReport.description || 'Reporte personalizado',
        generatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
        status: 'generating',
        data: {
          totalEquipments: 6,
          totalHelmets: 238,
          activeHelmets: 219,
          totalAlerts: 8,
          criticalAlerts: 1,
          averageTemperature: 36.8,
          averageBatteryLevel: 78,
          topEquipment: 'Equipo Mina Norte',
          topLocation: 'Zona A-12'
        }
      };
      
      this.reports.unshift(newRep);
      this.filterReports();
      this.closeCreateModal();
      
      // Simular generación
      setTimeout(() => {
        newRep.status = 'completed';
        newRep.fileSize = '1.5 MB';
        newRep.downloadUrl = '#';
      }, 3000);
    }
  }
} 