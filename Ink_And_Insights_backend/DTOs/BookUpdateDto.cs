using System.ComponentModel.DataAnnotations;

// Validation attributes ensure basic text validation (lengths and required fields).

namespace MyBackend.Dtos
{
    public class BookUpdateDto
    {
        [Required, StringLength(200)]
        [RegularExpression(@"^(?!\d)[\p{L}\p{N}_\-\.\,\:\;'\s()&\/]{1,200}$",
            ErrorMessage = "Title must not start with a number and may only contain letters, digits (not as first character) and common punctuation.")]
        public string Title { get; set; } = null!;
        
        [Required, StringLength(150)]
        [RegularExpression(@"^(?!\d)[\p{L}\p{N}_\-\.\,\:\;'\s()&\/]{1,150}$",
            ErrorMessage = "Author must not start with a number and may only contain letters, digits (not as first character) and common punctuation.")]
        public string Author { get; set; } = null!;
        
        [StringLength(2000)]
        public string? Description { get; set; }
    }
}