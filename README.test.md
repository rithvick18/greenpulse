# GreenPulse OS (VISION) Smart-City Dashboard - Comprehensive Test Suite

This document describes the structure, execution instructions, and coverage benchmarks for the production-grade test suite covering both the **Django REST Backend** and the **React + Vite + TypeScript Frontend** of **GreenPulse OS**.

---

## 🏗️ Test Architecture Overview

```
greenpulse-smart-city-dashboard/
├── backend/
│   └── django/                          # Django application services & models
│       ├── manage.py
│       ├── requirements.txt
│       ├── greenpulse_django/           # Project settings & WSGI configuration
│       └── greenpulse_app/              # Application models, serializers, views, and tests
└── frontend/
    └── src/
        ├── setupTests.ts                # Vitest environment setup & browser/WS mocks
        └── __tests__/
            ├── context/                 # TelemetryContext state & WebSocket integration tests
            ├── components/layout/       # Header, Sidebar, Footer layout component tests
            └── views/                   # Overview & operational module view tests
```

---

## ⚡ Backend Testing (Django REST Framework)

### 🚀 Quick Run Commands
Navigate to `backend/django/`:
```bash
# Activate Virtual Environment
source venv/bin/activate

# Execute Full Django Backend Test Suite
python manage.py test
```

### 📊 Backend Test Highlights & Coverage
- **Model & Serializer Tests**:
  - Node model & serializer validation for metadata, location data, and status attributes.
  - Telemetry serializer structure validation for metric payload attributes.
  - AlertRule and Alert model/serializer validation.
- **REST API Endpoint Tests**:
  - `LatestTelemetryEndpointTests`: Validates DRF endpoint `/api/telemetry/latest/`, cache control headers (`no-cache`), and CORS wildcard headers (`Access-Control-Allow-Origin: *`).

---

## ⚛️ Frontend Testing (React + Vitest)

### 🚀 Quick Run Commands
Navigate to `frontend/`:
```bash
# Execute Frontend Test Suite
npm run test

# Execute Frontend Tests in Watch Mode
npm run test:watch

# Execute Frontend Tests with Coverage
npm run test:coverage
```

### 📊 Frontend Test Highlights & Coverage
- **Context & State Tests**:
  - `TelemetryContext.test.tsx`: Validates state persistence, active tab switching, theme toggles, line controls, emergency override, and real-time WebSocket snapshot parsing.
- **Layout Component Tests**:
  - `Sidebar.test.tsx`: Validates rendering of 6 operational modules, active selection state, and system telemetry indicators.
  - `Header.test.tsx`: Validates title bar, search input, system clock, notification count, theme toggle, and emergency override button interactions.
- **Module View Tests**:
  - `OverviewDashboard.test.tsx`: Validates KPI metric cards (City Health, Net Generation, Traffic Congestion, Air Quality AQI).
  - `DashboardViews.test.tsx`: Validates rendering and mounting of Traffic, Energy Grid, Infrastructure, Public Safety, and Industrial views.

---

## ⚙️ Continuous Integration (GitHub Actions)

Continuous Integration is configured in `.github/workflows/test.yml`. It runs automatically on every `push` and `pull_request` to `main`, `master`, and `develop` branches:
- Launches a Redis 7 service container.
- Installs Python 3.9 dependencies and runs backend Pytest with XML coverage output.
- Installs Node 20.x dependencies and runs frontend Vitest with V8 coverage output.
