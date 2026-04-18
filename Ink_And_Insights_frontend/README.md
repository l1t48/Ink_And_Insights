# Ink & Insights — Frontend

An Angular 20 single-page application for managing books and quotes. Communicates with the [Ink & Insights backend](../Ink_And_Insights_backend/README.md) via a REST API and receives real-time push updates over SignalR. Supports light/dark theming, responsive layouts, and JWT cookie-based authentication.

> **Deployment note:** This project was previously hosted online. The free-tier database expired and the deployment has since been taken down.

---

## Tech Stack

| Layer      | Technology                                      |
| ---------- | ----------------------------------------------- |
| Framework  | Angular 20 (standalone components)              |
| Language   | TypeScript 5.9                                  |
| Styling    | Bootstrap 5.3, Font Awesome 7                   |
| Real-time  | `@microsoft/signalr` 10                         |
| HTTP       | Angular `HttpClient` + `CredentialsInterceptor` |
| Auth state | `BehaviorSubject`-based `AuthStateService`      |
| Env config | `@ngx-env/builder` (`NG_APP_*` variables)       |
| Icons      | Font Awesome 7 (free)                           |

---

## Project Structure

```
src/
├── app/
│   ├── app.ts                          # Root component — bootstraps auth state + SignalR on load
│   ├── app.routes.ts                   # Route definitions with AuthGuard on protected pages
│   ├── components/
│   │   ├── books-page/
│   │   │   ├── add-book-modal.ts       # Create book form in a Bootstrap modal
│   │   │   └── edit-book-modal.ts      # Edit book form in a Bootstrap modal
│   │   ├── general/
│   │   │   ├── header.ts               # Responsive navbar with active-link tracking + logout
│   │   │   └── theme-switcher.ts       # Sticky light/dark mode toggle (Bootstrap data-bs-theme)
│   │   └── quotes-page/
│   │       ├── add-quote-modal.ts      # Create quote form in a Bootstrap modal
│   │       └── edit-quote-modal.ts     # Edit quote form in a Bootstrap modal
│   ├── environment/
│   │   └── environment.prod.ts         # Reads NG_APP_* env vars at build time
│   ├── helper/
│   │   └── modal-helper.ts             # Bootstrap modal open/close + focus management
│   ├── pages/
│   │   ├── auth-page.ts                # Tabbed Login / Register page
│   │   ├── books-list-page.ts          # Books page — table (xl+) and cards (mobile)
│   │   └── quotes-list-page.ts         # Quotes page — table (xl+) and cards (mobile)
│   └── services/
│       ├── api.service.ts              # All HTTP calls to the backend REST API
│       ├── auth-state.service.ts       # In-memory user session (BehaviorSubject)
│       ├── auth.guard.ts               # Route guard — validates cookie session via /auth/user-data
│       ├── CredentialsInterceptor.ts   # Ensures withCredentials on every outgoing request
│       └── signalr.service.ts          # Hub connection + BehaviorSubject state for books & quotes
├── env.d.ts                            # TypeScript types for NG_APP_* import.meta.env variables
├── index.html                          # HTML shell (Bootstrap theme attr lives here)
└── main.ts                             # Angular bootstrap — registers router, HttpClient, interceptor
```

---

## Prerequisites

- **Node.js v20.19.0** or later (Angular 20 requires this minimum)
- **npm** (bundled with Node)
- A running instance of the [Ink & Insights backend](../Ink_And_Insights_backend/README.md)

---

## Environment Variables — Critical Reading

The frontend uses [`@ngx-env/builder`] to inject environment variables at build time. Variables **must** be prefixed with `NG_APP_` to be picked up.

Create two files in the project root:

**`.env` (development)**

```env
NG_APP_API_BASE_URL=http://localhost:5069/api
NG_APP_BASE_URL=http://localhost:5069
NG_APP_ENV=development
```

**`.env.production`**

```env
NG_APP_API_BASE_URL=https://api.yourproduction.com/api
NG_APP_BASE_URL=https://api.yourproduction.com
NG_APP_ENV=production
```

| Variable              | Description                                                                                        | Example                      |
| --------------------- | -------------------------------------------------------------------------------------------------- | ---------------------------- |
| `NG_APP_API_BASE_URL` | Full base URL including `/api` — used by `ApiService` for all REST calls                           | `http://localhost:5069/api`  |
| `NG_APP_BASE_URL`     | Backend root URL **without** `/api` — used by `SignalRService` to connect to `/hubs/notifications` | `http://localhost:5069`      |
| `NG_APP_ENV`          | Runtime environment label — sets `environment.production` boolean                                  | `development` / `production` |

These values are consumed via `environment.prod.ts`:

```typescript
export const environment = {
  production: import.meta.env.NG_APP_ENV === 'production',
  apiBaseUrl: import.meta.env.NG_APP_API_BASE_URL,
  baseUrlWithoutAPI: import.meta.env.NG_APP_BASE_URL,
};
```

> ⚠️ **If you switch backends** (local → staging → production), only the `.env` files need to change. No source code changes are required. Never hardcode URLs in service files.

---

## Running & Building

### Install dependencies

