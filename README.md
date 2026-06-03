# Ethara Inventory & Order Management

Full-stack Inventory & Order Management System built with FastAPI, PostgreSQL, React, Vite, Tailwind, Axios, and Redux Toolkit.

## Features

- Customer signup, login, JWT auth, session tracking, logout, and session revocation.
- Separate admin login and admin-only authorization guards.
- Product CRUD, SKU uniqueness, status normalization, and stock adjustment.
- Inventory transactions for opening stock, stock updates, and order deductions.
- Cart management with backend totals and stock validation.
- Order checkout with database transaction, stock deduction, shipping address snapshot, lifecycle status, and order history.
- Admin dashboard stats, customer list, order management, inventory overview, and transaction audit log.
- Swagger UI at `/docs` and ReDoc at `/redoc`.
- Docker Compose stack for PostgreSQL, backend, and frontend.

## Architecture

```text
backend/app
  core          config, database, security
  models        SQLAlchemy models
  schemas       Pydantic v2 request/response models
  controllers   request dependencies and auth guards
  services      business logic and transactions
  routes        API endpoint registration
  middleware    global error handling

frontend/src
  api           centralized Axios client
  store         Redux Toolkit store and slices
  layouts       shared app shell
  routes        React Router and auth guards
  pages         customer and admin workflows
  components    reusable table/header UI
```

## Local Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
# Fill DATABASE_URL, JWT_SECRET, and ADMIN_PASSWORD before running the API.
python scripts/create_database.py
python -m alembic upgrade head
python -m app.seed
python -m uvicorn app.main:app --reload
```

## Local Frontend

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

Customer test users: `customer1@example.com` through `customer5@example.com`, password `Password@123`.

Admin user is created from `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `backend/.env`.

## Docker

```bash
copy .env.example .env
# Fill POSTGRES_PASSWORD, JWT_SECRET, ADMIN_PASSWORD, and other values in .env.
docker compose up --build
```

Frontend: `http://localhost:5173`

Backend: `http://localhost:8000`

Swagger: `http://localhost:8000/docs`

## Environment Variables

Backend:

- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_ALGORITHM`
- `ACCESS_TOKEN_EXPIRE_MINUTES`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `CORS_ORIGINS`

Frontend:

- `VITE_API_URL`

Use Neon PostgreSQL in production with SSL, for example `postgresql+psycopg://user:password@host/database?sslmode=require`.

## Migrations

Create migration:

```bash
cd backend
python -m alembic revision --autogenerate -m "describe change"
```

Run migration:

```bash
python -m alembic upgrade head
```

Rollback one migration:

```bash
python -m alembic downgrade -1
```

## Deployment

Backend on Render:

- Create a web service from `backend`.
- Set build command: `pip install -r requirements.txt`.
- Set start command: `alembic upgrade head && python -m app.seed && uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
- Add production environment variables and Neon `DATABASE_URL`.

Frontend on Vercel:

- Import the `frontend` directory.
- Set `VITE_API_URL` to the deployed Render API URL ending in `/api`.
- Build command: `npm run build`.
- Output directory: `dist`.

## Testing Checklist

- Customer signup and login.
- Admin login and admin guard redirects.
- JWT session creation, `/api/auth/me`, logout, session revoke.
- Product CRUD and duplicate SKU error.
- Stock adjustment and inventory transaction creation.
- Cart add, update, remove, clear, and stock limit errors.
- Checkout, order creation, stock deduction, out-of-stock handling.
- Admin order status updates.
- Dashboard stats.
- Docker Compose startup.
- Swagger and ReDoc documentation.
