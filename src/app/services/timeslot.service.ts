import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { TimeSlot } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class TimeslotService {
  private apiUrl = `${environment.apiUrl}/timeslots`;

  constructor(private http: HttpClient) {}

  getTimeslots(
    startDate?: Date,
    endDate?: Date,
    categoryIds?: number[]
  ): Observable<TimeSlot[]> {
    let params = new HttpParams();
    
    if (startDate) {
      params = params.set('start_date', startDate.toISOString());
    }
    if (endDate) {
      params = params.set('end_date', endDate.toISOString());
    }
    if (categoryIds && categoryIds.length > 0) {
      params = params.set('category_ids', categoryIds.join(','));
    }

    return this.http.get<TimeSlot[]>(this.apiUrl, { params });
  }

  createTimeslot(timeslot: Partial<TimeSlot>): Observable<TimeSlot> {
    return this.http.post<TimeSlot>(this.apiUrl, timeslot);
  }

  deleteTimeslot(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
