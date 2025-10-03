using APICRUD.Infraestrutura;
using APICRUD.Model;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.WriteIndented = true;
    });


var key = builder.Configuration["Jwt:Key"];
var issuer = builder.Configuration["Jwt:Issuer"];
var audience = builder.Configuration["Jwt:Audience"];

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.RequireHttpsMetadata = false;
        options.SaveToken = true;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = issuer,
            ValidAudience = audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key ?? string.Empty)),
            ClockSkew = TimeSpan.Zero
        };
    });

builder.Services.AddScoped<TokenService>();
builder.Services.AddScoped<DatabaseConnection>();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "APICRUD API",
        Version = "v1",
        Description = "API para sistema de CRUD"
    });
});


builder.Services.AddTransient<IclienteRepository, clienteRepository>();
builder.Services.AddTransient<IitemRepository, itemRepository>();
builder.Services.AddTransient<IpedidoRepository, pedidoRepository>();
builder.Services.AddTransient<IpedidoItemRepository, pedidoItemRepository>();


builder.Services.AddHealthChecks();


builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
                "http://localhost:5173", 
                "http://127.0.0.1:5173",
                "http://localhost:3000",
                "http://127.0.0.1:3000",
                "http://localhost:5000",
                "http://127.0.0.1:5000"
              )
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
    
    options.AddPolicy("Production", policy =>
    {
        policy.WithOrigins(
                "https://giftup-frontend-us-central1-project-4ff72848-5923-4058-b7a.a.run.app",
                "https://giftup-api-us-central1-project-4ff72848-5923-4058-b7a.a.run.app",
                "https://giftup-frontend-12260072068.us-central1.run.app",
                "https://giftup-api-12260072068.us-central1.run.app"
              )
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    try
    {
        var dbConnection = scope.ServiceProvider.GetRequiredService<DatabaseConnection>();
        using var connection = dbConnection.GetConnection();
        Console.WriteLine("Conexão com o banco de dados estabelecida com sucesso!");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Erro ao conectar com o banco de dados: {ex.Message}");
    }
}


var storagePath = Path.Combine(app.Environment.ContentRootPath, "Storage");
Directory.CreateDirectory(storagePath);


if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}

app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "APICRUD API v1");
    c.RoutePrefix = "swagger";
});

if (app.Environment.IsProduction())
{
    app.UseHttpsRedirection();
}


if (app.Environment.IsDevelopment())
{
    app.UseCors(builder => builder
        .AllowAnyOrigin()
        .AllowAnyMethod()
        .AllowAnyHeader());
}
else
{
    app.UseCors("Production");
}


app.UseAuthentication();
app.UseAuthorization();

app.UseStaticFiles();

app.Use(async (context, next) =>
{
    Console.WriteLine($"Request: {context.Request.Method} {context.Request.Path}");
    await next();
});

app.MapHealthChecks("/health");

app.MapControllers();

app.Run();
