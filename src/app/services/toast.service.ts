import { Injectable } from '@angular/core'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
  id: number
  message: string
  type: ToastType
  timeoutMs: number
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private toasts: Toast[] = []
  private nextId = 1

  getToasts() { return this.toasts }

  show(message: string, type: ToastType = 'info', timeoutMs = 3000) {
    const toast: Toast = { id: this.nextId++, message, type, timeoutMs }
    this.toasts.push(toast)
    setTimeout(() => this.dismiss(toast.id), timeoutMs)
  }

  success(message: string, timeoutMs = 3000) { this.show(message, 'success', timeoutMs) }
  error(message: string, timeoutMs = 4000) { this.show(message, 'error', timeoutMs) }
  info(message: string, timeoutMs = 3000) { this.show(message, 'info', timeoutMs) }
  warning(message: string, timeoutMs = 3500) { this.show(message, 'warning', timeoutMs) }

  dismiss(id: number) {
    this.toasts = this.toasts.filter(t => t.id !== id)
  }
}


