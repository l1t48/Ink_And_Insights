import { Routes } from '@angular/router';
import { AuthPage } from './pages/auth-page';
import { BooksListPage } from './pages/books-list-page';
import { AuthGuard } from './services/auth.guard';
import { QuotesListPage } from './pages/quotes-list-page';

export const routes: Routes = [
  { path: '', redirectTo: 'auth', pathMatch: 'full' },
  { path: 'auth', component: AuthPage },
  { path: 'books', component: BooksListPage,  canActivate: [AuthGuard] },
  { path: 'quotes', component: QuotesListPage,  canActivate: [AuthGuard] },
];