```bash
npm install
```

### Development (reads `.env`)

```bash
ng serve
# or explicitly:
ng serve --configuration development
```

The app will be available at `http://localhost:4200`.  
Ensure the backend is running at the URL you set in `.env`.

### Production build (reads `.env.production`)

```bash
ng build
# or explicitly:
ng build --configuration production
```

Output is compiled and optimized into the `dist/` folder.

### Serve locally against the production backend

```bash
ng serve --configuration production
```

This starts the dev server at `http://localhost:4200` but uses the URLs from `.env.production`. Useful for smoke-testing against a live backend without deploying the frontend. Use with caution — mutations will affect real data.

### How env file switching works

`@ngx-env/builder` maps Angular build configurations to `.env` files automatically:

| Command                                | Env file loaded   |
| -------------------------------------- | ----------------- |
| `ng serve`                             | `.env`            |
| `ng serve --configuration development` | `.env`            |
| `ng serve --configuration production`  | `.env.production` |
| `ng build`                             | `.env.production` |
| `ng build --configuration development` | `.env`            |

> The `--configuration` flag is the only switch needed to change backends. No source code changes, no commented-out URLs.

---

## How the App Works

### Authentication flow

1. On startup, `App.ngOnInit()` calls `GET /api/auth/user-data` to restore session from the HttpOnly cookie.
2. If the cookie is valid, `AuthStateService` stores the user and SignalR connects.
3. If the cookie is missing or expired, the user is redirected to `/auth`.
4. `AuthGuard` repeats this cookie check on every protected route navigation.
5. The check runs again on a 60-second interval to detect mid-session expiry.

### Real-time data (SignalR)

`SignalRService` is the **single source of truth** for books and quotes. It holds two `BehaviorSubject` streams — `books$` and `quotes$` — which page components subscribe to with the `async` pipe. No component fetches data directly from `ApiService`; all reads go through `SignalRService`.

On connection start, the service fetches the initial lists over HTTP. After that, all changes are pushed over the WebSocket hub and applied in-memory:

| Hub event      | Action                              |
| -------------- | ----------------------------------- |
| `BookCreated`  | Prepends to `books$`                |
| `BookUpdated`  | Replaces matching item in `books$`  |
| `BookDeleted`  | Filters item out of `books$`        |
| `QuoteCreated` | Prepends to `quotes$`, slices to 5  |
| `QuoteUpdated` | Replaces matching item in `quotes$` |
| `QuoteDeleted` | Filters item out of `quotes$`       |

### Modal management

`ModalHelper` is a static utility that wraps Bootstrap's imperative JS API. It handles focus blur before closing to prevent the `aria-hidden` accessibility warning that Bootstrap triggers when a focused element is inside a hidden modal.

---

## Routes

| Path      | Component            | Guard       |
| --------- | -------------------- | ----------- |
| `/`       | Redirects to `/auth` | —           |
| `/auth`   | `AuthPage`           | —           |
| `/books`  | `BooksListPage`      | `AuthGuard` |
| `/quotes` | `QuotesListPage`     | `AuthGuard` |

---

## API Reference (consumed endpoints)

| Method   | Endpoint              | Used in                     |
| -------- | --------------------- | --------------------------- |
| `POST`   | `/api/auth/register`  | `AuthPage`                  |
| `POST`   | `/api/auth/login`     | `AuthPage`                  |
| `GET`    | `/api/auth/user-data` | `App`, `AuthGuard`          |
| `POST`   | `/api/auth/logout`    | `HeaderComponent`           |
| `GET`    | `/api/books`          | `SignalRService`            |
| `POST`   | `/api/books`          | `CreateBookModalComponent`  |
| `PUT`    | `/api/books/:id`      | `EditBookModalComponent`    |
| `DELETE` | `/api/books/:id`      | `BooksListPage`             |
| `GET`    | `/api/quotes`         | `SignalRService`            |
| `POST`   | `/api/quotes`         | `CreateQuoteModalComponent` |
| `PUT`    | `/api/quotes/:id`     | `EditQuoteModalComponent`   |
| `DELETE` | `/api/quotes/:id`     | `QuotesListPage`            |

---

## Test Verification Summary

| Feature                                       | Result |
| --------------------------------------------- | ------ |
| Books: view, add, edit, delete                | ✅     |
| Quotes: view, add, edit, delete               | ✅     |
| Real-time list updates after each mutation    | ✅     |
| Login with valid credentials                  | ✅     |
| Register new account                          | ✅     |
| Protected routes blocked without session      | ✅     |
| Responsive layout (mobile / tablet / desktop) | ✅     |
| Light / dark mode toggle                      | ✅     |
| Backend validation errors surfaced in modals  | ✅     |

---

## Code Review — What Could Be Improved

The following are issues identified through a senior-level review. They are grouped by priority.

### 🔴 High Priority

**1. `ApiService` methods use `any` for nearly every type**

Almost all method signatures accept `data: any` and return `Observable<any>`. This eliminates type safety entirely — the TypeScript compiler cannot catch mismatched payloads or response shapes. Define typed request and response interfaces:

