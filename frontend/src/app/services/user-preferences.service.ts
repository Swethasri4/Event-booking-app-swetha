import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { UserPreferences, Category } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class UserPreferencesService {
  private apiUrl = `${environment.apiUrl}/user/preferences`;
  private preferencesSubject = new BehaviorSubject<Category[]>([]);
  public preferences$ = this.preferencesSubject.asObservable();

  constructor(private http: HttpClient) {}

  getUserPreferences(): Observable<UserPreferences> {
    return this.http.get<UserPreferences>(this.apiUrl).pipe(
      tap(prefs => this.preferencesSubject.next(prefs.categories))
    );
  }

  updateUserPreferences(categoryIds: number[]): Observable<UserPreferences> {
    return this.http.put<UserPreferences>(this.apiUrl, { category_ids: categoryIds }).pipe(
      tap(prefs => this.preferencesSubject.next(prefs.categories))
    );
  }

  getCurrentPreferences(): Category[] {
    return this.preferencesSubject.value;
  }
}
