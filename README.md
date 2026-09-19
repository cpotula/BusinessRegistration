# Business Registration Portal

Business portal with a .NET 10 API backend and a React + Vite + Tailwind UI.

## Prerequisites

- .NET 10 SDK
- Node.js (npm)
- SQL Server Express (SQLEXPRESS) with an existing `BusinessRegistrationDB` database

The connection string uses Windows authentication:

```
Server=.\SQLEXPRESS;Database=BusinessRegistrationDB;Trusted_Connection=True;TrustServerCertificate=True
```

## Quick start

Double-click `start.bat`, or run manually:

```bat
dotnet run --project API
```
in one terminal, and in another:
```bat
npm run dev --prefix UI
```

- API: http://localhost:5100 (Swagger at http://localhost:5100/swagger)
- UI: http://localhost:5173

## First-time / after a fresh clone or checkout

Those two commands fail with the errors below unless you do these first steps:

1. Create the uploads folder (the API crashes without it):
   ```
   mkdir API\Uploads
   ```
   > Error if skipped: `System.IO.DirectoryNotFoundException: ...\API\Uploads\` at `Program.cs:89`

2. Install UI dependencies (node_modules is gitignored):
   ```
   npm install --prefix UI
   ```
   > Error if skipped: `'vite' is not recognized ...`

`start.bat` performs both of these automatically before launching the servers.

## Notes

- `Jwt:Key` in `API/appsettings.json` is a placeholder (`CHANGE_ME...`). Replace it with a long random secret before production.
- Database migrations are applied automatically on startup (`DbSeeder`).