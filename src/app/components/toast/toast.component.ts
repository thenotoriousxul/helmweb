import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ToastService } from '../../services/toast.service'

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      <div class="toast" *ngFor="let t of toastService.getToasts()" [class]="'toast ' + t.type">
        <span class="icon" [innerHTML]="getIcon(t.type)"></span>
        <span class="message">{{ t.message }}</span>
      </div>
    </div>
  `,
  styleUrls: ['./toast.component.css']
})
export class ToastContainerComponent {
  constructor(public toastService: ToastService) {}

  getIcon(type: string) {
    switch (type) {
      case 'success': return '✔️';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      default: return 'ℹ️';
    }
  }
}


