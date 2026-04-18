# Stage 1: build
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY . .
RUN dotnet restore
RUN dotnet publish -c Release -o /app/publish

# Stage 2: runtime
FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app

ARG PORT=5069
ENV ASPNETCORE_URLS=http://+:${PORT}

# Expose port
EXPOSE ${PORT}

# Copy published files from build stage
COPY --from=build /app/publish .

# Run your DLL (replace MyBackend.dll with your actual project DLL)
CMD ["dotnet", "MyBackend.dll"]
