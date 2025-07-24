import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-splash-screen',
  standalone: true,
  template: `
    <div class="splash-screen">
      <span class="splash-logo text-blur-out" (animationend)="onAnimationEnd()">Helm</span>
    </div>
  `,
  styleUrls: ['./splash-screen.component.css']
})
export class SplashScreenComponent {
  @Output() animationDone = new EventEmitter<void>();

  onAnimationEnd() {
    this.animationDone.emit();
  }
} 