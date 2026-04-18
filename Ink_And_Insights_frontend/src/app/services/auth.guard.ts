import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthStateService } from './auth-state.service';
import { Observable, of } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private auth: AuthStateService,
    private api: ApiService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> {
    // If we already have a user in state, allow access
    if (this.auth.isAuthenticated()) return of(true);

    // Otherwise, fetch from backend
    return this.api.getAuthMe().pipe(
      switchMap(user => {
        this.auth.setUser(user);
        return of(true);
      }),
      catchError(() => {
        this.auth.clear();
        this.router.navigate(['/auth']);
        return of(false);
      })
    );
  }
}
