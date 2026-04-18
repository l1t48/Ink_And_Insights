using MyBackend.Models;

namespace MyBackend.Helpers
{
    public static class DefaultQuotes
    {
        public static IEnumerable<Quote> GetDefaultQuotesForUser(int ownerId)
        {
            var now = DateTime.UtcNow;
            return new List<Quote>
            {
                new Quote { Text = "In the middle of difficulty lies opportunity.", Author = "Albert Einstein", OwnerId = ownerId, CreatedAt = now },
                new Quote { Text = "Success is not final, failure is not fatal: it is the courage to continue that counts.", Author = "Winston S. Churchill", OwnerId = ownerId, CreatedAt = now },
                new Quote { Text = "Do what you can, with what you have, where you are.", Author = "Theodore Roosevelt", OwnerId = ownerId, CreatedAt = now },
                new Quote { Text = "A person who never made a mistake never tried anything new.", Author = "Albert Einstein", OwnerId = ownerId, CreatedAt = now },
                new Quote { Text = "Knowledge is power.", Author = "Francis Bacon", OwnerId = ownerId, CreatedAt = now }
            };
        }
    }
}
