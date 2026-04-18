import 'zone.js';
import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { CredentialsInterceptor } from './app/services/CredentialsInterceptor';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

bootstrapApplication(App, {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()), // allows DI interceptors
    // Register the interceptor
    { provide: HTTP_INTERCEPTORS, useClass: CredentialsInterceptor, multi: true }
  ]
}).catch(err => console.error(err));
