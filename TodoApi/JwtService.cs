using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;

public class JwtService
{
    private readonly string _key;
    private readonly string _issuer;

public JwtService(IConfiguration configuration)
{
    _key = configuration["Jwt:Key"];
    _issuer = configuration["Jwt:Issuer"];

    if (string.IsNullOrEmpty(_key))
    {
        throw new ArgumentException("Jwt:Key is missing in configuration.");
    }
    if (string.IsNullOrEmpty(_issuer))
    {
        throw new ArgumentException("Jwt:Issuer is missing in configuration.");
    }

    if (_key.Length < 16)  // 128 סיביות = 16 בתים
    {
        throw new ArgumentException("The JWT key must be at least 128 bits long.");
    }
}
   
//  בנאי שמאתחל את השירות עם ערכים מתוך הקונפיגורציה.
public string GenerateToken(string username, int userId)
{
    var claims = new[]
    {
        new Claim(ClaimTypes.Name, username),
        new Claim("UserId", userId.ToString()),  
        new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
    };

    var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_key));
    var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

    var token = new JwtSecurityToken(
        issuer: _issuer,
        audience: _issuer,
        claims: claims,
        expires: DateTime.Now.AddHours(1),
        signingCredentials: creds);

    return new JwtSecurityTokenHandler().WriteToken(token);
} }






     

      




    

   