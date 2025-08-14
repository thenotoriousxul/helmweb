import { Injectable } from '@angular/core'
import Swal, { SweetAlertIcon } from 'sweetalert2'

@Injectable({ providedIn: 'root' })
export class AlertService {
  private baseToast(opts: { icon: SweetAlertIcon; title: string }) {
    return Swal.fire({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
      ...opts,
      background: 'rgba(17, 34, 64, 0.98)',
      color: '#ccd6f6',
    })
  }

  success(message: string) { return this.baseToast({ icon: 'success', title: message }) }
  error(message: string) { return this.baseToast({ icon: 'error', title: message }) }
  info(message: string) { return this.baseToast({ icon: 'info', title: message }) }
  warning(message: string) { return this.baseToast({ icon: 'warning', title: message }) }

  async confirm(message: string, confirmText: string = 'Sí', cancelText: string = 'No'): Promise<boolean> {
    const res = await Swal.fire({
      title: message,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: cancelText,
      background: 'rgba(17, 34, 64, 0.98)',
      color: '#ccd6f6',
    })
    return !!res.isConfirmed
  }
}


