# E-Commerce Application - AI Coding Agent Instructions

## Architecture Overview

This is a **multi-frontend e-commerce platform** with Spring Boot backend and three separate frontends:

- **Backend**: Java 21, Spring Boot 3.5.0 with JPA, Spring Security (JWT implemented), MySQL primary/PostgreSQL optional
- **Admin Frontend** (`frontend/`): React + Vite on port 5173 - admin dashboard with product/order/customer management
- **Customer Frontend** (`customer-frontend/`): React + Vite on port 3000 - public shopping site with modern gradient UI (purple-blue theme)
- **Mobile App** (`mobile-app/`): React Native with Expo - native iOS/Android shopping app

**Critical architectural insight**: This codebase has TWO product/item models (`Product` and `Item`) that coexist:
- **Product**: Legacy table with simple structure (id, name, price, description, imageUrl) in `products` table
- **Item**: Full-featured model with SKU, brand, weight, ItemStatus enum, relationships to ItemImage and ItemCategory in `items` table
- Controllers serve both models: `ProductController` and `ItemController` exist separately
- Customer frontend and mobile app primarily use Items API (`/api/items`), admin frontend manages both

**Database**: Flyway disabled (`spring.flyway.enabled=false`), schema managed via JPA `ddl-auto=update` + manual `schema.sql`
- Database name typo: `ebussiness` (not `ebusiness`) in `application.properties` - keep for compatibility

## Project Structure

```
backend/
  src/main/java/com/example/ecommerce/
    controller/      # 15+ REST controllers (ProductController, ItemController, OrderController, CartController, etc.)
    model/           # 30+ JPA entities (dual Product/Item model, Consumer, Order, Cart, Review, Banner, Coupon, etc.)
    repository/      # Spring Data JPA repositories
    dto/             # Data Transfer Objects (ItemDTO for complex item responses with images/categories)
    security/        # SecurityConfig (CORS enabled for all 3 frontends), JwtUtil (fully wired)
  src/main/resources/
    application.properties      # MySQL config (localhost:3306, db=ebussiness, user=root, port 8080)
    schema.sql                 # Full database schema (manual maintenance, not auto-loaded)
    data.sql                   # Initial seed data (exists but not loaded due to spring.sql.init.mode=never)
    db/migration/              # Flyway migrations (exist but disabled via spring.flyway.enabled=false)
frontend/                      # Admin dashboard (React + Vite)
  src/
    components/                # ProductManagement, ItemManagement, OrderManagement, CategoryManagement, etc.
                              # NotificationBar, ToastNotification (alert system)
    context/AlertContext.jsx   # Provides useAlert() hook for success/error/warning/info alerts
    App.jsx                    # Tab-based admin UI with 30min auto-logout, localStorage session persistence
  vite.config.js               # Dev proxy to :8080, builds to ../backend/src/main/resources/static/
  ALERT_SYSTEM_GUIDE.md        # Documentation for using alert system with useAlert() hook
  RICH_TEXT_GUIDE.md           # Documentation for Quill rich text editor (used in ShippingInfo, etc.)
customer-frontend/             # Customer-facing shop (React + Vite)
  src/
    pages/                     # HomePage, ProductPage, CartPage, CheckoutPage, LoginPage, etc.
    components/                # Header, Footer
    App.jsx                    # Client-side routing via state, cart persistence in localStorage
  index.css                    # Global styles with custom animations (@keyframes spin, fadeIn, slideInLeft/Right)
  vite.config.js               # Dev proxy to :8080, port 3000
  DESIGN_UPDATE.md             # Design system documentation (purple-blue gradient theme, glass-morphism)
mobile-app/                    # React Native app (Expo)
  src/
    screens/                   # HomeScreen, ProductScreen, CartScreen, CheckoutScreen, etc.
    context/                   # AuthContext, CartContext
    services/api.js            # Axios client (API_BASE_URL configuration - MUST match local IP)
docker-compose.yml             # PostgreSQL 15 container (not used by default, MySQL is primary)
```

## Development Workflows

### Starting the Application

**Backend** (from workspace root):
```powershell
cd "c:\Users\deepesh.mishra\Desktop\E Business\backend"
mvn spring-boot:run
```
Backend runs on `http://localhost:8080` with API at `/api/*`.

