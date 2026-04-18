using Microsoft.AspNetCore.Mvc; // Provides attributes and base classes for building controllers and API endpoints
using MyBackend.Services;
using MyBackend.Dtos;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using MyBackend.Helpers;
using MyBackend.Data;

namespace MyBackend.Controllers
{
    // Indicates that this class is an API controller.
    // Enables automatic model validation, binding, and other API-specific behaviors.
    [ApiController]

    // Defines the base route for all actions in this controller.
    // [controller] is a placeholder replaced with the controller's name without "Controller" suffix.
    // In this case, route becomes "api/auth"
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly UserService _userService;
        private readonly AppDbContext _context;

        public AuthController(UserService userService, AppDbContext context)
        {
            _userService = userService;
            _context = context;
        }

        // POST: api/register
        [HttpPost("register")]
        public async Task<IActionResult> Register(UserRegisterDto dto)
        {
            // 1) create user via service
            var created = await _userService.RegisterAsync(dto.Username, dto.Email, dto.Password);
            if (!created) return BadRequest(new { message = "Email already in use." });

            // 2) find created user (defensive)
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
            if (user == null)
            {
                return StatusCode(500, new { message = "User created but not found for seeding." });
            }

            // 3) seed default quotes only if user has none
            var hasQuotes = await _context.Quotes.AnyAsync(q => q.OwnerId == user.Id);
            if (!hasQuotes)
            {
                var seeds = DefaultQuotes.GetDefaultQuotesForUser(user.Id);
                await _context.Quotes.AddRangeAsync(seeds);
                await _context.SaveChangesAsync();
            }

            return Ok(new { message = "User registered!" });
        }

        // POST: api/login
        [HttpPost("login")]
        public async Task<IActionResult> Login(UserLoginDto dto)
        {
            var token = await _userService.LoginAsync(dto.Email, dto.Password);
            if (token == null) return Unauthorized(new { message = "Invalid credentials." });

            // Set JWT as HttpOnly cookie
            Response.Cookies.Append("jwt", token, new CookieOptions
            {
                HttpOnly = true,
                Secure = true, // true in production (requires HTTPS), It is now false for localhost testing
                SameSite = SameSiteMode.None, //SameSiteMode.Strict,
                Expires = DateTime.UtcNow.AddHours(3)
            });

            return Ok(new { message = "Logged in successfully" });
        }

        // GET: api/user-data
        [HttpGet("user-data")]
        public IActionResult UserData()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            if (userId == null && email == null)
            {
                return Unauthorized(new { message = "No valid claims found in token." });
            }
            return Ok(new { id = userId, email });
        }
        // POST: api/logout
        [HttpPost("logout")]
        public IActionResult Logout()
        {
            // Expire the JWT cookie to ensure it is removed from the browser
            Response.Cookies.Append("jwt", "", new CookieOptions
            {
                Expires = DateTimeOffset.UtcNow.AddDays(-1), // Set past date to remove
                HttpOnly = true,
                Secure = true, // Ensure this matches the original cookie
                Path = "/",  
                SameSite = SameSiteMode.None,
            });

            return Ok(new { message = "Logged out successfully" });
        }


    }
}
