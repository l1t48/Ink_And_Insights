using Microsoft.EntityFrameworkCore;
using MyBackend.Data;

namespace MyBackend.Config
{
    public static class DatabaseConfig
    {
        public static void AddDatabase(this IServiceCollection services)
        {
            var conn = Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection") ?? throw new Exception("Connection string not set.");
            services.AddDbContext<AppDbContext>(opt =>
                opt.UseNpgsql(conn));
        }
    }
}
