using Microsoft.AspNetCore.Mvc;

namespace MyBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TestController : ControllerBase
    {
        // GET: api/test
        [HttpGet]
        public IActionResult Get()
        {
            return Ok(new { message = "Backend is working!" });
        }

        // POST: api/test
        [HttpPost]
        public IActionResult Post([FromBody] dynamic data)
        {
            return Ok(new { received = data, message = "Data received successfully" });
        }
    }
}
