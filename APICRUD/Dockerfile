## Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Expect build context to be the project directory (APICRUD/APICRUD)
COPY *.csproj ./
RUN dotnet restore

COPY . .
RUN dotnet publish -c Release -o /app/publish

## Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

# Create Storage dir for uploaded files
RUN mkdir -p /app/Storage

# Copy published output
COPY --from=build /app/publish .

# Expose port
EXPOSE 5000

# Environment for ASP.NET Core
ENV ASPNETCORE_URLS=http://0.0.0.0:5000 \
    ASPNETCORE_ENVIRONMENT=Production

ENTRYPOINT ["dotnet", "APICRUD.dll"]


