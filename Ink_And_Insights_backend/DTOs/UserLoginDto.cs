using System.ComponentModel.DataAnnotations;


namespace MyBackend.Dtos
{
    public class UserLoginDto
    {
        [Required]
        [StringLength(254)]
        [EmailAddress]
        [RegularExpression(@"^\p{L}[\p{L}\p{N}._%+\-]*@[^\s@]+\.[^\s@]+$",
            ErrorMessage = "Email local part must start with a letter and be a valid email address.")]
        public string Email { get; set; } = null!;

        [Required]
        [StringLength(128, MinimumLength = 8)]        
        public string Password { get; set; } = null!;
    }
}