```typescript
// Instead of
createBook(data: any): Observable<any>

// Use
createBook(data: BookCreatePayload): Observable<Book>
```

This pays off immediately when the backend contract changes — the compiler tells you exactly what broke.

**2. `EditQuoteModalComponent` uses `any` for its `@Input` quote**

```typescript
@Input() quote: any = { text: '', author: '', id: null };
```

Compare this to `EditBookModalComponent` which defines a proper `Book` interface. `EditQuoteModalComponent` should define and use a `Quote` interface identically. Using `any` on an `@Input` means a parent can pass completely wrong data and Angular will not warn.

**3. Session polling with `setInterval` is unreliable and wasteful**

`App.ngOnInit()` runs `initializeAuthState()` every 60 seconds via `setInterval`. This means up to 60 extra HTTP requests per session per user, even when they are actively using the app. A better approach is to handle 401 responses reactively in the `CredentialsInterceptor` and redirect then — no polling needed.

**4. `deleteBook` and `deleteQuote` use `alert()` and `confirm()`**

Native browser dialogs are synchronous, block the entire tab, and cannot be styled. They also behave inconsistently across browsers and are disabled in some embedded contexts. Replace them with a proper confirmation modal component that matches the rest of the Bootstrap UI.

---

### 🟡 Medium Priority

**5. Error-handling logic is copy-pasted across five components**

Every modal and the auth page contain the same three-branch error parser:

```typescript
if (err.error?.errors) { ... }
else if (err.error?.message) { ... }
else if (typeof err.error === 'string') { ... }
else { this.errorMessage = 'Failed to ...'; }
```

Extract this into a shared utility function:

```typescript
// src/app/helper/error-helper.ts
export function extractErrorMessage(err: HttpErrorResponse, fallback: string): string {
  if (err.error?.errors) {
    const first = Object.values(err.error.errors)[0];
    return Array.isArray(first) ? first[0] : String(first);
  }
  if (err.error?.message) return err.error.message;
  if (typeof err.error === 'string') return err.error;
  return fallback;
}
```

**6. `setupModalEventListeners()` is copy-pasted across four modal components**

All four modal components repeat the same `AfterViewInit` + `hide.bs.modal` event listener pattern. Move this into a shared `BaseModalComponent` that all four extend, or extract it into `ModalHelper` itself.

**7. `BooksListPage` directly accesses `signalR.api` to perform deletes**

```typescript
this.signalR.api.deleteBook(bookId).subscribe(...)
```

A page component should never reach through a service to access another service's dependencies. `SignalRService` should expose a `deleteBook(id)` method, or the page should inject `ApiService` directly. Mixing both patterns in the same file (`SignalRService` for reads, `signalR.api` for writes) makes the data flow harder to follow.

**8. The `CredentialsInterceptor` does redundant work**

The interceptor checks `if (req.withCredentials) return next.handle(req)` — meaning it only adds `withCredentials` to requests that don't already have it. But `ApiService` already sets `withCredentials: true` on every individual call. The interceptor never actually fires its clone branch. Choose one approach: either trust the interceptor and remove `{ withCredentials: true }` from every `ApiService` call, or remove the interceptor entirely.

**9. `environment.prod.ts` is the only environment file**

The project has a single `environment.prod.ts` file used in all builds. Angular convention expects an `environment.ts` for development and `environment.prod.ts` for production, with the CLI swapping them at build time via `fileReplacements` in `angular.json`. Without this, there is no clean way to set different defaults per environment without touching the actual source file.

---

### 🟢 Lower Priority

**10. `SignalRService.clearData()` is called before `stopConnection()` in logout**

In `HeaderComponent.logout()`:

```typescript
this.signalR.stopConnection();
this.signalR.clearData();
```

And in `SignalRService.startConnection()`:

```typescript
this.stopConnection();
this.clearData();
```

The order should consistently be: stop the connection first (so no incoming events fire), then clear. Clearing first creates a brief window where a racing hub event could repopulate the now-cleared subjects before the connection closes.

**11. No loading state while the initial book/quote lists are fetching**

`SignalRService` calls `loadInitialBooks()` and `loadInitialQuotes()` after the hub connects, but the `BehaviorSubject` starts as an empty array `[]`. The table/card views render immediately with no rows and no spinner, which looks like an empty state rather than a loading state. Introduce a separate `isLoading$` observable and show a skeleton or spinner until the first HTTP response arrives.

**12. `QuotesListPage` and `BooksListPage` duplicate the `AfterViewInit` modal blur listener**

Both pages contain identical `ngAfterViewInit` blocks that attach `hidden.bs.modal` focus-blur listeners. This is already handled inside each modal component via `setupModalEventListeners()`. The page-level listeners are redundant and should be removed.

**13. Bootstrap JS is loaded globally via `declare const bootstrap: any`**

Four files declare `bootstrap` as an ambient global. This works only because Bootstrap's JS bundle is loaded in `index.html`. If the bundle ever moves to an npm import, all four declarations silently break. Import Bootstrap's Modal class directly instead:

```typescript
import { Modal } from 'bootstrap';
```

This makes the dependency explicit and tree-shakeable.
