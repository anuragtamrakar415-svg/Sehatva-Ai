# Sehatva AI — Backend

FastAPI backend for the Sehatva AI post-discharge recovery & care platform,
covering all 16 modules from the spec (Auth, Dashboard, Medicines, AI Discharge
Summary Analyzer, AI Medical Report Explainer, AI Recovery Roadmap, Recovery
Gamification, Insurance Assistant, AI Health Assistant chat, Caregiver
Dashboard, Emergency SOS, Follow-up Management, Analytics, Profile,
Notifications, Settings).

## Stack
- FastAPI + SQLAlchemy 2.0 + Alembic
- SQLite for local dev (zero setup) / PostgreSQL for production
- JWT auth (python-jose + passlib/bcrypt)
- Google Gemini (REST API) for every AI feature, with safe fallback content
  when no API key is configured so the app is still fully demoable

## 1. Setup

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate   # optional but recommended
pip install -r requirements.txt
cp .env.example .env
```

## 2. Manual changes YOU need to make in `.env`

| Variable | What to do |
|---|---|
| `SECRET_KEY` | **Required.** Replace with a long random string (e.g. `openssl rand -hex 32`). Never use the default in production. |
| `DATABASE_URL` | Works out of the box as SQLite. For production, set it to your Postgres URL, e.g. `postgresql+psycopg2://user:pass@host:5432/dbname`. |
| `GEMINI_API_KEY` | **Required for AI features** (Discharge Summary Analyzer, Report Explainer, Recovery Roadmap, Insurance Assistant, AI Chat). Get a free key at https://aistudio.google.com/app/apikey. Without it, these endpoints still respond (200 OK) with safe generic fallback content instead of real AI output. |
| `CORS_ORIGINS` | Add your frontend's actual URL(s), comma separated (e.g. your deployed frontend domain). |

Nothing else needs to change to run locally.

## 3. Create the database tables

```bash
alembic upgrade head
```
This creates all 15 tables (users, profiles, medicines, medicine_logs,
recovery_plans, recovery_tasks, medical_reports, insurance_claims, caregivers,
appointments, notifications, chat_history, sos_logs, activity_logs, badges,
emergency_contacts, password_reset_tokens) — already generated for you in
`alembic/versions/`. If you change any model later, generate a new migration:

```bash
alembic revision --autogenerate -m "describe your change"
alembic upgrade head
```

## 4. Run the server

```bash
uvicorn app.main:app --reload --port 8000
```

- API root: http://localhost:8000/
- Interactive docs (Swagger): http://localhost:8000/docs
- All endpoints are under the `/api` prefix, e.g. `POST /api/auth/register`

## 5. Connect your frontend

- Set your frontend's API base URL to `http://localhost:8000/api` (or your
  deployed backend URL).
- Auth flow: `POST /api/auth/register` or `/api/auth/login` → returns
  `{ access_token }` → send it as `Authorization: Bearer <token>` on every
  other request.
- File uploads (discharge summary): `POST /api/reports/discharge-summary/analyze`
  as `multipart/form-data` with a `file` field (pdf/image/docx) and optional
  `language` field.

## What's still manual / not wired up (by design, since these need real
credentials or business decisions from you)

1. **`GEMINI_API_KEY`** — without it, AI endpoints return honest fallback
   content instead of erroring, but you'll want a real key before your demo.
2. **Email sending for "Forgot Password"** — no SMTP/email provider is
   configured. `POST /api/auth/forgot-password` currently returns the reset
   token directly in the JSON response (safe for local dev/demo, **not** for
   production). Plug in an email provider (SES, SendGrid, etc.) and stop
   returning `reset_token` in the response before going live.
3. **Push/SMS notifications** — `notifications` table + endpoints exist and
   are populated (e.g. on SOS trigger), but there's no push/SMS/WhatsApp
   delivery wired up. That needs a provider (FCM, Twilio, etc.) if you want
   real device notifications instead of in-app only.
4. **Production database** — switch `DATABASE_URL` to Postgres before
   deploying for real; SQLite is dev-only.
5. **File storage** — uploaded discharge summaries/images are saved to local
   disk (`backend/uploads/`). Fine for a single server / hackathon demo; move
   to S3/Cloud Storage if you deploy somewhere with an ephemeral filesystem
   (e.g. most serverless hosts).
6. **CORS_ORIGINS** — add your real frontend URL(s) once deployed, or the
   browser will block requests.

## AI endpoints (Gemini-powered)

| Module | Endpoint |
|---|---|
| Discharge Summary Analyzer | `POST /api/reports/discharge-summary/analyze` (multipart file upload) |
| Medical Report Explainer | `POST /api/reports/explain` (JSON: report_subtype, raw_text) |
| Recovery Roadmap | `POST /api/recovery/generate` |
| Insurance Assistant | `POST /api/insurance/suggest` |
| AI Health Assistant chat | `POST /api/chat` |

All AI endpoints degrade gracefully (HTTP 200 with clearly-labeled fallback
data) if `GEMINI_API_KEY` is missing, and return `503`/`502` only if the key
is set but the Gemini call itself fails.
