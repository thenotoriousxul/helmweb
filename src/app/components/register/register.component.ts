import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registerForm: FormGroup;
  registerError = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required, Validators.minLength(3)]],
      accessCode: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(control: AbstractControl) {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    if (confirmPassword?.errors?.['passwordMismatch']) {
      delete confirmPassword.errors['passwordMismatch'];
      if (Object.keys(confirmPassword.errors).length === 0) {
        confirmPassword.setErrors(null);
      }
    }
    
    return null;
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.registerError = '';
      const formValue = this.registerForm.value;
      const data = {
        fullName: formValue.firstName + ' ' + formValue.lastName,
        email: formValue.email,
        password: formValue.password,
        codigo: formValue.accessCode
      };
      
      this.authService.register(data).subscribe({
        next: (user) => {
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.registerError = error.message || 'Error al registrar usuario. Verifica los datos e inténtalo de nuevo.';
        }
      });
    } else {
      this.registerError = 'Por favor, completa todos los campos correctamente.';
    }
  }

  getRegisterErrorMessage(field: string): string {
    const control = this.registerForm.get(field);
    if (control?.errors && control.touched) {
      if (control.errors['required']) return 'Este campo es requerido.';
      if (control.errors['email']) return 'Ingresa un email válido.';
      if (control.errors['minlength']) {
        const minLength = control.errors['minlength'].requiredLength;
        return `Mínimo ${minLength} caracteres.`;
      }
      if (control.errors['pattern']) {
        return 'Formato inválido.';
      }
      if (control.errors['passwordMismatch']) return 'Las contraseñas no coinciden.';
    }
    return '';
  }

  getFieldStatus(field: string): 'valid' | 'invalid' | 'neutral' {
    const control = this.registerForm.get(field);
    if (!control) return 'neutral';
    
    if (control.touched || control.dirty) {
      return control.valid ? 'valid' : 'invalid';
    }
    return 'neutral';
  }

  getPasswordStrength(): 'weak' | 'medium' | 'strong' | 'none' {
    const password = this.registerForm.get('password')?.value;
    if (!password) return 'none';
    
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const length = password.length;
    
    if (length >= 8 && hasLetter && hasNumber && hasSpecial) return 'strong';
    if (length >= 6 && ((hasLetter && hasNumber) || (hasLetter && hasSpecial) || (hasNumber && hasSpecial))) return 'medium';
    if (length >= 4) return 'weak';
    return 'weak';
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  goToLanding() {
    this.router.navigate(['/']);
  }
} 