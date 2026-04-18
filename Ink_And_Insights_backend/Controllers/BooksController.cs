using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyBackend.Models;
using MyBackend.Dtos;
using System.Security.Claims;
using MyBackend.Data;
using MyBackend.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace MyBackend.Controllers
{
    [Authorize] // All endpoints require authentication
    [ApiController]
    [Route("api/[controller]")]
    public class BooksController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IHubContext<NotificationsHub> _hub;
        public BooksController(AppDbContext context, IHubContext<NotificationsHub> hub)
        {
            _context = context;
            _hub = hub;
        }

        // Helper method to get the current logged-in user's ID
        private int? GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim)) return null;
            if (!int.TryParse(userIdClaim, out int userId)) return null;
            return userId;
        }

        // GET: api/books
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var ownerId = GetCurrentUserId();
            if (ownerId == null) return Unauthorized();

            var books = await _context.Books
                .Where(b => b.OwnerId == ownerId)
                .OrderByDescending(b => b.CreatedAt)
                .ToListAsync();

            return Ok(books);
        }

        // GET: api/books/{id}
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var ownerId = GetCurrentUserId();
            if (ownerId == null) return Unauthorized();

            var book = await _context.Books
                .FirstOrDefaultAsync(b => b.Id == id && b.OwnerId == ownerId);

            if (book == null) return NotFound();

            return Ok(book);
        }

        // POST: api/books
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] BookCreateDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var ownerId = GetCurrentUserId();
            if (ownerId == null) return Unauthorized();

            var book = new Book
            {
                Title = dto.Title.Trim(),
                Author = dto.Author.Trim(),
                Description = string.IsNullOrWhiteSpace(dto.Description) ? null : dto.Description.Trim(),
                OwnerId = ownerId.Value,
                CreatedAt = DateTime.UtcNow
            };

            _context.Books.Add(book);
            await _context.SaveChangesAsync();

            await _hub.Clients.User(ownerId.Value.ToString()).SendAsync("BookCreated", new{
                Id = book.Id,
                Title = book.Title,
                Author = book.Author,
                Description = book.Description,
                CreatedAt = book.CreatedAt
            });

            return CreatedAtAction(nameof(GetById), new { id = book.Id }, book);
        }

        // PUT: api/books/{id}
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] BookUpdateDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var ownerId = GetCurrentUserId();
            if (ownerId == null) return Unauthorized();

            var book = await _context.Books.FindAsync(id);
            if (book == null || book.OwnerId != ownerId) return NotFound();

            book.Title = dto.Title.Trim();
            book.Author = dto.Author.Trim();
            book.Description = string.IsNullOrWhiteSpace(dto.Description) ? null : dto.Description.Trim();

            _context.Books.Update(book);
            await _context.SaveChangesAsync();

            await _hub.Clients.User(ownerId.Value.ToString()).SendAsync("BookUpdated", new {
                Id = book.Id,
                Title = book.Title,
                Author = book.Author,
                Description = book.Description
            });

            return Ok(book);
        }

        // DELETE: api/books/{id}
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var ownerId = GetCurrentUserId();
            if (ownerId == null) return Unauthorized();

            var book = await _context.Books.FindAsync(id);
            if (book == null || book.OwnerId != ownerId) return NotFound();

            _context.Books.Remove(book);
            await _context.SaveChangesAsync();

            await _hub.Clients.User(ownerId.Value.ToString()).SendAsync("BookDeleted", new { Id = id });
            
            return Ok(new { message = "Book has been deleted" });
        }
    }
}