**Database**: Default uses **MySQL** (localhost:3306, user=root, pass=root, db=ebussiness). PostgreSQL via Docker exists but is not the default:
```powershell
docker-compose up -d  # PostgreSQL on :5432 (user=postgres, pass=postgres, db=ecommerce)
```

**Admin Frontend** (port 5173):
```powershell
cd frontend
npm run dev
```
Access at `http://localhost:5173`. Includes 30-minute auto-logout feature with localStorage persistence.

**Customer Frontend** (port 3000):
```powershell
cd customer-frontend
npm run dev
```
Access at `http://localhost:3000`. Features modern gradient UI (purple-blue theme) with glass-morphism effects.

**Mobile App** (Expo):
```powershell
cd mobile-app
npm start
# Then: npm run android / npm run ios / npm run web
```
**Critical**: Update `API_BASE_URL` in `mobile-app/src/services/api.js` to match your local IP (e.g., `http://172.20.10.3:8080/api` for physical devices, `http://10.0.2.2:8080/api` for Android emulator).

### Testing

Run backend tests (currently no test files exist - placeholder for future):
```powershell
cd backend
mvn test
```

### Building

**Backend JAR**:
```powershell
cd backend
mvn clean package
```
Generates `target/ecommerce-backend-0.0.1-SNAPSHOT.jar`.

**Admin Frontend Build** (outputs to backend static resources):
```powershell
cd frontend
npm run build  # Outputs to ../backend/src/main/resources/static/
cd ../backend
mvn clean package  # JAR includes admin frontend
```

**Customer Frontend Build**:
```powershell
cd customer-frontend
npm run build  # Outputs to dist/
```

## Critical Conventions

### Database Management
- **Flyway is DISABLED** (`spring.flyway.enabled=false`)
- Schema initialization: JPA `ddl-auto=update` + manual `schema.sql` (note: `spring.sql.init.mode=never`)
- Flyway migrations exist in `db/migration/` but are not active
- **Dual model architecture**: Both `Product` (legacy) and `Item` (full-featured) tables exist
  - `Product`: Simple 5-field table (id, name, description, price, imageUrl)
  - `Item`: Complex model with SKU, brand, weight, ItemStatus enum, relationships to ItemImage and ItemCategory
  - When creating features, prefer `Item` unless maintaining legacy endpoints

### Security Configuration
- Spring Security configured with CORS fully enabled for all three frontends
- **CSRF globally disabled** (`SecurityConfig.java`)
- Public endpoints: All `/api/**` routes currently public (see `SecurityConfig` for full list)
- JWT utilities exist and **ARE wired** (`AuthController` implements login/register with `JwtUtil`)
- Plain-text password comparison (TODO comment exists - add BCrypt hashing for production)
- JWT secret in `application.properties` (`app.jwtSecret`) - change for production

### API Design
- RESTful endpoints under `/api/*` namespace
- 15+ controllers including: ProductController, ItemController, OrderController, CartController, ReviewController, etc.
- Controllers use constructor injection (no `@Autowired` on fields)
- Standard Spring Data JPA pattern: `JpaRepository<Entity, ID>` interfaces
- DTOs exist for complex responses (`dto/` package) - use for cart, orders, reviews, etc.

### Entity Patterns
- JPA entities use `@Entity`, `@Table(name="...")`, `@GeneratedValue(strategy=IDENTITY)`
- **No Lombok** - explicit getters/setters (`pom.xml` comment notes Lombok removed)
- BigDecimal for monetary values (price fields)
- Enums for status fields (e.g., `ItemStatus.ACTIVE`, `ItemStatus.OUT_OF_STOCK`)

### Frontend Integration
- **Admin Frontend** (`frontend/`): 
  - Tab-based UI with 30-minute auto-logout timer stored in localStorage
  - Alert system via `AlertContext`: Use `useAlert()` hook for success/error/warning/info notifications
  - Quill rich text editor for descriptions (see `RICH_TEXT_GUIDE.md`)
  - NotificationBar + ToastNotification components for dual alert display (toast + persistent notifications)
- **Customer Frontend** (`customer-frontend/`): 
  - Client-side routing via state management (no React Router)
  - Cart persistence in localStorage
  - Modern purple-blue gradient UI theme with glass-morphism effects (see `DESIGN_UPDATE.md`)
  - Custom animations: `@keyframes spin`, `fadeIn`, `slideInLeft`, `slideInRight` in `index.css`
  - Hero sections, pill-style category filters, gradient CTAs
