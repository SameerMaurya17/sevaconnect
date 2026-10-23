# SevaConnect - Smart Volunteer Management System
Built for SevaDeep Foundation. React + Spring Boot + PostgreSQL.

## Project structure
```
sevaconnect/
├── README.md
├── backend/
│   ├── pom.xml
│   ├── Dockerfile                      (used by Render)
│   └── src/main/
│       ├── resources/application.properties
│       └── java/com/sevadeep/sevaconnect/
│           ├── SevaConnectApplication.java
│           ├── config/       SecurityConfig.java, DataSeeder.java
│           ├── entity/       User.java, Event.java, Registration.java
│           ├── repository/   UserRepository, EventRepository, RegistrationRepository
│           ├── dto/          Dtos.java, Mappers.java
│           ├── service/      CustomUserDetailsService, CurrentUserService, MatcherService
│           ├── controller/   AuthController, ProfileController, EventController, AdminController
│           └── exception/    GlobalExceptionHandler.java
└── frontend/
    ├── package.json, vite.config.js, index.html, vercel.json, .env.example
    └── src/
        ├── main.jsx, App.jsx, index.css
        ├── api.js, AuthContext.jsx, constants.js, ui.js, useEvents.js
        ├── components/   Navbar, ProtectedRoute, CheckboxGroup, Alert
        └── pages/        Login, Register, Events, Profile,
                          AdminEvents, Matcher, Attendance
```

## Run locally

**Needs:** JDK 17+, Maven (or IntelliJ), Node 18+, PostgreSQL.

1. Create the database (pgAdmin, or `psql`):
   ```sql
   CREATE DATABASE sevaconnect;
   ```
2. Open `backend/src/main/resources/application.properties` and set your PostgreSQL
   password (default is `postgres`), or set the env var `DB_PASSWORD`.
3. Start the backend (tables and demo data are created automatically):
   ```bash
   cd backend
   mvn spring-boot:run
   ```
   It runs on http://localhost:8080
4. Start the frontend in a second terminal:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Open http://localhost:5173

**Demo accounts (created on first start)**

| Role | Email | Password |
|---|---|---|
| Admin | admin@seva.org | admin123 |
| Volunteer | priya@seva.org | volunteer123 |
| Volunteer | rahul@seva.org, anita@seva.org, rohan@seva.org, sneha@seva.org | volunteer123 |

## Smart Matcher
`Score = 50% skills + 30% interests + 20% availability`
- Skills: matched required skills / total required skills (100% if the event needs none)
- Interest: volunteer's causes include the event category
- Availability: volunteer is free on the weekday of the event date
Volunteers already registered for the event are excluded; results are sorted high to low.

## API
| Method | URL | Access |
|---|---|---|
| POST | /api/auth/register | public |
| GET | /api/me | logged in (also used for login) |
| PUT | /api/me | logged in |
| GET | /api/me/registrations | logged in |
| GET | /api/events | logged in |
| POST / DELETE | /api/events/{id}/join | volunteer |
| POST | /api/admin/events | admin |
| PUT / DELETE | /api/admin/events/{id} | admin |
| GET | /api/admin/events/{id}/matches | admin |
| GET | /api/admin/events/{id}/registrations | admin |
| PUT | /api/admin/registrations/{id}/attendance | admin |

Authentication is HTTP Basic (email + password) with BCrypt-hashed passwords.
In Postman use Authorization -> Basic Auth.

## Deploy
1. **Supabase:** create a project. In Connect, copy the **Session pooler** details
   (host like `aws-0-xx.pooler.supabase.com`, port 5432, user `postgres.<project-ref>`).
2. **Render (backend):** New Web Service -> your repo -> Root Directory `backend` -> Runtime **Docker**.
   Environment variables:
   - `DB_URL` = `jdbc:postgresql://<pooler-host>:5432/postgres?sslmode=require`
   - `DB_USER` = `postgres.<project-ref>`
   - `DB_PASSWORD` = your Supabase database password
   - `CORS_ORIGINS` = `http://localhost:5173` (change to your Vercel URL after step 3)
3. **Vercel (frontend):** import repo -> Root Directory `frontend` -> Framework Vite.
   Environment variable `VITE_API_URL` = your Render URL (no trailing slash).
4. Go back to Render, set `CORS_ORIGINS` to your Vercel URL (e.g. `https://sevaconnect.vercel.app`),
   and redeploy.

Render's free tier sleeps when idle; the first request can take about 50 seconds.

## Troubleshooting
| Problem | Fix |
|---|---|
| `password authentication failed` | Wrong DB password in `application.properties` |
| `database "sevaconnect" does not exist` | Run `CREATE DATABASE sevaconnect;` |
| Port 8080 already in use | Stop the other app, or set env var `PORT=8081` and update `VITE_API_URL` |
| Browser shows a CORS error | Add your frontend URL to `CORS_ORIGINS` and restart the backend |
| "Cannot reach the server" in the UI | Backend is not running, or `VITE_API_URL` is wrong |
| Page not found on refresh (Vercel) | Make sure `vercel.json` is inside the `frontend` folder |
