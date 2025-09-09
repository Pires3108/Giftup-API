using APICRUD.Infraestrutura;
using APICRUD.Model;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);

// Force Kestrel to listen on 0.0.0.0:5000
builder.WebHost.ConfigureKestrel(options =>
{
    options.ListenAnyIP(5000);
});

// Optional: also ensure URLs (helps with some hosting setups)
builder.WebHost.UseUrls("http://0.0.0.0:5000");

// Configuração de controllers com validação melhorada
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.WriteIndented = true;
    });

// Habilita parsing de JWT para endpoints com [Authorize] (públicos seguem abertos)
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

builder.Services.AddDbContext<ConnectionContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Swagger simples
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

// Reposit�rios
builder.Services.AddTransient<IclienteRepository, clienteRepository>();
builder.Services.AddTransient<IitemRepository, itemRepository>();
builder.Services.AddTransient<IpedidoRepository, pedidoRepository>();
builder.Services.AddTransient<IpedidoItemRepository, pedidoItemRepository>();

// Health Checks
builder.Services.AddHealthChecks();

// CORS - configuração melhorada para desenvolvimento e produção
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
                "http://localhost:5173", 
                "http://127.0.0.1:5173",
                "http://localhost:3000",
                "http://127.0.0.1:3000"
              )
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
    
    // Política mais restritiva para produção
    options.AddPolicy("Production", policy =>
    {
        policy.WithOrigins("https://yourdomain.com")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

// Criar banco de dados automaticamente
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<ConnectionContext>();
    context.Database.EnsureCreated();
}

// Garantir que a pasta de armazenamento de arquivos exista
var storagePath = Path.Combine(app.Environment.ContentRootPath, "Storage");
Directory.CreateDirectory(storagePath);

// Middleware
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "APICRUD API v1");
        c.RoutePrefix = string.Empty; // Swagger UI na raiz
    });
}

// Não forçar redirecionamento para HTTPS em ambiente de desenvolvimento/docker
if (app.Environment.IsProduction())
{
    app.UseHttpsRedirection();
}

// Configuração de CORS baseada no ambiente
if (app.Environment.IsDevelopment())
{
    app.UseCors("AllowFrontend");
}
else
{
    app.UseCors("Production");
}

// Habilita middleware de autenticação/autorizaçao para suportar [Authorize]
app.UseAuthentication();
app.UseAuthorization();
// Health Check endpoint
app.MapHealthChecks("/health");

app.MapControllers();

app.Run();
