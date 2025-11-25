import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { User } from './models/models';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Event Booking';
  currentUser: User | null = null;

  constructor(
    public authService: AuthService,
    private router: Router
  ) {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  logout(): void {
    this.authService.logout();
  }

  navigateToPreferences(): void {
    this.router.navigate(['/preferences']);
  }

  navigateToCalendar(): void {
    this.router.navigate(['/calendar']);
  }

  navigateToAdmin(): void {
    this.router.navigate(['/admin']);
  }
}
