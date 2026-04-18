# Book & Quotes Management Backend

## Introduction
This is the backend API for a book and quotes management application built with .NET 9 and PostgreSQL. It provides secured CRUD operations for books and quotes, with JWT-based authentication and per-user data isolation.

## Tools & Libraries Used
- .NET 9 – Backend framework for building the REST API.
- Entity Framework Core – ORM for database interaction.
- Npgsql.EntityFrameworkCore.PostgreSQL – PostgreSQL provider for EF Core.
- Microsoft.AspNetCore.Authentication.JwtBearer – Handles JWT-based authentication.
- Microsoft.AspNetCore.Identity – Provides user authentication and identity management.
- Microsoft.AspNetCore.SignalR – Enables real-time updates between server and clients.
- Swashbuckle.AspNetCore – Generates Swagger/OpenAPI documentation for the API.
- DotNetEnv – Loads environment variables from a .env file. Microsoft.Extensions.Configuration.Json – Handles JSON configuration files (appsettings.json, etc.).
- Microsoft.AspNetCore.OpenApi – Enhances OpenAPI support in ASP.NET Core.

## Installation & Running

### Prerequisites
- .NET 9 SDK – Required to build and run the backend project.
- PostgreSQL – Database for storing users, books, and quotes.

### Steps to Run
- Ensure the required environment variables are set.
- Restore dependencies: ``` dotnet restore ```.
- Build the project: ``` dotnet build ```.
- Run the project locally: ``` dotnet run ```.
- The API will be available at http://localhost:5069.

## Project Structure
| Folder / File                | Description / Purpose                            |
| ---------------------------- | ------------------------------------------------ |
| **Config**                   | Configuration files                              |
| CorsConfig.cs                | Configures CORS policies                         |
| DatabaseConfig.cs            | Sets up database connection                      |
| JwtConfig.cs                 | Configures JWT authentication                    |
| SwaggerConfig.cs             | Configures Swagger/OpenAPI documentation         |
| **Controllers**              | API controllers                                  |
| AuthController.cs            | Handles user registration and login              |
| BooksController.cs           | CRUD operations for books (secured)              |
| QuotesController.cs          | CRUD operations for quotes (secured)             |
| **DTOs**                     | Data Transfer Objects for API requests/responses |
| BookCreateDto.cs             |                                                  |
| BookUpdateDto.cs             |                                                  |
| QuoteCreateDto.cs            |                                                  |
| QuoteUpdateDto.cs            |                                                  |
| UserLoginDto.cs              |                                                  |
| UserRegisterDto.cs           |                                                  |
| **Data**                     | Database context and factories                   |
| AppDbContext.cs              | EF Core database context                         |
| AppDbContextFactory.cs       | Factory for creating DbContext instances         |
| **Helpers**                  | Utility/helper files                             |
| PasswordHelper.cs            | Utility for password hashing and verification    |
| **Models**                   | Entity models for the database                   |
| Book.cs                      |                                                  |
| Quote.cs                     |                                                  |
| User.cs                      |                                                  |
| **Services**                 | Business logic / service layer                   |
| UserService.cs               | Handles user-related logic (registration, login) |
| MyBackend.csproj             | Project file for .NET build                      |
| Program.cs                   | Application entry point                          |
| README.md                    | Project documentation                            |
| appsettings.json             | General configuration file                       |
| appsettings.Development.json | Development-specific configuration               |


## Environment Variables
The backend requires several environment variables for configuration. Replace the placeholder values with your own secure values before running the application.

-------------------------------------------------------------------------------------------------------------------------------------------------
| Variable                                 | Description                                   | Example / Placeholder Value                        |
| ---------------------------------------- | --------------------------------------------- | ---------------------------------------------------|
| `Jwt__Key`                               | Secret key used to sign JWT tokens            | `YOUR_SECRET_KEY_HERE`                             |
| `Jwt__Issuer`                            | Issuer of the JWT tokens                      | `myapp-dev`                                        |
| `ConnectionStrings__DefaultConnection`   | Connection string for the PostgreSQL database | `YOUR_DATABASE_URL_HERE`                           |
| `Cors__AllowedOrigins`                   | Allowed frontend origins for CORS             | `http://localhost:4200,http://localhost:5069`      |
-------------------------------------------------------------------------------------------------------------------------------------------------

