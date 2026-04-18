using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyBackend.Models;
using MyBackend.Dtos;
using System.Security.Claims;
using MyBackend.Data;
using Microsoft.AspNetCore.SignalR;
using MyBackend.Hubs;
namespace MyBackend.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class QuotesController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IHubContext<NotificationsHub> _hub;

        public QuotesController(AppDbContext context, IHubContext<NotificationsHub> hub)
        {
            _context = context;
            _hub = hub;
        }

        // GET: api/quotes
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();

            var quotes = await _context.Quotes
                .Where(q => q.OwnerId == userId)
                .OrderByDescending(q => q.CreatedAt)
                .Take(5)
                .ToListAsync();

            return Ok(quotes);
        }

        // GET: api/quotes/{id}
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var quote = await _context.Quotes.FindAsync(id);
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();
            if (quote == null || quote.OwnerId != userId) return NotFound();

            return Ok(quote);
        }

        // POST: api/quotes
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] QuoteCreateDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();

            var quote = new Quote
            {
                Text = dto.Text.Trim(),
                Author = string.IsNullOrWhiteSpace(dto.Author) ? null : dto.Author.Trim(),
                OwnerId = userId.Value,
                CreatedAt = DateTime.UtcNow
            };

            _context.Quotes.Add(quote);
            await _context.SaveChangesAsync();

            // notify only this user (all their connections)
            await _hub.Clients.User(userId.Value.ToString()).SendAsync("QuoteCreated", new
            {
                Id = quote.Id,
                Text = quote.Text,
                Author = quote.Author,
                CreatedAt = quote.CreatedAt
            });

            return CreatedAtAction(nameof(GetById), new { id = quote.Id }, quote);
        }

        // PUT: api/quotes/{id}
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] QuoteUpdateDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var quote = await _context.Quotes.FindAsync(id);
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();
            if (quote == null || quote.OwnerId != userId) return NotFound();

            quote.Text = dto.Text.Trim();
            quote.Author = string.IsNullOrWhiteSpace(dto.Author) ? null : dto.Author.Trim();

            _context.Quotes.Update(quote);
            await _context.SaveChangesAsync();

            await _hub.Clients.User(userId.Value.ToString()).SendAsync("QuoteUpdated", new
            {
                Id = quote.Id,
                Text = quote.Text,
                Author = quote.Author
            });

            return Ok(quote);
        }

        // DELETE: api/quotes/{id}
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var quote = await _context.Quotes.FindAsync(id);
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();
            if (quote == null || quote.OwnerId != userId) return NotFound();

            _context.Quotes.Remove(quote);
            await _context.SaveChangesAsync();

            await _hub.Clients.User(userId.Value.ToString()).SendAsync("QuoteDeleted", new { Id = id });


            return Ok(new { message = "Quote has been deleted" });
        }

        private int? GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim)) return null;
            if (!int.TryParse(userIdClaim, out int userId)) return null;
            return userId;
        }
    }
}
