import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeSwitcher } from './components/general/theme-switcher';
import { HeaderComponent } from './components/general/header';
import { AuthStateService } from './services/auth-state.service';
import { ApiService } from './services/api.service';
import { Router } from '@angular/router';
import { SignalRService } from './services/signalr.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ThemeSwitcher, HeaderComponent],
  template: `
    <app-header></app-header>
    <div class="bg-body text-body">
        <router-outlet></router-outlet>
    </div>

    <app-sticky-button></app-sticky-button>
  `
})
export class App implements OnInit {
  constructor(
    private authState: AuthStateService,
    private api: ApiService,
    private router: Router,
    private signalR: SignalRService
  ) { }

  ngOnInit() {
    this.initializeAuthState();
    setInterval(() => this.initializeAuthState(), 60_000);
  }

  private initializeAuthState() {
    this.api.getAuthMe().subscribe({
      next: user =>{
        this.authState.setUser(user);
        this.signalR.startConnection(this.api.baseUrlLocalWitoutAPI); 
      },
      error: () => {
        this.authState.clear();
        this.signalR.stopConnection();
        // Only redirect if currently on a protected page
        if (this.router.url !== '/auth') {
          this.router.navigate(['/auth']);
        }
      }
    });
  }
}
