export interface User {
  id: number;
  email: string;
  name: string;
  is_admin: boolean;
  created_at: Date;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  color: string;
}

export interface BookingInfo {
  id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  booked_at: Date;
}

export interface TimeSlot {
  id: number;
  category_id: number;
  title: string;
  description?: string;
  start_time: Date;
  end_time: Date;
  created_at: Date;
  created_by?: number;
  category: Category;
  booking?: BookingInfo;
  is_available: boolean;
}

export interface Booking {
  id: number;
  timeslot_id: number;
  user_id: number;
  booked_at: Date;
  timeslot: TimeSlot;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface UserPreferences {
  categories: Category[];
}
