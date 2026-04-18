namespace MyBackend.Models
{
  public class Book {
    public int Id { get; set; }
    public string Title { get; set; } = null!;
    public string Author { get; set; } = null!;
    public string? Description { get; set; }
    public int OwnerId { get; set; }    // link to User.Id
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
  }
}
