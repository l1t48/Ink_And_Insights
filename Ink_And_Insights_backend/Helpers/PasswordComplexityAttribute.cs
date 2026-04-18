using System.ComponentModel.DataAnnotations;
using System.Text.RegularExpressions;


namespace MyBackend.Helpers
{
    [AttributeUsage(AttributeTargets.Property | AttributeTargets.Field | AttributeTargets.Parameter, AllowMultiple = false)]
    public class PasswordComplexityAttribute : ValidationAttribute
    {
        private readonly int _minLength;
        public PasswordComplexityAttribute(int minLength = 8)
        {
            _minLength = minLength;
            ErrorMessage = $"Password must be at least {_minLength} characters and include letters, digits and a special character with no spaces";
        }

        public override bool IsValid(object? value)
        {
            var pwd = value as string;
            if (string.IsNullOrEmpty(pwd) || pwd.Length < _minLength) return false;

            // Reject spaces
            if (pwd.Contains(" ")) return false;
            
            // Require at least one letter, one digit, and one special character
            if (!Regex.IsMatch(pwd, @"[A-Za-z]")) return false;
            if (!Regex.IsMatch(pwd, @"\d")) return false;
            if (!Regex.IsMatch(pwd, @"[\W_]")) return false; // non-word or underscore
            // Require at least one special character (excluding spaces)
            if (!Regex.IsMatch(pwd, @"[!@#$%^&*()_+\-=[\]{};':"",.<>/?\\|`~]")) return false;
            // Reject control characters
            if (Regex.IsMatch(pwd, @"[\u0000-\u001F\u007F]")) return false;

            return true;
        }
    }
}