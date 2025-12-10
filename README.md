# Ecommerce Starter (Spring Boot backend + React frontend)

This repository contains a minimal starter scaffold for an e-commerce application:

- Backend: Java 17, Spring Boot (Maven)
- Database: PostgreSQL (docker-compose provided)
- Frontend: React (Create React App) — instructions below to generate the frontend scaffold

Quick start (Windows PowerShell):

1. Start PostgreSQL with Docker Compose

```powershell
docker-compose up -d
```

2. From the workspace root start the backend:

```powershell
cd "c:\Users\deepesh.mishra\Desktop\E Business\backend"
mvn spring-boot:run
```

3. Create the frontend (locally) using Create React App (only once):

```powershell
cd "c:\Users\deepesh.mishra\Desktop\E Business"
npx create-react-app frontend
cd frontend
npm start
```

Notes and next steps:
- JWT: a `JwtUtil` and basic `SecurityConfig` skeleton are included under `backend/src/main/java/com/example/ecommerce/security`.
- Admin/API: protect admin routes with role checks once user auth is implemented.
- Payments: integrate Stripe on the backend to create PaymentIntents; use env vars for keys.
- File uploads: add S3-compatible client (AWS SDK or MinIO) and endpoints for signed upload URLs.

If you want, I can:
- Add full JWT login/register endpoints and user entity.
- Scaffold a minimal React frontend with product list and cart.
- Add Stripe endpoints and example frontend payment flow.
