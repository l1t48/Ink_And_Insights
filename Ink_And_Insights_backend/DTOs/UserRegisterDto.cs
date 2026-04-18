using System.ComponentModel.DataAnnotations;
using MyBackend.Helpers;
namespace MyBackend.Dtos
{
    public class UserRegisterDto
    {
        [Required]
        [StringLength(50, MinimumLength = 3)]
                [RegularExpression(@"^\p{L}[\p{L}\p{N}_\-.]{2,49}$",
            ErrorMessage = "Username must start with a letter and may contain letters, digits, underscore, dash or dot.")]
        public string Username { get; set; } = null!;
        [Required]
        [EmailAddress]
        [StringLength(254)]
        [RegularExpression(@"^\p{L}[\p{L}\p{N}._%+\-]*@[^\s@]+\.[^\s@]+$",
            ErrorMessage = "Email local part must start with a letter and be a valid email address.")]
        public string Email { get; set; } = null!;
        [Required]
        [StringLength(128, MinimumLength = 8)]
        [PasswordComplexity(8)]
        public string Password { get; set; } = null!;
    }
}