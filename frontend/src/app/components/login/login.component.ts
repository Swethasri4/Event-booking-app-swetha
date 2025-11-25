import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  registerForm!: FormGroup;
  isRegisterMode = false;
  loading = false;
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/calendar']);
    }

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.registerForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      isAdmin: [false]
    });
  }

  onLogin(): void {
    if (this.loginForm.valid) {
      this.loading = true;
      const { email, password } = this.loginForm.value;
      
      this.authService.login(email, password).subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(['/calendar']);
          this.snackBar.open('Login successful!', 'Close', { duration: 3000 });
        },
        error: (error) => {
          this.loading = false;
          this.snackBar.open('Login failed: ' + (error.error?.detail || 'Invalid credentials'), 'Close', { duration: 5000 });
        }
      });
    }
  }

  onRegister(): void {
    if (this.registerForm.valid) {
      this.loading = true;
      const { name, email, password, isAdmin } = this.registerForm.value;
      
      this.authService.register(email, name, password, isAdmin).subscribe({
        next: () => {
          this.loading = false;
          this.isRegisterMode = false;
          this.snackBar.open('Registration successful! Please login.', 'Close', { duration: 3000 });
        },
        error: (error) => {
          this.loading = false;
          this.snackBar.open('Registration failed: ' + (error.error?.detail || 'Please try again'), 'Close', { duration: 5000 });
        }
      });
    }
  }

  toggleMode(): void {
    this.isRegisterMode = !this.isRegisterMode;
  }
}
