import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  loginError = '';

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      // Simular login exitoso
      this.router.navigate(['/dashboard']);
    } else {
      this.loginError = 'Por favor, completa todos los campos correctamente.';
    }
  }

  getErrorMessage(field: string): string {
    const control = this.loginForm.get(field);
    if (control?.errors && control.touched) {
      if (control.errors['required']) return 'Este campo es requerido.';
      if (control.errors['email']) return 'Ingresa un email válido.';
      if (control.errors['minlength']) return 'Mínimo 6 caracteres.';
    }
    return '';
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }

  goToLanding() {
    this.router.navigate(['/']);
  }
} 