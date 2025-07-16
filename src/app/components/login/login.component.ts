import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginData = {
    email: '',
    password: ''
  };
  
  isLoading = false;
  errorMessage = '';
  showPassword = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  onSubmit() {
    if (!this.loginData.email || !this.loginData.password) {
      this.errorMessage = 'Por favor completa todos los campos';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.loginData.email, this.loginData.password).subscribe({
      next: (user) => {
        this.isLoading = false;
        console.log('Usuario logueado:', user);
        
        // Redirigir según el rol
        if (user.role === 'admin') {
          this.router.navigate(['/dashboard']);
        } else if (user.role === 'supervisor') {
          this.router.navigate(['/dashboard']);
        } else if (user.role === 'minero') {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Error al iniciar sesión. Verifica tus credenciales.';
        console.error('Error de login:', error);
      }
    });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  // Métodos para simular diferentes tipos de login
  loginAsSupervisor() {
    this.loginData.email = 'supervisor@helmmining.com';
    this.loginData.password = 'password123';
    this.onSubmit();
  }

  loginAsMinero() {
    this.loginData.email = 'minero@helmmining.com';
    this.loginData.password = 'password123';
    this.onSubmit();
  }

  loginAsAdmin() {
    this.loginData.email = 'admin@helmmining.com';
    this.loginData.password = 'password123';
    this.onSubmit();
  }

  clearForm() {
    this.loginData = {
      email: '',
      password: ''
    };
    this.errorMessage = '';
  }
} 