import { Component, OnInit } from '@angular/core';
import { TimeslotService } from '../../services/timeslot.service';
import { BookingService } from '../../services/booking.service';
import { UserPreferencesService } from '../../services/user-preferences.service';
import { CategoryService } from '../../services/category.service';
import { AuthService } from '../../services/auth.service';
import { TimeSlot, Category } from '../../models/models';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit {
  timeslots: TimeSlot[] = [];
  filteredTimeslots: TimeSlot[] = [];
  categories: Category[] = [];
  selectedCategoryIds: number[] = [];
  currentWeekStart: Date = new Date();
  currentWeekEnd: Date = new Date();
  weekDays: Date[] = [];
  loading = false;

  constructor(
    private timeslotService: TimeslotService,
    private bookingService: BookingService,
    private userPreferencesService: UserPreferencesService,
    private categoryService: CategoryService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadUserPreferences();
    this.setCurrentWeek();
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      }
    });
  }

  loadUserPreferences(): void {
    this.userPreferencesService.getUserPreferences().subscribe({
      next: (prefs) => {
        this.selectedCategoryIds = prefs.categories.map(c => c.id);
        this.loadTimeslots();
      },
      error: () => {
        this.loadTimeslots(); // Load all if preferences fail
      }
    });
  }

  setCurrentWeek(): void {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Start from Monday
    
    this.currentWeekStart = new Date(today);
    this.currentWeekStart.setDate(today.getDate() + diff);
    this.currentWeekStart.setHours(0, 0, 0, 0);
    
    this.currentWeekEnd = new Date(this.currentWeekStart);
    this.currentWeekEnd.setDate(this.currentWeekStart.getDate() + 6);
    this.currentWeekEnd.setHours(23, 59, 59, 999);
    
    this.generateWeekDays();
    this.loadTimeslots();
  }

  generateWeekDays(): void {
    this.weekDays = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(this.currentWeekStart);
      day.setDate(this.currentWeekStart.getDate() + i);
      this.weekDays.push(day);
    }
  }

  loadTimeslots(): void {
    this.loading = true;
    const categoryIds = this.selectedCategoryIds.length > 0 ? this.selectedCategoryIds : undefined;
    
    this.timeslotService.getTimeslots(this.currentWeekStart, this.currentWeekEnd, categoryIds).subscribe({
      next: (timeslots) => {
        this.timeslots = timeslots;
        this.applyFilters();
        this.loading = false;
      },
      error: () => {
        this.snackBar.open('Failed to load timeslots', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    this.filteredTimeslots = this.timeslots;
  }

  toggleCategoryFilter(categoryId: number): void {
    const index = this.selectedCategoryIds.indexOf(categoryId);
    if (index > -1) {
      this.selectedCategoryIds.splice(index, 1);
    } else {
      this.selectedCategoryIds.push(categoryId);
    }
    this.loadTimeslots();
  }

  isCategorySelected(categoryId: number): boolean {
    return this.selectedCategoryIds.length === 0 || this.selectedCategoryIds.includes(categoryId);
  }

  previousWeek(): void {
    this.currentWeekStart.setDate(this.currentWeekStart.getDate() - 7);
    this.currentWeekEnd.setDate(this.currentWeekEnd.getDate() - 7);
    this.generateWeekDays();
    this.loadTimeslots();
  }

  nextWeek(): void {
    this.currentWeekStart.setDate(this.currentWeekStart.getDate() + 7);
    this.currentWeekEnd.setDate(this.currentWeekEnd.getDate() + 7);
    this.generateWeekDays();
    this.loadTimeslots();
  }

  goToToday(): void {
    this.setCurrentWeek();
  }

  getTimeslotsForDay(day: Date): TimeSlot[] {
    return this.filteredTimeslots.filter(slot => {
      const slotDate = new Date(slot.start_time);
      return slotDate.getDate() === day.getDate() &&
             slotDate.getMonth() === day.getMonth() &&
             slotDate.getFullYear() === day.getFullYear();
    });
  }

  bookTimeslot(timeslot: TimeSlot): void {
    if (!timeslot.is_available) {
      this.snackBar.open('This timeslot is already booked', 'Close', { duration: 3000 });
      return;
    }

    this.bookingService.createBooking(timeslot.id).subscribe({
      next: () => {
        this.snackBar.open('Booking successful!', 'Close', { duration: 3000 });
        this.loadTimeslots();
      },
      error: (error) => {
        this.snackBar.open('Booking failed: ' + (error.error?.detail || 'Please try again'), 'Close', { duration: 5000 });
      }
    });
  }

  cancelBooking(timeslot: TimeSlot): void {
    if (!timeslot.booking) return;

    const currentUser = this.authService.getCurrentUser();
    if (timeslot.booking.user_id !== currentUser?.id) {
      this.snackBar.open('You can only cancel your own bookings', 'Close', { duration: 3000 });
      return;
    }

    this.bookingService.cancelBooking(timeslot.booking.id).subscribe({
      next: () => {
        this.snackBar.open('Booking cancelled successfully', 'Close', { duration: 3000 });
        this.loadTimeslots();
      },
      error: () => {
        this.snackBar.open('Failed to cancel booking', 'Close', { duration: 3000 });
      }
    });
  }

  isUserBooking(timeslot: TimeSlot): boolean {
    const currentUser = this.authService.getCurrentUser();
    return timeslot.booking?.user_id === currentUser?.id;
  }

  formatTime(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  }

  getWeekRange(): string {
    const start = this.currentWeekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const end = this.currentWeekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${start} - ${end}`;
  }
}
