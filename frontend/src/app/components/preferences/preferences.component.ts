import { Component, OnInit } from '@angular/core';
import { CategoryService } from '../../services/category.service';
import { UserPreferencesService } from '../../services/user-preferences.service';
import { Category } from '../../models/models';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-preferences',
  templateUrl: './preferences.component.html',
  styleUrls: ['./preferences.component.scss']
})
export class PreferencesComponent implements OnInit {
  categories: Category[] = [];
  selectedCategoryIds: Set<number> = new Set();
  loading = false;

  constructor(
    private categoryService: CategoryService,
    private userPreferencesService: UserPreferencesService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadUserPreferences();
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

  loadUserPreferences(): void {
    this.userPreferencesService.getUserPreferences().subscribe({
      next: (prefs) => {
        this.selectedCategoryIds = new Set(prefs.categories.map(c => c.id));
      },
      error: () => {
        this.snackBar.open('Failed to load preferences', 'Close', { duration: 3000 });
      }
    });
  }

  toggleCategory(categoryId: number): void {
    if (this.selectedCategoryIds.has(categoryId)) {
      this.selectedCategoryIds.delete(categoryId);
    } else {
      this.selectedCategoryIds.add(categoryId);
    }
  }

  savePreferences(): void {
    this.loading = true;
    const categoryIds = Array.from(this.selectedCategoryIds);
    
    this.userPreferencesService.updateUserPreferences(categoryIds).subscribe({
      next: () => {
        this.loading = false;
        this.snackBar.open('Preferences saved successfully!', 'Close', { duration: 3000 });
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Failed to save preferences', 'Close', { duration: 3000 });
      }
    });
  }

  isSelected(categoryId: number): boolean {
    return this.selectedCategoryIds.has(categoryId);
  }
}
