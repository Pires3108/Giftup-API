using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace APICRUD.Controllers
{
    [ApiController]
    [Route("api/v1/auth")]
    public class AuthController : ControllerBase
    {
        [Authorize]
        [HttpGet("check")]
        public IActionResult CheckLogin()
        {
            return Ok(new { loggedIn = true });
        }
    }
}
