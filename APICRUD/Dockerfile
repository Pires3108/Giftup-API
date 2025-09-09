# Etapa 1: build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

# Copia csproj e restaura dependências (cache layer)
COPY *.csproj ./
RUN dotnet restore --no-cache

# Copia tudo e publica
COPY . ./
RUN dotnet publish -c Release -o out --no-restore

# Etapa 2: runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

# Instala curl para health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Cria usuário não-root para segurança
RUN adduser --disabled-password --gecos '' appuser && chown -R appuser /app
USER appuser

# Copia os arquivos publicados
COPY --from=build /app/out .

# Expõe a porta 5000 (conforme configurado no Program.cs)
EXPOSE 5000

# Configura variáveis de ambiente
ENV ASPNETCORE_URLS=http://0.0.0.0:5000
ENV ASPNETCORE_ENVIRONMENT=Production
ENV DOTNET_RUNNING_IN_CONTAINER=true

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

ENTRYPOINT ["dotnet", "APICRUD.dll"]
