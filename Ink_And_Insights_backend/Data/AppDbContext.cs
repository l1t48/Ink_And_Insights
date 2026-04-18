using Microsoft.EntityFrameworkCore;
using MyBackend.Models;

// This class represents your DATABASE in C#.
// It is the main bridge between:
// - Your C# models (User, Book, Quote)
// - The actual SQL database (PostgreSQL)
namespace MyBackend.Data{
    public class AppDbContext : DbContext
    {
        // This constructor is used by ASP.NET automatically (Dependency Injection).
        // It receives database configuration (like connection string, provider, etc.)
        // and passes it to the base DbContext class.
        public AppDbContext(DbContextOptions<AppDbContext> opts) : base(opts) { }

        // Each DbSet<T> represents a TABLE in the database.
        // User = model → Users = table in SQL
        // You can query it like: _db.Users.Where(...)
        public DbSet<User> Users => Set<User>();

        public DbSet<Book> Books => Set<Book>();

        public DbSet<Quote> Quotes => Set<Quote>();
    }
}