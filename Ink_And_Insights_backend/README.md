# Ink & Insights — Backend

A RESTful API for a book and quotes management application, built with **ASP.NET Core 9** and **Entity Framework Core**. Provides per-user CRUD operations for books and quotes, JWT cookie-based authentication, and real-time SignalR notifications.

---

## Tech Stack

| Layer            | Technology                                   |
| ---------------- | -------------------------------------------- |
| Framework        | ASP.NET Core 9                               |
| ORM              | Entity Framework Core 9                      |
| Database (dev)   | SQLite                                       |
| Database (prod)  | PostgreSQL                                   |
| Auth             | JWT Bearer — delivered as HttpOnly cookie    |
| Password hashing | PBKDF2-HMAC-SHA256 (custom `PasswordHelper`) |
| Real-time        | ASP.NET Core SignalR                         |
| API docs         | Swagger / Swashbuckle                        |
| Config           | DotNetEnv (`.env` file)                      |

---

## Project Structure

```
Ink_And_Insights_backend/
├── Config
│   ├── CorsConfig.cs
│   ├── DatabaseConfig.cs
│   ├── JwtConfig.cs
│   └── SwaggerConfig.cs
├── Controllers
│   ├── AuthController.cs
│   ├── BooksController.cs
│   ├── QuotesController.cs
│   └── TestController.cs
├── DTOs
│   ├── BookCreateDto.cs
│   ├── BookUpdateDto.cs
│   ├── QuoteCreateDto.cs
│   ├── QuoteUpdateDto.cs
│   ├── UserLoginDto.cs
│   └── UserRegisterDto.cs
├── Data
│   ├── AppDbContext.cs
│   └── AppDbContextFactory.cs
├── Helpers
│   ├── DefaultSeeds.cs
│   ├── NameIdentifierUserIdProvider.cs
│   ├── PasswordComplexityAttribute.cs
│   └── PasswordHelper.cs
├── Ink_And_Insights_backend.csproj
├── Ink_And_Insights_backend.sln
├── Models
│   ├── Book.cs
│   ├── Quote.cs
│   └── User.cs
├── Program.cs
├── README.md
├── Services
│   └── UserService.cs
├── appsettings.json
└── ink_and_insights.db

```

---

## Prerequisites

- [.NET 9 SDK]
- PostgreSQL (production) — SQLite is used automatically in Development

---

## Environment Variables

Create a `.env` file in the project root. **Never commit real secrets.**

```env
# JWT
Jwt__Key=<your-256-bit-secret>
Jwt__Issuer=InkAndInsights_Backend

# Environment
ASPNETCORE_ENVIRONMENT=Development

# Database
DEV_CONNECTION=Data Source=ink_and_insights.db
PROD_CONNECTION=Host=localhost;Port=5432;Database=InkAndInsightsDB;Username=postgres;Password=<your_password>

# CORS (comma-separated)
Cors__AllowedOrigins=http://localhost:4200,http://localhost:5069
```

| Variable                 | Description                                                    |
| ------------------------ | -------------------------------------------------------------- |
| `Jwt__Key`               | Secret used to sign JWT tokens (min 32 characters recommended) |
| `Jwt__Issuer`            | JWT issuer and audience string                                 |
| `ASPNETCORE_ENVIRONMENT` | `Development` uses SQLite; anything else uses PostgreSQL       |
| `DEV_CONNECTION`         | SQLite connection string                                       |
| `PROD_CONNECTION`        | PostgreSQL connection string                                   |
| `Cors__AllowedOrigins`   | Comma-separated list of allowed frontend origins               |

---

## Running Locally

```bash
# 1. Restore dependencies
dotnet restore

# 2. Apply database migrations
dotnet ef database update

# 3. Start the API
dotnet run
```

The API will be available at `http://localhost:5069`.  
Swagger UI is available at `http://localhost:5069/swagger` in Development.

[!IMPORTANT]

Environment-Based Logic: > The backend automatically swaps critical infrastructure based on the ASPNETCORE_ENVIRONMENT variable in your .env file. You must change this value to Production when deploying to ensure the system uses the correct database and disables development-only tools.

---

## API Reference

### Auth — `/api/auth`

| Method | Endpoint              | Auth required | Description                                       |
| ------ | --------------------- | ------------- | ------------------------------------------------- |
| `POST` | `/api/auth/register`  | No            | Create account; seeds 5 default quotes            |
| `POST` | `/api/auth/login`     | No            | Validates credentials; sets `jwt` HttpOnly cookie |
| `POST` | `/api/auth/logout`    | No            | Expires the `jwt` cookie                          |
| `GET`  | `/api/auth/user-data` | Yes           | Returns the current user's ID and email           |

