using Pomelo.EntityFrameworkCore.MySql.Infrastructure;
using Microsoft.EntityFrameworkCore;
using TodoApi;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using BCrypt.Net;


var builder = WebApplication.CreateBuilder(args);
//Configuration- הגדרת קונפיגורציה
var jwtKey = builder.Configuration["Jwt:Key"];
var jwtIssuer = builder.Configuration["Jwt:Issuer"];
//cors
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAllOrigins", builder =>
    {

        builder.AllowAnyOrigin()
       .AllowAnyMethod() // מאפשר שימוש בכל שיטה (GET, POST, PUT וכו')
       .AllowAnyHeader(); // מאפשר כל כותרת
    });
});

//contact to mysql
builder.Services.AddDbContext<ToDoDbContext>(options =>
    options.UseMySql(builder.Configuration["ConnectionStrings__Tasks"],
                     new MySqlServerVersion(new Version(8, 0, 40))));

//  קביעת אוטנטיקציה באמצעות jwt
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true, // לאמת את המנפיק של הטוקן
        ValidateAudience = true, // לאמת את הקהל של הטוקן
        ValidateLifetime = true, // לאמת את זמן החיים של הטוקן
        ValidateIssuerSigningKey = true, // לאמת את מפתח החתימה של הטוקן
        ValidIssuer = jwtIssuer, // הגדרת המנפיק המותר
        ValidAudience = jwtIssuer, // הגדרת הקהל המותר

        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))// יצירת מפתח החתימה
    };
});

//הזרקת תליות 
builder.Services.AddScoped<JwtService>();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();
// הפעלת אוטנטיקציה ואישור- jwt
app.UseAuthentication();
app.UseAuthorization();
// קביעת cors
app.UseCors("AllowAllOrigins");
//Swagger
app.UseSwagger();
app.UseSwaggerUI();
app.UseHttpsRedirection();

app.MapGet("/", () => "Auther Api is Running");

//getTask
app.MapGet("/Tasks", async (HttpContext httpContext, ToDoDbContext context) =>
{
    // חילוץ מזהה המשתמש
    var userId = int.Parse(httpContext.User.Claims.FirstOrDefault(c => c.Type == "UserId")?.Value);
    // שליפת כל המשימות שקשורת למשתמש הנוכחי
    var tasks = await context.Items.Where(i => i.UserId == userId).ToListAsync();
    return Results.Ok(tasks);
});
//postTask
app.MapPost("/Task", async (HttpContext httpContext, Item item, ToDoDbContext context) =>
{
    // חילוץ מזהה המשתמש
    var userId = int.Parse(httpContext.User.Claims.FirstOrDefault(c => c.Type == "UserId")?.Value);
    // שיוך המשימה למשתמש הנוכחי
    item.UserId = userId;
    // הוספת משימה 
    context.Items.Add(item);
    // שמירת שינויים
    await context.SaveChangesAsync();
    return Results.Created($"/tasks/{item.Id}", item);
});
//PutTask
app.MapPut("/Task/{id}", async (HttpContext httpContext, int id, bool IsComplete, ToDoDbContext context) =>
{
    // חילוץ מזהה המשתמש
    var userId = int.Parse(httpContext.User.Claims.FirstOrDefault(c => c.Type == "UserId")?.Value);
    // חיפוש המשימה של המשתמש לפי מזהה
    var item = await context.Items.FirstOrDefaultAsync(i => i.Id == id && i.UserId == userId);
    // אם לא קיים המשימה 
    if (item is null) return Results.NotFound();
    //מחליף את  סטטוס המשימה 
    item.IsComplete = IsComplete;
    //שומר שינויים 
    await context.SaveChangesAsync();
    return Results.NoContent();
});

// DELETETask
app.MapDelete("/Task/{id}", async (HttpContext httpContext, int id, ToDoDbContext context) =>
{

    // חילוץ מזהה המשתמש
    var userId = int.Parse(httpContext.User.Claims.FirstOrDefault(c => c.Type == "UserId")?.Value);
    //שליפת המשימה שצריכה להמחק
    var item = await context.Items.FirstOrDefaultAsync(i => i.Id == id && i.UserId == userId);
    // אם לא קיים חזרה שלא קיים
    if (item is null) return Results.NotFound();

    context.Items.Remove(item);//מחיקה 
    await context.SaveChangesAsync();//שמירת השיניים בDATA
    return Results.NoContent();
});

// Register
app.MapPost("/Register", async (User user, ToDoDbContext context, JwtService jwtService) =>
{
    // בדיקת שם המשתמש במסד הנתונים
    var existingUser = await context.Users.FirstOrDefaultAsync(u => u.Username == user.Username);
    //אם קיים זירקה שקיים
    if (existingUser != null)
        return Results.BadRequest("Username already exists.");

    user.Password = BCrypt.Net.BCrypt.HashPassword(user.Password); // הצפנת הסיסמה
    context.Users.Add(user);//הוספה 
    await context.SaveChangesAsync();//שמירת השינויים בDATA

    // יצירת טוקן עבור המשתמש החדש
    var token = jwtService.GenerateToken(user.Username, user.UserId);

    return Results.Ok(new { UserId = user.UserId, Username = user.Username, Token = token, Message = "User registered successfully." });
});


// Login
app.MapPost("/Login", async (User login, ToDoDbContext context, JwtService jwtService) =>
{
    // בדיקת שם המשתמש במסד הנתונים
    var user = await context.Users.FirstOrDefaultAsync(u => u.Username == login.Username);
    // אם המשתמש לא קיים
    if (user == null)
        return Results.BadRequest(new { Message = "User does not exist in the system." });
    // אם הסיסמה לא תואמת
    if (!BCrypt.Net.BCrypt.Verify(login.Password, user.Password))
        return Results.Unauthorized();
    // יצירת טוקן JWT עבור התחברות מוצלחת
    var token = jwtService.GenerateToken(user.Username, user.UserId);
    // var token = jwtService.GenerateToken(user.Username);
    return Results.Ok(new { Token = token });
});

app.Run();


