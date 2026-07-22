# GreenPulse OS Backend (Smart City Telemetry Platform)

A production-grade, asynchronous **FastAPI** backend for a real-time smart-city telemetry dashboard built without Docker dependencies.

---

## Architecture & Technology Stack

- **Framework**: Python 3.11+ & FastAPI (ASGI server: `uvicorn`)
- **Database**: PostgreSQL with **TimescaleDB** extension (SQLAlchemy 2.0 Async + `asyncpg`)
- **Real-Time Streaming**: WebSockets with **Redis Pub/Sub** for cross-instance message scaling
- **Caching & Broker**: Redis 7.0+
- **Telemetry Ingestion**: MQTT Subscriber (`aiomqtt`) + Built-in Async Telemetry Simulator (`DEBUG=True`)
- **Task Queue**: Celery with Redis broker (with graceful in-memory `asyncio` background task fallback)
- **Security**: OAuth2 JWT Bearer tokens with Role-Based Access Control (`admin`, `operator`, `analyst`)
- **Observability**: Structured JSON logging (`structlog`), Prometheus metrics (`/metrics`), request-id tracing

---

## Directory Structure

```
greenpulse-backend/
├── app/
│   ├── main.py              # FastAPI app factory & lifespan management
│   ├── core/                # Config, security, database, redis, mqtt, logger, exceptions
│   ├── models/              # SQLAlchemy 2.0 ORM models (User, Node, Telemetry, Alert)
│   ├── schemas/             # Pydantic v2 schemas
│   ├── api/                 # REST API V1 endpoints & dependencies
│   ├── websocket/           # ConnectionManager, DTOs & WS endpoint
│   ├── services/            # Telemetry processor, alert engine, simulation & analytics
│   ├── tasks/               # Celery worker & background task routines
│   ├── middleware/          # Request logging, Prometheus metrics, rate limiting
│   └── utils/               # Time parsing & helpers
├── migrations/              # Alembic database migration scripts
├── scripts/                 # Database seeding script (seed_data.py)
├── tests/                   # Unit, Integration, and E2E Pytest test suite
├── .env.example             # Environment variable template
├── alembic.ini              # Alembic configuration
├── requirements.txt         # Production dependencies
└── requirements-dev.txt     # Development and testing dependencies
```

---

## Manual Setup Instructions (No Docker)

Follow these manual setup steps to run the complete GreenPulse OS backend locally.

### 1. Install Prerequisites

Ensure the following services are installed and running locally:

- **Python 3.11+**
- **PostgreSQL 14+** (with **TimescaleDB** extension)
- **Redis Server**

#### macOS (Homebrew):
```bash
brew install postgresql@15 timescaledb redis
brew services start postgresql@15
brew services start redis
```

#### Ubuntu / Debian:
```bash
sudo apt update
sudo apt install python3-venv postgresql postgresql-contrib redis-server
sudo systemctl start postgresql redis-server
```

---

### 2. Configure Database & TimescaleDB

1. Access PostgreSQL CLI and create database:
```sql
CREATE DATABASE greenpulse;
CREATE USER postgres WITH PASSWORD 'postgres';
GRANT ALL PRIVILEGES ON DATABASE greenpulse TO postgres;
```

2. Enable TimescaleDB extension on `greenpulse` database:
```bash
psql -d greenpulse -c "CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;"
```

---

### 3. Virtual Environment & Dependencies

1. Navigate to the project directory:
```bash
cd greenpulse-backend
```

2. Create and activate a Python virtual environment:
```bash
python3 -m venv venv
source venv/bin/activate
```

3. Install requirements:
```bash
pip install -r requirements.txt
pip install -r requirements-dev.txt
```

---

### 4. Configure Environment Variables

Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

Review/update default values in `.env`:
```env
DEBUG=True
ENVIRONMENT=development
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/greenpulse
REDIS_URL=redis://localhost:6379/0
SIMULATION_ENABLED=True
SECRET_KEY=change_this_super_secret_jwt_key_for_production_environment_32bytes
```

---

### 5. Run Database Migrations

Apply Alembic schema migrations (creates hypertables, indexes, and tables):
```bash
alembic upgrade head
```

---

### 6. Seed Demo Database

Populate initial users, smart city telemetry nodes, alert rules, and historical data:
```bash
python -m scripts.seed_data
```

> **Default Seed Credentials:**
> - **Admin User**: `admin` / `admin123` (Role: `admin`)
> - **Operator User**: `operator` / `operator123` (Role: `operator`)
> - **Analyst User**: `analyst` / `analyst123` (Role: `analyst`)

---

### 7. Run FastAPI Web Server

Start the ASGI server:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- **Interactive Swagger Docs**: `http://localhost:8000/docs`
- **ReDoc API Documentation**: `http://localhost:8000/redoc`
- **Prometheus Metrics**: `http://localhost:8000/metrics`
- **Health Check**: `http://localhost:8000/health`

---

### 8. (Optional) Run Celery Background Worker & Beat

If `CELERY_BROKER_URL` is set in `.env`, run the worker and scheduler in separate terminals:

```bash
# Terminal 1: Celery Worker
celery -A app.tasks.worker worker --loglevel=info

# Terminal 2: Celery Beat Scheduler
celery -A app.tasks.worker beat --loglevel=info
```

*(Note: If `CELERY_BROKER_URL` is left empty or omitted, GreenPulse OS automatically falls back to an in-memory `asyncio` task scheduler.)*

---

## WebSocket Telemetry Stream

- **Endpoint**: `ws://localhost:8000/ws/telemetry?token=<ACCESS_TOKEN>`

### Connecting & Control Actions:

1. Retrieve JWT token via POST `/api/v1/auth/login`:
```json
{
  "username": "admin",
  "password": "admin123"
}
```

2. Connect to WebSocket:
```javascript
const ws = new WebSocket('ws://localhost:8000/ws/telemetry?token=' + accessToken);

ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  console.log('Received:', msg);
};
```

3. Send Filter Control Message:
```json
{
  "action": "subscribe",
  "nodes": ["node-01", "node-02"]
}
```

---

## Running Test Suite

Execute unit, integration, and E2E test suites with `pytest`:

```bash
pytest -v
```

To view test coverage:
```bash
pytest --cov=app tests/
```
