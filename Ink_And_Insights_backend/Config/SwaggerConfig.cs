
using Microsoft.OpenApi.Models;

namespace MyBackend.Config
{
    public static class SwaggerConfig
    {
        public static void AddSwaggerSetup(this IServiceCollection services)
        {
            services.AddEndpointsApiExplorer();
            services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new OpenApiInfo
                {
                    Title = "Testing the backend",
                    Version = "v1",
                    Description = "Backend is functioning!"
                });
            });
        }
    }
}
