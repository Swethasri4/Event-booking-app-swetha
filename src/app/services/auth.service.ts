import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { AuthResponse, User } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    this.loadCurrentUser();
  }

  login(email: string, password: string): Observable<AuthResponse> {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);

    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, formData).pipe(
      tap(response => {
        localStorage.setItem('access_token', response.access_token);
        this.loadCurrentUser();
      })
    );
  }

  register(email: string, name: string, password: string, isAdmin: boolean = false): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/auth/register`, {
      email,
      name,
      password,
      is_admin: isAdmin
    });
  }

  logout(): void {
    localStorage.removeItem('access_token');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user ? user.is_admin : false;
  }

  private loadCurrentUser(): void {
    if (this.isLoggedIn()) {
      this.http.get<User>(`${this.apiUrl}/auth/me`).subscribe({
        next: user => this.currentUserSubject.next(user),
        error: () => {
          localStorage.removeItem('access_token');
          this.currentUserSubject.next(null);
        }
      });
    }
  }
}
