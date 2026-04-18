import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface UserProfile {
  id?: number | null;
  email?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class AuthStateService {
  private userSubject = new BehaviorSubject<UserProfile | null>(null);
  user$: Observable<UserProfile | null> = this.userSubject.asObservable();

  setUser(user: UserProfile | null) {
    this.userSubject.next(user);
  }

  clear() {
    this.userSubject.next(null);
  }

  isAuthenticated(): boolean {
    return !!this.userSubject.value?.id;
  }
}
