using System.ComponentModel.DataAnnotations;

namespace MyBackend.Dtos
{
    public class QuoteCreateDto
    {
        [Required, StringLength(500)]
        public string Text { get; set; } = null!;
        [StringLength(100)]
        [RegularExpression(@"^(?!\d)[\p{L}\p{N}_\-\.\,\:\;'\s()&\/]{0,100}$",
            ErrorMessage = "Author must not start with a number and may only contain letters, digits (not as first character) and common punctuation.")]
        public string? Author { get; set; }
    }
}
