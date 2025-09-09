using System.Security.Claims;

namespace APICRUD.Extensions
{
    public static class ClaimsPrincipalExtensions
    {
        public static int GetClienteId(this ClaimsPrincipal user)
        {
            var id = user.FindFirst("id")?.Value;
            if (string.IsNullOrEmpty(id))
                throw new UnauthorizedAccessException("Token inválido ou sem ID do cliente");

            return int.Parse(id);
        }
    }
}
