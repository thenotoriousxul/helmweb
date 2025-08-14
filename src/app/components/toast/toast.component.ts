import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ToastService } from '../../services/toast.service'

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      <div class="toast" 
           *ngFor="let t of toastService.getToasts()" 
           [class]="'toast ' + t.type"
           (click)="dismissToast(t.id)"
           title="Clic para cerrar">
        <span class="icon" [innerHTML]="getIcon(t.type)"></span>
        <span class="message">{{ t.message }}</span>
        <span class="close-icon">
          <i class="fas fa-times"></i>
        </span>
      </div>
    </div>
  `,
  styleUrls: ['./toast.component.css']
})
export class ToastContainerComponent {
  constructor(public toastService: ToastService) {}

  getIcon(type: string) {
    switch (type) {
      case 'success': return '<i class="fas fa-check-circle"></i>';
      case 'error': return '<i class="fas fa-exclamation-circle"></i>';
      case 'warning': return '<i class="fas fa-exclamation-triangle"></i>';
      default: return '<i class="fas fa-info-circle"></i>';
    }
  }

  dismissToast(id: number) {
    this.toastService.dismiss(id);
  }
}


