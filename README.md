# 🏛 TenderIQ Pakistan — Government Procurement Intelligence Platform

> AI-powered SaaS platform that turns Pakistan's public procurement data (PPRA / data.gov.pk) into actionable opportunities for SMEs.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python 3.11+](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://python.org)
[![Next.js 14](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org)

---

## 📸 Feature Overview

| Feature | Description |
|---|---|
| **Daily CKAN Ingestion** | Pulls from `data.gov.pk` CKAN API every morning at 06:00 PKT |
| **Claude AI Analysis** | Summaries, opportunity scores (0–100), eligibility extraction, SME insights |
| **Word & PDF Reports** | Branded, professionally formatted downloadable reports |
| **Sector Alerts** | Email + dashboard notifications for 18 sector categories |
| **Keyword Alerts** | Instant, daily, or weekly digest emails |
| **Multi-Currency Pricing** | PKR ₨ / USD $ / GBP £ — switch dynamically |
| **Payments** | Stripe (Visa, MC, Amex) + Easypaisa/JazzCash for PKR |
| **3 Subscription Tiers** | Free · Pro · Enterprise |
| **Admin Dashboard** | Platform analytics, user management, manual ingestion trigger |

---

## 🏗 Architecture

```
tender-intelligence-pk/
├── backend/                  # Python FastAPI
│   ├── app/
│   │   ├── main.py           # App entry point, startup seeding
│   │   ├── config.py         # Pydantic settings (env vars)
│   │   ├── database.py       # SQLAlchemy engine + session
│   │   ├── models/           # SQLAlchemy ORM models
│   │   │   ├── user.py
│   │   │   ├── tender.py
│   │   │   ├── sector.py
│   │   │   ├── subscription.py
│   │   │   └── alert.py
│   │   ├── schemas/          # Pydantic request/response schemas
│   │   ├── routers/          # FastAPI route handlers
│   │   │   ├── auth.py       # JWT auth, register, login, verify
│   │   │   ├── tenders.py    # Browse, search, download
│   │   │   ├── alerts.py     # Keyword alerts + sector subscriptions
│   │   │   ├── subscriptions.py # Plans, Stripe/Easypaisa checkout
│   │   │   └── admin.py      # Admin analytics + controls
│   │   ├── services/
│   │   │   ├── ckan_service.py     # CKAN API client (data.gov.pk)
│   │   │   ├── ai_service.py       # Anthropic Claude integration
│   │   │   ├── document_service.py # python-docx + ReportLab PDF
│   │   │   ├── payment_service.py  # Stripe + Easypaisa
│   │   │   └── email_service.py    # Resend transactional email
│   │   ├── workers/          # Celery background tasks
│   │   │   ├── celery_app.py       # Celery + Beat schedule
│   │   │   ├── ingestion.py        # Daily CKAN pipeline
│   │   │   ├── ai_processing.py    # AI analysis queue
│   │   │   └── notifications.py    # Alerts + weekly digest
│   │   └── utils/
│   │       ├── security.py   # JWT, bcrypt
│   │       └── currency.py   # PKR/USD/GBP conversion
│   ├── alembic/              # DB migrations
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/                 # Next.js 14 + TypeScript + Tailwind
│   └── src/
│       ├── app/
│       │   ├── page.tsx              # Landing page
│       │   ├── pricing/page.tsx      # Pricing with currency switcher
│       │   ├── auth/login/           # Login
│       │   ├── auth/signup/          # Registration
│       │   └── dashboard/
│       │       ├── page.tsx          # Dashboard overview
│       │       ├── tenders/page.tsx  # Tender explorer
│       │       ├── tenders/[id]/     # Tender detail + downloads
│       │       ├── alerts/page.tsx   # Alert management
│       │       └── reports/page.tsx  # Report downloads
│       ├── components/
│       │   ├── landing/Navbar.tsx
│       │   ├── landing/Footer.tsx
│       │   └── Providers.tsx
│       └── lib/
│           ├── api.ts          # Axios client + API helpers
│           ├── auth.ts         # Zustand auth store
│           └── utils.ts        # Formatting helpers
├── docker-compose.yml        # Full local dev stack
├── render.yaml               # One-click Render deployment
└── .env.example              # All required environment variables
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites

- Docker Desktop (recommended) **or** Python 3.11+ and Node.js 20+
- PostgreSQL 16+ and Redis 7+ (if not using Docker)
- Accounts for: Anthropic, Stripe, Resend (free tiers available)

### 1. Clone and configure

```bash
git clone https://github.com/YOUR_USERNAME/tender-intelligence-pk.git
cd tender-intelligence-pk
cp .env.example .env
```

Edit `.env` and fill in at minimum:
- `ANTHROPIC_API_KEY` — from [console.anthropic.com](https://console.anthropic.com)
- `STRIPE_SECRET_KEY` and `STRIPE_PUBLISHABLE_KEY` — from [dashboard.stripe.com](https://dashboard.stripe.com)
- `RESEND_API_KEY` — from [resend.com](https://resend.com)
- `SECRET_KEY` — generate with `python -c "import secrets; print(secrets.token_hex(32))"`

### 2. Start with Docker Compose (recommended)

```bash
docker compose up --build
```

Services start on:
- **Frontend** → http://localhost:3000
- **API** → http://localhost:8000
- **API Docs** → http://localhost:8000/api/docs
- **pgAdmin** (optional) → configure separately

### 3. Run migrations and seed data

Migrations run automatically on API startup. Sectors and subscription plans are seeded on first launch.

To manually run migrations:
```bash
docker compose exec api alembic upgrade head
```

### 4. Trigger first ingestion

```bash
# Via API (requires admin token)
curl -X POST http://localhost:8000/api/v1/admin/ingest/trigger \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

Or via the Admin dashboard at http://localhost:3000/admin.

---

## 🔧 Manual Setup (Without Docker)

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp ../.env.example .env       # fill in values

# Run migrations
alembic upgrade head

# Start API server
uvicorn app.main:app --reload --port 8000

# Start Celery worker (separate terminal)
celery -A app.workers.celery_app worker --loglevel=info

# Start Celery Beat scheduler (separate terminal)
celery -A app.workers.celery_app beat --loglevel=info
```

### Frontend

```bash
cd frontend
npm install
cp ../.env.example .env.local   # set NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
npm run dev
```

---

## ☁️ Deploy to Render.com (Recommended)

### One-click deploy

1. Fork this repository to your GitHub account
2. Log in to [render.com](https://render.com) → **New → Blueprint**
3. Select your forked repository
4. Render will read `render.yaml` and create all services automatically

### Manual environment variables (set in Render dashboard)

After deployment, set these in each service's environment:

| Variable | Service | Value |
|---|---|---|
| `ANTHROPIC_API_KEY` | api, worker | Your Claude API key |
| `STRIPE_SECRET_KEY` | api, worker | `sk_live_...` |
| `STRIPE_PUBLISHABLE_KEY` | api | `pk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | api | From Stripe webhooks dashboard |
| `RESEND_API_KEY` | api, worker | From resend.com |
| `ALLOWED_ORIGINS` | api | `https://your-frontend.onrender.com` |
| `NEXT_PUBLIC_STRIPE_PK` | frontend | `pk_live_...` |

### Stripe webhook setup

In your Stripe dashboard → Webhooks → Add endpoint:
- URL: `https://your-api.onrender.com/api/v1/subscriptions/webhook/stripe`
- Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`

### Stripe Products Setup

Create products in Stripe dashboard and copy the Price IDs to your `.env`:

```
STRIPE_PRICE_PRO_PKR=price_xxx
STRIPE_PRICE_PRO_USD=price_xxx
STRIPE_PRICE_PRO_GBP=price_xxx
STRIPE_PRICE_ENT_PKR=price_xxx
STRIPE_PRICE_ENT_USD=price_xxx
STRIPE_PRICE_ENT_GBP=price_xxx
```

---

## 🗄 Database Schema

| Table | Purpose |
|---|---|
| `users` | Account credentials, profile, role |
| `tenders` | CKAN-sourced procurement data + AI analysis |
| `tender_documents` | Generated Word/PDF file metadata |
| `sectors` | 18-category sector taxonomy |
| `subscription_plans` | Free/Pro/Enterprise plan definitions |
| `subscriptions` | User subscription state + Stripe IDs |
| `alerts` | User-defined keyword alert rules |
| `alert_matches` | Tender–alert matches (notifications) |
| `user_sector_subscriptions` | User ↔ sector many-to-many |

---

## 🔌 API Reference

Full interactive docs at `/api/docs` (Swagger UI).

Key endpoints:

```
POST   /api/v1/auth/register          Create account
POST   /api/v1/auth/login             Get JWT tokens
GET    /api/v1/auth/me                Current user profile

GET    /api/v1/tenders                Browse/search tenders
GET    /api/v1/tenders/{id}           Tender detail + AI summary
GET    /api/v1/tenders/{id}/download/word  Download Word report (Pro)
GET    /api/v1/tenders/{id}/download/pdf   Download PDF report (Pro)
GET    /api/v1/tenders/stats/summary  Platform statistics (public)

GET    /api/v1/alerts/sectors         Sector taxonomy
POST   /api/v1/alerts                 Create keyword alert (Pro)
GET    /api/v1/alerts/matches         Notification inbox

GET    /api/v1/subscriptions/plans    Pricing plans
POST   /api/v1/subscriptions/checkout Start Stripe/Easypaisa checkout
POST   /api/v1/subscriptions/webhook/stripe  Stripe webhook receiver

GET    /api/v1/admin/stats            Admin analytics (Admin only)
POST   /api/v1/admin/ingest/trigger   Manual CKAN ingestion (Admin only)
```

---

## 💳 Payment Integration

### Stripe (International Cards)
- Supports Visa, Mastercard, American Express
- PKR, USD, GBP billing
- Hosted checkout page (no card data touches your server)
- Webhooks handle subscription lifecycle

### Easypaisa (Pakistan Mobile Wallets)
- PKR only
- Merchant account required from Jazz/Warid
- Fill `EASYPAISA_MERCHANT_ID`, `EASYPAISA_PASSWORD`, `EASYPAISA_INTEGRITY_SALT`

---

## 🤖 AI Configuration

The platform uses **Claude Sonnet** (`claude-sonnet-4-6`) for detailed analysis and **Claude Haiku** (`claude-haiku-4-5-20251001`) for weekly digests.

To change models, edit `backend/app/services/ai_service.py`.

Processing rate: ~10 tenders per 30-minute window (configurable via `BATCH_SIZE` in `ai_processing.py`).

---

## 📧 Email Setup (Resend)

1. Sign up at [resend.com](https://resend.com) (free: 3,000 emails/month)
2. Add and verify your sending domain
3. Copy API key to `RESEND_API_KEY`
4. Update `FROM_EMAIL` to your verified domain address

---

## 🔒 Security Notes

- All passwords hashed with bcrypt
- JWT tokens with configurable expiry
- CORS restricted to `ALLOWED_ORIGINS`
- Admin endpoints require `role: admin`
- Stripe webhook signature verification
- Easypaisa HMAC-SHA256 integrity checking
- Free tier throttling (10 tenders/month)

---

## 🧪 Creating an Admin User

```bash
# Connect to your database and run:
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
```

Or via psql:
```bash
docker compose exec postgres psql -U tenderiq -d tenderiq_db \
  -c "UPDATE users SET role='admin' WHERE email='admin@tenderiq.pk';"
```

---

## 📈 Roadmap

- [ ] Mobile app (React Native)
- [ ] Bid preparation assistant (Claude)
- [ ] Competitor award tracking
- [ ] Integration with PPRA's official API
- [ ] Multi-tenant agency dashboard
- [ ] Tender calendar view
- [ ] Historical tender database search

---

## 📄 Data Sources

All procurement data is sourced from the **Government of Pakistan Open Data Portal**:
- Portal: [data.gov.pk](https://data.gov.pk)
- API: CKAN 2.x (`/api/3/action/`)
- Data is public domain under Pakistan Open Government Data license

---

## 🤝 Contributing

Pull requests welcome! Please open an issue first to discuss major changes.

---

## 📝 License

MIT License. See [LICENSE](LICENSE) for details.

---

*Built with ❤️ for Pakistani SMEs | Powered by Anthropic Claude + CKAN Open Data*
