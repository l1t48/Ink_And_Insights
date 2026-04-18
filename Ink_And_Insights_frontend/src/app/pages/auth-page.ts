import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { AuthStateService } from '../services/auth-state.service';
import { Router } from '@angular/router';
import { SignalRService } from '../services/signalr.service';
import { environment } from '../environment/environment.prod';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [FormsModule, CommonModule],
  template: `
  <div class="d-flex justify-content-center align-items-center vh-100 bg-body text-body">
    <div class="container-fluid mt-5">
      <div class="row justify-content-center">
        <div class="col-md-7 p-4 border rounded shadow-sm shadow-lg">
          
          <ul class="nav nav-pills nav-fill mb-4">
            <li class="nav-item w-25">
              <button
                id="login-tab-button"
                class="nav-link active fw-semibold px-3 py-2"
                data-bs-toggle="tab"
                data-bs-target="#login"
                type="button"
              >
                Login <i class="fa-solid fa-unlock"></i>
              </button>
            </li>

            <li class="nav-item w-25">
              <button
                class="nav-link fw-semibold px-3 py-2"
                data-bs-toggle="tab"
                data-bs-target="#register"
                type="button"
              >
                Register <i class="fa-solid fa-user-plus"></i>
              </button>
            </li>
          </ul>

          <div class="tab-content mt-5">

            <!-- LOGIN -->
            <div class="tab-pane fade show active" id="login">
              <h4 class="mb-3 text-center fs-2">Login</h4>
              <br/>
              <div class="mb-3">
                <input type="email" id="emailLogin" class="form-control form-control-lg" placeholder="Email" [(ngModel)]="loginEmail" aria-label="Email">
              </div>
              <div class="mb-3">
                <input type="password" id="passwordLogin" class="form-control form-control-lg" placeholder="Password" [(ngModel)]="loginPassword" aria-label="Password">
              </div>

              <!-- Message above button -->
              <h1 *ngIf="loginMessage" class="text-center mb-3 fs-5" [class.text-success]="loginSuccess" [class.text-danger]="!loginSuccess">
                {{ loginMessage }}
              </h1>

              <button class="btn btn-primary btn-lg w-100 mt-3" type="button" (click)="login()">Submit <i class="fa-solid fa-check"></i></button>
            </div>

            <!-- REGISTER -->
            <div class="tab-pane fade" id="register">
              <h4 class="mb-3 text-center fs-2">Register</h4>
              <br/>
              <div class="mb-3">
                <input type="text" id="usernameRegister" class="form-control form-control-lg" placeholder="Name" [(ngModel)]="registerName" aria-label="Name">
              </div>
              <div class="mb-3">
                <input type="email" id="emailRegister" class="form-control form-control-lg" placeholder="Email" [(ngModel)]="registerEmail" aria-label="Email">
              </div>
              <div class="mb-3">
                <input type="password" id="passwordRegister" class="form-control form-control-lg" placeholder="Password" [(ngModel)]="registerPassword" aria-label="Password">
              </div>

              <!-- Message above button -->
              <h1 *ngIf="registerMessage" class="text-center mb-3 fs-5" [class.text-success]="registerSuccess" [class.text-danger]="!registerSuccess">
                {{ registerMessage }}
              </h1>

              <button class="btn btn-primary btn-lg w-100 mt-3" type="button" (click)="register()">Submit <i class="fa-solid fa-check"></i></button>
            </div>

          </div>
        </div>
      </div>
    </div>
    </div>
  `
})

export class AuthPage {
  loginEmail = '';
  loginPassword = '';
  loginMessage = '';
  loginSuccess = false;

  registerName = '';
  registerEmail = '';
  registerPassword = '';
  registerMessage = '';
  registerSuccess = false;

  constructor(private api: ApiService, private authState: AuthStateService, private router: Router, private signalR: SignalRService) { }

  login() {
    this.loginMessage = '';
    this.loginSuccess = false;

    this.api.login({ email: this.loginEmail, password: this.loginPassword }).subscribe({
      next: res => {
        // Success message from login
        this.loginMessage = res?.message;
        this.loginSuccess = true;

        // Fetch user info after login
        this.api.getAuthMe().subscribe({
          next: user => {
            this.authState.setUser(user);
            this.signalR.startConnection(environment.baseUrlWithoutAPI); 
            this.router.navigate(['/books']);
          },
          error: () => console.warn('Could not fetch user info.')
        });
      },
      error: err => {
        this.loginSuccess = false;
        if (err.error?.errors) {
          // get first error from errors object
          const firstFieldErrors = Object.values(err.error.errors)[0];
          this.loginMessage = Array.isArray(firstFieldErrors) ? firstFieldErrors[0] : firstFieldErrors;
        } else if (err.error?.message) {
          this.loginMessage = err.error.message;
        } else if (typeof err.error === 'string') {
          this.loginMessage = err.error;
        } else {
          this.loginMessage = 'Login failed.';
        }
      }

    });
  }

  register() {
    this.registerMessage = '';
    this.registerSuccess = false;
    // Remove withCredentials since register does not set cookies
    this.api.register({ username: this.registerName, email: this.registerEmail, password: this.registerPassword }).subscribe({
      next: res => {
        this.registerMessage = res.message;
        this.registerSuccess = true;

        // Wait 1.5 seconds before switching to login tab
        setTimeout(() => {
          const loginTabButton = document.querySelector<HTMLButtonElement>('#login-tab-button');
          if (loginTabButton) {
            loginTabButton.click(); // triggers the tab change
          }
        }, 1500); // 1500ms = 1.5 seconds

      },
      error: err => {
        this.registerSuccess = false;
        if (err.error?.errors) {
          // get the first error from the errors object
          const firstFieldErrors = Object.values(err.error.errors)[0]; // first field's errors array
          this.registerMessage = Array.isArray(firstFieldErrors) ? firstFieldErrors[0] : firstFieldErrors;
        } else if (err.error?.message) {
          this.registerMessage = err.error.message;
        } else if (typeof err.error === 'string') {
          this.registerMessage = err.error;
        } else {
          this.registerMessage = 'Registration failed.';
        }
      }

    });
  }

}