## API Endpoints Reference

| Method | URL                                                                                |
| ------ | ---------------------------------------------------------------------------------- |
| POST   | [http://localhost:5069/api/auth/register](http://localhost:5069/api/auth/register) |
| POST   | [http://localhost:5069/api/auth/login](http://localhost:5069/api/auth/login)       |
| GET    | [http://localhost:5069/api/books](http://localhost:5069/api/books)                 |
| GET    | [http://localhost:5069/api/books/{id}](http://localhost:5069/api/books/{id})       |
| POST   | [http://localhost:5069/api/books](http://localhost:5069/api/books)                 |
| PUT    | [http://localhost:5069/api/books/{id}](http://localhost:5069/api/books/{id})       |
| DELETE | [http://localhost:5069/api/books/{id}](http://localhost:5069/api/books/{id})       |
| GET    | [http://localhost:5069/api/quotes](http://localhost:5069/api/quotes)               |
| GET    | [http://localhost:5069/api/quotes/{id}](http://localhost:5069/api/quotes/{id})     |
| POST   | [http://localhost:5069/api/quotes](http://localhost:5069/api/quotes)               |
| PUT    | [http://localhost:5069/api/quotes/{id}](http://localhost:5069/api/quotes/{id})     |
| DELETE | [http://localhost:5069/api/quotes/{id}](http://localhost:5069/api/quotes/{id})     |


## Backend Test Verification Checklist
The following table summarizes all backend functionality tests conducted using Postman to ensure proper authentication, authorization, and CRUD operations:

-------------------------------------------------------------------------------------------------------------------------------------------------
| Feature                        | What Was Tested                                             | Result / Confirmation                          |
| ------------------------------ | ----------------------------------------------------------- | -----------------------------------------------|
| **User Registration**          | Registered new users via `POST /api/auth/register`          | ✅ Success, unique emails enforced             |
| **User Login**                 | Logged in with valid credentials via `POST /api/auth/login` | ✅ Success, JWT token returned                 |
| **JWT Token Handling**         | Token returned as HttpOnly cookie                           | ✅ Success, cookie set in Postman              |
| **Token Expiration**           | Verified token expires after 3 hours                        | ✅ Confirmed in Postman                        |
| **Authentication Enforcement** | Accessed protected endpoints without token                  | ✅ Blocked with 401 Unauthorized               |
| **Books CRUD**                 | Created, updated, deleted books as authenticated user       | ✅ Success for all operations                  |
| **Books Ownership**            | Tried updating/deleting another user’s book                 | ✅ Forbidden (403) confirmed                   |
| **Quotes CRUD**                | Created, updated, deleted quotes as authenticated user      | ✅ Success for all operations                  |
| **Quotes Ownership**           | Tried accessing/editing another user’s quotes               | ✅ Forbidden (403) confirmed                   |
| **Quotes Limit**               | Fetched all quotes via `GET /api/quotes`                    | ✅ Only 5 most recent quotes returned per user |
| **Per-User Data Isolation**    | Verified each user only sees their own books/quotes         | ✅ Confirmed with multiple accounts in Postman |
-------------------------------------------------------------------------------------------------------------------------------------------------



## Professional Enhancements (Optional)
The backend is functional and meets the test requirements. To make it more robust and production-ready, the following improvements could be considered:

- **Rate limiting**: Prevent brute-force attacks by limiting the number of login attempts per user or IP address.  
- **Request throttling**: Control API usage per user or IP to prevent abuse or denial-of-service attacks.  
- **Password policies and account lockout**: Enforce strong passwords and temporarily lock accounts after repeated failed login attempts.  
- **Refresh tokens**: Implement refresh tokens to improve session management and enhance user experience.  
- **Email verification**: Verify new user emails to reduce fake accounts and improve security.  
- **Input validation**: Ensure all incoming data (e.g., registration fields, book details, quotes) are properly formatted, within acceptable lengths, and of the correct type.  
- **SQL injection protection**: While Entity Framework automatically parameterizes queries, always ensure that any raw SQL or user input is properly sanitized to prevent SQL injection.  
- **Logging and monitoring**: Track application activity, errors, and security events to support maintenance and auditing.  

