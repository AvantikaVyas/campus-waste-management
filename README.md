# Campus Waste Management

A deployable campus waste reporting and operations system with separate Student and Staff portals.

## Stack
- Frontend: React + Vite + React Router + Leaflet
- Backend: FastAPI + SQLAlchemy
- Database: SQLite for local development; PostgreSQL when `DATABASE_URL` is configured
- Authentication: JWT + hashed passwords + backend role checks

## Features
- Student registration/login and staff login
- Student issue reporting with optional image URL
- Complaint tracking and history
- Staff bin CRUD, report assignment/status updates
- Campus locations and map markers
- Hotspot scoring and dashboard analytics
- Seed command to create demo locations, bins and a staff account

## 1. Run locally

Requirements: Python 3.11+ and Node.js 20+.

### Backend
```bash
cd backend
python -m venv .venv
# macOS/Linux:
source .venv/bin/activate
# Windows:
# .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
python seed.py
uvicorn app.main:app --reload
```
Backend: http://localhost:8000  
API docs: http://localhost:8000/docs

Demo staff login:
- Email: `staff@campus.edu`
- Password: `ChangeMe123!`

Change this password before deploying publicly.

### Frontend
In another terminal:
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```
Frontend: http://localhost:5173

A student can register from the Student portal. Public registration always creates a student account; staff accounts must be provisioned by an administrator.

## 2. Public deployment

This repository is arranged as one GitHub repository with `frontend/` and `backend/`.

### Database (Supabase PostgreSQL)
1. Create a Supabase project.
2. Copy its PostgreSQL connection string from Project Settings / Database.
3. Use the pooler connection string if your hosting provider requires IPv4 or pooled connections.
4. Keep the password private.

### Backend (Render)
1. Push this folder to GitHub.
2. In Render, create a **Web Service** connected to the repository.
3. Set Root Directory to `backend`.
4. Build command: `pip install -r requirements.txt`
5. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
6. Add environment variables:
   - `DATABASE_URL` = Supabase PostgreSQL connection string
   - `JWT_SECRET` = a long random secret (at least 32 characters)
   - `FRONTEND_ORIGINS` = your Vercel URL, e.g. `https://your-project.vercel.app`
   - `BOOTSTRAP_STAFF_EMAIL` = optional staff email for initial bootstrap
   - `BOOTSTRAP_STAFF_PASSWORD` = optional strong staff password
7. Deploy. Test `https://YOUR-API.onrender.com/health` and `/docs`.

On first startup, the app creates tables and optionally creates the bootstrap staff account if both bootstrap variables are supplied. Do not use the demo credentials on a public server.

### Frontend (Vercel)
1. Import the same GitHub repository into Vercel.
2. Set Root Directory to `frontend`.
3. Framework preset: Vite.
4. Build command: `npm run build`.
5. Output directory: `dist`.
6. Add environment variable:
   - `VITE_API_URL` = your Render backend URL, e.g. `https://your-api.onrender.com`
7. Deploy.

### After deployment
- Update `FRONTEND_ORIGINS` on Render to the exact Vercel production URL.
- Redeploy the backend after changing it.
- Register a student account and test report submission.
- Use the bootstrap staff account to test the staff portal.
- Set a strong, unique staff password.
- Configure automated database backups in your database provider.

## Security and production notes
- The API enforces student/staff permissions server-side; hiding frontend links is not security.
- Passwords are hashed; JWT secret must be private.
- Public registration creates student accounts only.
- Use HTTPS URLs in production.
- This starter stores report image URLs rather than accepting binary uploads. Add Cloudinary or Supabase Storage before enabling public image uploads.
- The initial schema is created automatically for convenience. For a long-lived production system, add Alembic migrations before evolving database schemas.
- Configure database backups, rate limiting, monitoring and an institutional privacy policy before campus-wide rollout.
- The initial hotspot score is a transparent heuristic, not an AI prediction.

## API overview
- `POST /api/v1/auth/register` — student registration
- `POST /api/v1/auth/login` — login
- `GET /api/v1/auth/me` — current user
- `GET/POST /api/v1/locations` — list locations / staff creates location
- `GET/POST /api/v1/bins` — list bins / staff creates bin
- `PATCH /api/v1/bins/{id}` — staff updates bin
- `GET/POST /api/v1/reports` — list reports / submit report
- `PATCH /api/v1/reports/{id}` — staff updates status/assignment/resolution
- `GET /api/v1/analytics` — staff analytics
- `GET /api/v1/hotspots` — hotspot scores

See `/docs` for interactive API documentation.
