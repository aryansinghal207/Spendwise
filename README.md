# SpendWise

AI-Driven Personal Finance Advisor — demo project (Spring Boot backend + React frontend).

What I added/changed:

- Backend: Spring Boot application with JPA and PostgreSQL integration.
- Frontend: Vite + React app in `frontend/` which is built and copied into `src/main/resources/static` during `mvn package`.
- `application.properties` now reads DB settings from environment variables with defaults.
- `.env.example` provided with sample database credentials.

Quick start (development)

1. Ensure PostgreSQL is running and create the database and user (example):

```sql
CREATE DATABASE spendwise_db;
CREATE USER spendwise_user WITH ENCRYPTED PASSWORD 'REMOVED_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE spendwise_db TO spendwise_user;
-- And ensure schema public allows CREATE/USAGE for the user if needed
```

2. Set environment variables (PowerShell):

```powershell
$env:DB_URL='jdbc:postgresql://localhost:8000/spendwise_db'
$env:DB_USER='spendwise_user'
$env:DB_PASSWORD='REMOVED_PASSWORD'
```

3. Build and run

There are two options to produce a runnable jar that serves the React UI.

Option A — recommended (use the included helper which builds the frontend then packages):

```powershell
# Ensure Node (LTS) is installed and available on PATH, then run the helper
./build-frontend.ps1
```

Option B — let Maven run the frontend build (requires Node/npm on PATH). Enable the profile:

```powershell
./mvnw.cmd -Pwith-frontend -DskipTests clean package
java -jar target/SpendWise-0.0.1-SNAPSHOT.jar
```

4. Open the app in your browser:

 - Frontend: `http://localhost:8080/`
 - API: `http://localhost:8080/api/users`

Frontend development

If you prefer to run the React dev server while developing UI changes:

```powershell
# from repository root
cd frontend
npm install
npm run dev
```

Building & cleanup helpers

There are two helper scripts at the project root:

- `build-frontend.ps1` — verifies `node` is available, runs `npm ci` and `npm run build` in `frontend/`, then runs `mvnw.cmd -DskipTests clean package` to produce the jar.
- `cleanup_node.ps1` — removes any stray `frontend/node/` or `frontend/node_modules/` directories that might contain a platform-specific Node binary (useful if the repo accidentally contains a downloaded node executable).

If you prefer to build the frontend manually:

```powershell
cd frontend
npm ci
npm run build
cd ..
./mvnw.cmd -DskipTests clean package
```

Notes about static frontends

- There used to be a simple static SPA under `src/main/resources/static`. To avoid duplication this legacy static app has been moved to `frontend/legacy_static`. The React app in `frontend/` is now the primary frontend for production and will be built into `frontend/dist` and copied into the Spring Boot static resources during `mvn package`.
- During development run `npm run dev` from `frontend/`. The Vite dev server is configured to proxy `/api` to `http://localhost:8080` so network requests to `/api/users` work out-of-the-box while the backend runs on port 8080.

Production build (automated by Maven)

When you run `mvn package`, Maven will run the frontend build and copy the files into the Spring Boot static resources so the packaged jar serves the UI.

Next suggestions

- Add Docker Compose so Postgres + the app can be started together for demos.
- Add CORS configuration if you run the frontend dev server on a separate port.
- Add unit/integration tests for backend and frontend.