### Books — `/api/books`

| Method   | Endpoint          | Description                         |
| -------- | ----------------- | ----------------------------------- |
| `GET`    | `/api/books`      | All books owned by the current user |
| `GET`    | `/api/books/{id}` | Single book by ID                   |
| `POST`   | `/api/books`      | Create a new book                   |
| `PUT`    | `/api/books/{id}` | Update an existing book             |
| `DELETE` | `/api/books/{id}` | Delete a book                       |

### Quotes — `/api/quotes`

| Method   | Endpoint           | Description                               |
| -------- | ------------------ | ----------------------------------------- |
| `GET`    | `/api/quotes`      | 5 most recent quotes for the current user |
| `GET`    | `/api/quotes/{id}` | Single quote by ID                        |
| `POST`   | `/api/quotes`      | Create a new quote                        |
| `PUT`    | `/api/quotes/{id}` | Update an existing quote                  |
| `DELETE` | `/api/quotes/{id}` | Delete a quote                            |

All Books and Quotes endpoints require authentication and enforce ownership — users can only read or mutate their own records.

---

## Real-time Notifications (SignalR)

Connect to `/hubs/notifications` with a valid session cookie.  
The hub broadcasts the following events to the **current user only**:

| Event          | Trigger                         |
| -------------- | ------------------------------- |
| `BookCreated`  | A book is successfully created  |
| `BookUpdated`  | A book is successfully updated  |
| `BookDeleted`  | A book is successfully deleted  |
| `QuoteCreated` | A quote is successfully created |
| `QuoteUpdated` | A quote is successfully updated |
| `QuoteDeleted` | A quote is successfully deleted |

---

## Input Validation Rules

### User Registration

- **Username**: 3–50 characters, must start with a letter, allows letters/digits/`_`/`-`/`.`
- **Email**: Standard email format, local part must start with a letter, max 254 characters
- **Password**: 8–128 characters, must contain at least one letter, one digit, one special character; spaces and control characters rejected

### Books

- **Title**: 1–200 characters, must not start with a digit
- **Author**: 1–150 characters, must not start with a digit
- **Description**: Optional, max 2000 characters

### Quotes

- **Text**: Required, max 500 characters
- **Author**: Optional, max 100 characters, same character rules as book author

---

## Test Verification Summary

| Area                                         | Result |
| -------------------------------------------- | ------ |
| User registration (unique email enforcement) | ✅     |
| Login with valid credentials                 | ✅     |
| JWT delivered as HttpOnly cookie             | ✅     |
| Protected endpoints blocked without token    | ✅     |
| Books CRUD (create / update / delete)        | ✅     |
| Books ownership enforcement                  | ✅     |
| Quotes CRUD (create / update / delete)       | ✅     |
| Quotes ownership enforcement                 | ✅     |
| Quotes limited to 5 most recent              | ✅     |
| Per-user data isolation (multi-account)      | ✅     |

---

## Code Review — What Could Be Improved

The following are issues identified through a senior-level review of the current codebase, ranging from security concerns to architecture and maintainability. They are grouped by priority.

### 🔴 Security — High Priority

**1. PBKDF2 iteration count is dangerously low**

`PasswordHelper` uses 10,000 PBKDF2 iterations. OWASP currently recommends **600,000 iterations** for PBKDF2-HMAC-SHA256. An attacker who obtains the database can crack these hashes orders of magnitude faster than a modern standard allows.

```csharp
// Current
iterationCount: 10000

// Recommended minimum (2024 OWASP)
iterationCount: 600000
```

**2. Password hash comparison is vulnerable to timing attacks**

`PasswordHelper.VerifyPassword` compares two base64 strings with `==`, which short-circuits on the first mismatched character. An attacker can measure response times to infer correct hash characters. Replace it with a constant-time comparison:

```csharp
// Replace
return attemptedHash == hash;

// With
return CryptographicOperations.FixedTimeEquals(
    System.Text.Encoding.UTF8.GetBytes(attemptedHash),
    System.Text.Encoding.UTF8.GetBytes(hash));
```

**3. No rate limiting on the login endpoint**

The `POST /api/auth/login` endpoint is fully open to brute-force attempts. ASP.NET Core 8+ ships with built-in rate limiting middleware — it should be applied at minimum to the auth endpoints:

```csharp
builder.Services.AddRateLimiter(options =>
{
    options.AddFixedWindowLimiter("login", o =>
    {
        o.PermitLimit = 5;
        o.Window = TimeSpan.FromMinutes(1);
    });
});
```