- **Mobile App**: 
  - AsyncStorage for cart/user persistence
  - React Navigation with bottom tabs
  - Requires IP configuration in `api.js` (physical device vs emulator)
- All frontends use Vite dev proxy (`/api` → `http://localhost:8080`) for CORS-free development

## Common Tasks

### Adding a New Entity
1. Create JPA entity in `model/` with `@Entity`, `@Table`, getters/setters (no Lombok)
2. Create repository interface extending `JpaRepository<Entity, ID>` in `repository/`
3. Add controller in `controller/` with `@RestController`, `@RequestMapping("/api/entityname")`
4. Update `schema.sql` with CREATE TABLE statement (Flyway disabled, manual SQL maintenance)
5. If needed, create DTO in `dto/` package for complex responses
6. Add public endpoint to `SecurityConfig` if unauthenticated access required

### Working with Dual Product Models
- **Use `Item`** for new features (full model with categories, images, inventory)
- **Use `Product`** only when maintaining existing legacy endpoints
- ItemController and ProductController both exist - check which clients use which
- Customer frontend and mobile app primarily use Items API (`/api/items`)
- Admin frontend has separate management for both Products and Items

### Implementing Authentication Features
JWT is already implemented:
1. `AuthController` has `/api/auth/login` and `/api/auth/register` working
2. `JwtUtil` generates tokens (configured secret in `application.properties`)
3. **TODO**: Add BCrypt password hashing (currently plain-text comparison)
4. **TODO**: Add JWT filter for protected endpoints (skeleton exists but not enforced)
5. User entity exists with name/email/password fields

### Switching to PostgreSQL
Use the Docker container or local PostgreSQL:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/ecommerce
spring.datasource.driverClassName=org.postgresql.Driver
spring.datasource.username=postgres
spring.datasource.password=postgres
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
```
Ensure `docker-compose up -d` is running if using containerized DB.

### Production Frontend Build with Vite

Both admin and customer frontends use Vite for production builds:

**Admin Frontend** (builds to backend static resources):
```powershell
cd frontend
npm run build  # vite.config.js outputs to ../backend/src/main/resources/static/
```

**Customer Frontend** (standalone build):
```powershell
cd customer-frontend
npm run build  # Outputs to dist/ directory
```

**Mobile App** (Expo builds):
```powershell
cd mobile-app
# For development builds
eas build --profile development --platform android
eas build --profile development --platform ios

# For production
eas build --profile production --platform all
```

After building admin frontend, package with Spring Boot:
```powershell
cd backend
mvn clean package  # Creates JAR with bundled frontend at root path
```

## Mobile App Configuration

### API URL Setup (CRITICAL)
Update `mobile-app/src/services/api.js` based on environment:
- **Physical Android Device**: Use computer's local network IP (e.g., `http://172.20.10.3:8080/api`)
- **Android Emulator**: `http://10.0.2.2:8080/api` 
- **iOS Simulator**: `http://localhost:8080/api`
- Find your IP: Run `ipconfig` (Windows) and look for IPv4 under Wi-Fi/Ethernet

### Common Mobile Issues
1. **API not connecting**: Verify backend is running and IP address is correct
2. **CORS errors**: Check `SecurityConfig` includes mobile app origin
3. **AsyncStorage errors**: Clear app data/reinstall if cart state is corrupted
4. **Image not loading**: Item images use `ItemImage` entity with `imageUrl` field

## File Naming & Locations
- Controllers: `*Controller.java` in `controller/` package
- Entities: Plain names (`Product.java`) in `model/` package  
- Repositories: `*Repository.java` in `repository/` package
- Config: `*Config.java` in package root or `security/`
- Tests: Mirror source structure in `src/test/java/` with `*Test.java` suffix

## Dependencies & Versions
- Spring Boot: 3.5.0 (parent POM)
- Java: 21 (target version)
- JWT: jjwt 0.12.3 (api, impl, jackson)
- Database drivers: PostgreSQL (runtime), MySQL Connector/J (runtime), H2 (test)
- Flyway: Included but disabled by default

When adding dependencies, maintain the Spring Boot managed versions unless specific version required.
