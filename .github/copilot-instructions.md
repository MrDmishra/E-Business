# E-Commerce Application - AI Coding Agent Instructions

## Architecture Overview

This is a **Spring Boot 3.3.5 + Static React** e-commerce application with a clear backend/frontend separation:

- **Backend**: Java 21, Spring Boot with JPA, Spring Security (JWT skeleton), PostgreSQL/MySQL support
- **Frontend**: Static React via CDN (no build step) - uses in-browser Babel transformation for JSX
- **Database**: Flyway migrations disabled; uses `data.sql`/`schema.sql` for initialization with `spring.sql.init.mode=always`

**Key architectural decision**: The frontend is intentionally kept as a simple static `index.html` using CDN-hosted React for rapid prototyping without build tooling. For production, assets should be precompiled.

## Project Structure

```
backend/
  src/main/java/com/example/ecommerce/
    controller/      # REST endpoints (e.g., ProductController)
    model/           # JPA entities (e.g., Product)
    repository/      # Spring Data JPA repositories
    security/        # SecurityConfig with JWT skeleton (JwtUtil exists but auth not fully wired)
  src/main/resources/
    application.properties      # MySQL config (port 8080)
    application-prod.properties # PostgreSQL variant
    data.sql / schema.sql       # Initial DB data (runs on startup)
    db/migration/               # Flyway migrations (currently disabled)
    static/                     # Serve frontend from here for integration
frontend/
  index.html       # Single-file React app (uses CDN, Babel in-browser)
docker-compose.yml # PostgreSQL 15 container (user: postgres, pass: postgres, db: ecommerce)
```

## Development Workflows

### Starting the Application

**Backend** (from workspace root):
```powershell
cd "c:\Users\deepesh.mishra\Desktop\E Business\backend"
mvn spring-boot:run
```
Backend runs on `http://localhost:8080` with API at `/api/products`.

**Database** (PostgreSQL via Docker):
```powershell
docker-compose up -d
```
Note: Default `application.properties` uses **MySQL** (localhost:3306, root/root). Switch to PostgreSQL by using `-Dspring.profiles.active=prod` or copy `application-prod.properties` settings.

**Frontend Options**:
1. **Development**: Open `frontend/index.html` directly in browser (calls backend at localhost:8080)
2. **Integrated**: Copy `frontend/index.html` to `backend/src/main/resources/static/index.html` and access via `http://localhost:8080/`

### Testing

Run integration tests:
```powershell
cd backend
mvn test
```
Tests use H2 in-memory database (see `application-test.properties`). Example test: `ProductControllerIntegrationTest.java` validates API endpoints.

### Building

```powershell
cd backend
mvn clean package
```
Generates `target/ecommerce-backend-0.0.1-SNAPSHOT.jar` (executable JAR).

## Critical Conventions

### Database Management
- **Flyway is DISABLED** (`spring.flyway.enabled=false`)
- Schema/data initialization uses Spring's `spring.sql.init.mode=always` with `schema.sql` and `data.sql`
- Flyway migrations exist in `db/migration/` but are not active
- When switching databases, update both `spring.datasource.*` properties AND change `ddl-auto` if needed

### Security Configuration
- Spring Security is configured but **CSRF is globally disabled** (see `SecurityConfig.java`)
- Public endpoints: `/api/products/**`, `/api/auth/**`, all static resources
- JWT utilities exist (`security/JwtUtil` skeleton) but full auth flow is **not implemented**
- JWT secret configured in `application.properties` (`app.jwtSecret`) - change for production

### API Design
- RESTful endpoints under `/api/*` namespace
- Controllers use constructor injection (no `@Autowired` on fields)
- Standard Spring Data JPA pattern: `JpaRepository<Entity, ID>` interfaces with no custom implementations
- Example: `ProductController` → `ProductRepository` → `Product` entity

### Entity Patterns
- JPA entities use `@Entity`, `@Table(name="...")`, `@GeneratedValue(strategy=IDENTITY)`
- No Lombok - explicit getters/setters (comment in `pom.xml` notes Lombok was removed)
- BigDecimal for monetary values (see `Product.price`)

### Frontend Integration
- React app fetches from `/api/products` (expects JSON array)
- No CORS issues when served from same origin (backend's `/static` folder)
- CSS is inline in `<style>` tag - utility-first approach with custom properties

## Common Tasks

### Adding a New Entity
1. Create JPA entity in `model/` with `@Entity`, `@Table`, getters/setters
2. Create repository interface extending `JpaRepository<Entity, ID>` in `repository/`
3. Add controller in `controller/` with `@RestController`, `@RequestMapping("/api/entityname")`
4. Update `schema.sql` or add Flyway migration if enabling Flyway
5. Add test data to `data.sql` if needed

### Implementing JWT Auth
The skeleton exists but needs:
1. User entity + repository
2. `/api/auth/login` and `/api/auth/register` endpoints
3. Wire `JwtUtil` into a filter (extend `OncePerRequestFilter`)
4. Update `SecurityConfig` to add JWT filter before `UsernamePasswordAuthenticationFilter`

### Switching to PostgreSQL
Use the `prod` profile or update `application.properties`:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/ecommerce
spring.datasource.driverClassName=org.postgresql.Driver
spring.datasource.username=postgres
spring.datasource.password=postgres
```
Ensure `docker-compose up -d` is running.

### Production Frontend Build with Vite

The current `frontend/index.html` uses CDN React for development only. For production:

**1. Set up Vite build structure:**
```powershell
cd frontend
# Create proper React + Vite structure if not already done
npm install vite @vitejs/plugin-react react react-dom
```

**2. Configure `vite.config.js`:**
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: '../backend/src/main/resources/static',
    emptyOutDir: true
  },
  server: {
    proxy: {
      '/api': 'http://localhost:8080'
    }
  }
})
```

**3. Create proper React entry files:**
- Move JSX from `index.html` `<script type="text/babel">` to `src/main.jsx`
- Create `src/App.jsx` for component logic
- Update `public/index.html` to standard HTML (no inline scripts)
- Import React normally: `import React from 'react'` instead of `const React = window.React`

**4. Build and deploy:**
```powershell
cd frontend
npm run build  # Outputs to backend/src/main/resources/static/
cd ../backend
mvn clean package  # Creates JAR with bundled frontend
```

**5. Package.json scripts:**
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

After building, the Spring Boot JAR will serve the compiled React app at `http://localhost:8080/` with all assets properly bundled.

## File Naming & Locations
- Controllers: `*Controller.java` in `controller/` package
- Entities: Plain names (`Product.java`) in `model/` package  
- Repositories: `*Repository.java` in `repository/` package
- Config: `*Config.java` in package root or `security/`
- Tests: Mirror source structure in `src/test/java/` with `*Test.java` suffix

## Dependencies & Versions
- Spring Boot: 3.3.5 (parent POM)
- Java: 21 (target version)
- JWT: jjwt 0.12.3 (api, impl, jackson)
- Database drivers: PostgreSQL (runtime), MySQL Connector/J (runtime), H2 (test)
- Flyway: Included but disabled by default

When adding dependencies, maintain the Spring Boot managed versions unless specific version required.