**4. The email claim is never added to the JWT**

`UserService.LoginAsync` only adds `ClaimTypes.NameIdentifier` to the token. However, `AuthController.UserData` attempts to read `ClaimTypes.Email` from it, so it will always return `null` for the email field. Either add the claim during token creation or remove the dead read.

**5. `TestController` should not exist in production**

`TestController` exposes a `POST` endpoint that echoes back any `dynamic` payload without validation or authentication. This is a data reflection vector. It should be removed entirely or guarded with `#if DEBUG`.

---

### 🟡 Architecture — Medium Priority

**6. Duplicate `GetCurrentUserId()` method**

The method is copy-pasted verbatim into both `BooksController` and `QuotesController`. Introduce an `ApiControllerBase` that both inherit from:

```csharp
public abstract class ApiControllerBase : ControllerBase
{
    protected int? GetCurrentUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(claim, out var id) ? id : null;
    }
}
```

**7. `UserService` receives secrets via constructor instead of `IOptions<T>`**

The JWT key and issuer are injected as raw strings into `UserService` via a factory lambda in `Program.cs`. This bypasses the standard configuration system, makes testing harder, and scatters secret management logic. Use `IOptions<JwtSettings>` instead:

```csharp
public class JwtSettings { public string Key { get; set; } = ""; public string Issuer { get; set; } = ""; }
builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("Jwt"));
// UserService then takes IOptions<JwtSettings> in its constructor
```

**8. `AuthController.Register` makes a redundant database round-trip**

After calling `RegisterAsync` (which saves the user), the controller immediately queries the database again with `FirstOrDefaultAsync` to retrieve the same user — only to get its `Id` for seeding. `RegisterAsync` should return the created `User` (or at least its ID) so the second query is unnecessary.

**9. Models have no EF navigation properties or explicit foreign keys**

`Book.OwnerId` and `Quote.OwnerId` reference `User.Id` but are not declared as EF foreign keys with a navigation property. Without this, EF cannot enforce referential integrity at the database level — deleting a user will not cascade-delete their books and quotes.

```csharp
public class Book
{
    public int OwnerId { get; set; }
    public User Owner { get; set; } = null!; // Navigation property
}
```

And in `AppDbContext.OnModelCreating`:

```csharp
modelBuilder.Entity<Book>()
    .HasOne(b => b.Owner)
    .WithMany()
    .HasForeignKey(b => b.OwnerId)
    .OnDelete(DeleteBehavior.Cascade);
```

**10. `BookCreateDto` and `BookUpdateDto` are identical**

Both DTOs share the same three fields and the same validation rules. One inherits nothing from the other. Extract a shared `BookBaseDto` and have both extend it — or simply reuse one DTO for both operations.

---

### 🟢 Quality & Maintainability — Lower Priority

**11. No structured logging anywhere**

Not a single controller or service injects `ILogger<T>`. Failed logins, unexpected exceptions, and authorization failures are completely silent in production. At minimum, log failed login attempts and unhandled errors.

**12. No global exception-handling middleware**

Unhandled exceptions propagate as 500 responses that may expose stack traces in non-production environments. Add a `UseExceptionHandler` middleware or a `ProblemDetails` handler:

```csharp
app.UseExceptionHandler("/error");
// or in .NET 8+
builder.Services.AddProblemDetails();
```

**13. `GET /api/quotes` has a hardcoded limit of 5**

`.Take(5)` is baked into the query with no way for the client to request more. This makes sense as a dashboard widget but blocks the user from ever paginating through their full quote library. Consider adding `?limit=` and `?offset=` query parameters, or a separate paginated endpoint.

**14. No `UpdatedAt` timestamp on models**

Books and quotes have `CreatedAt` but no `UpdatedAt`. Any client that needs to detect stale data or display "last edited" information has no field to work with.

**15. Async methods have no `CancellationToken` propagation**

All controller actions and service methods use `async/await` but none accept or forward a `CancellationToken`. ASP.NET Core provides one via `HttpContext.RequestAborted`. Forwarding it to EF Core queries allows the database to cancel in-flight queries when a client disconnects:

```csharp
public async Task<IActionResult> GetAll(CancellationToken ct)
{
    var books = await _context.Books.Where(...).ToListAsync(ct);
    ...
}
```

**16. No refresh tokens**

The JWT cookie expires after 3 hours with no mechanism to extend the session silently. Users will be hard-logged-out mid-session. Implementing a refresh token with rotation (stored server-side or as a second HttpOnly cookie) is the standard remedy.
