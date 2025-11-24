import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TimeslotService } from '../../services/timeslot.service';
import { CategoryService } from '../../services/category.service';
import { Category, TimeSlot } from '../../models/models';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {
  timeslots: TimeSlot[] = [];
  categories: Category[] = [];
  timeslotForm!: FormGroup;
  loading = false;
  displayedColumns: string[] = ['title', 'category', 'start_time', 'end_time', 'status', 'booking', 'actions'];

  constructor(
    private fb: FormBuilder,
    private timeslotService: TimeslotService,
    private categoryService: CategoryService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadCategories();
    this.loadTimeslots();
  }

  initForm(): void {
    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

    this.timeslotForm = this.fb.group({
      category_id: ['', [Validators.required]],
      title: ['', [Validators.required]],
      description: [''],
      start_time: [now.toISOString().slice(0, 16), [Validators.required]],
      end_time: [oneHourLater.toISOString().slice(0, 16), [Validators.required]]
    });
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: () => {
        this.snackBar.open('Failed to load categories', 'Close', { duration: 3000 });
      }
    });
  }

  loadTimeslots(): void {
    this.loading = true;
    this.timeslotService.getTimeslots().subscribe({
      next: (timeslots) => {
        this.timeslots = timeslots.sort((a, b) => 
          new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
        );
        this.loading = false;
      },
      error: () => {
        this.snackBar.open('Failed to load timeslots', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  createTimeslot(): void {
    if (this.timeslotForm.valid) {
      this.loading = true;
      const formValue = this.timeslotForm.value;
      
      // Convert string dates to Date objects
      const timeslot = {
        ...formValue,
        category_id: parseInt(formValue.category_id),
        start_time: new Date(formValue.start_time),
        end_time: new Date(formValue.end_time)
      };

      // Validate time range
      if (timeslot.end_time <= timeslot.start_time) {
        this.snackBar.open('End time must be after start time', 'Close', { duration: 3000 });
        this.loading = false;
        return;
      }

      this.timeslotService.createTimeslot(timeslot).subscribe({
        next: () => {
          this.snackBar.open('Timeslot created successfully!', 'Close', { duration: 3000 });
          this.timeslotForm.reset();
          this.initForm();
          this.loadTimeslots();
          this.loading = false;
        },
        error: (error) => {
          this.snackBar.open('Failed to create timeslot: ' + (error.error?.detail || 'Please try again'), 'Close', { duration: 5000 });
          this.loading = false;
        }
      });
    }
  }

  deleteTimeslot(id: number): void {
    if (confirm('Are you sure you want to delete this timeslot?')) {
      this.timeslotService.deleteTimeslot(id).subscribe({
        next: () => {
          this.snackBar.open('Timeslot deleted successfully', 'Close', { duration: 3000 });
          this.loadTimeslots();
        },
        error: () => {
          this.snackBar.open('Failed to delete timeslot', 'Close', { duration: 3000 });
        }
      });
    }
  }

  formatDateTime(date: Date | string): string {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getStatusColor(timeslot: TimeSlot): string {
    return timeslot.is_available ? 'primary' : 'accent';
  }

  getStatusText(timeslot: TimeSlot): string {
    return timeslot.is_available ? 'Available' : 'Booked';
  }
}
