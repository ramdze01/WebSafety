# WebSafety

WebSafety is a simple fullstack web application that checks basic website security headers.

The project is built with:

- React
- TypeScript
- .NET
- C#

## Features

- Scan a website URL
- Check if the website uses HTTPS
- Check for common security headers:
  - Strict-Transport-Security
  - Content-Security-Policy
  - X-Frame-Options
  - X-Content-Type-Options
- Show HTTP status code
- Calculate a simple security score
- Show a security grade
- Explain what each security check means

## Why this project exists

This project was created to practice fullstack development and basic web security concepts.

It is not a vulnerability scanner and does not perform attacks, brute force, port scanning or exploitation.  
It only checks public HTTP response headers.

## Backend

The backend is built with .NET.

To run the backend:

```powershell
cd WebSafety.Api
dotnet run