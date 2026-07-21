# GreenPulse OS (VISION) Smart-City Dashboard - Comprehensive Test Suite

This document describes the structure, execution instructions, and coverage benchmarks for the production-grade test suite covering both the **FastAPI Backend** and the **React + Vite + TypeScript Frontend** of **GreenPulse OS**.

---

## 🏗️ Test Architecture Overview

```
greenpulse-smart-city-dashboard/
├── greenpulse-backend/
│   ├── .env.test                        # Test environment variables
│   ├── tests/
│   │   ├── conftest.py                  # Pytest async SQLite, JWT headers & DB fixtures
│   │   ├── unit/                        # Security, alert engine, simulation, utils, WS manager
│   │   ├── integration/                 # REST API, MQTT callbacks, WebSocket real-time feeds
│   │   ├── e2e/                         # E2E full telemetry & alert resolution pipeline
│   │   └── performance/                 # Concurrent load & API throughput tests
└── src/
    ├── setupTests.ts                    # Vitest environment setup & browser/WS mocks
    └── __tests__/
        ├── context/                     # TelemetryContext state & WebSocket integration tests
        ├── components/layout/           # Header, Sidebar, Footer layout component tests
        └── views/                       # Overview & operational module view tests
```

---

## ⚡ Backend Testing (FastAPI + Pytest)

### 🚀 Quick Run Commands
Navigate to `greenpulse-backend/`:
```bash
# Activate Virtual Environment
source venv/bin/activate

# Execute Full Backend Test Suite
pytest

# Execute Backend Test Suite with Coverage
pytest --cov=app --cov-report=term-missing
```

### 📊 Backend Test Highlights & Coverage
- **Unit Tests**:
  - `test_security.py`: Password hashing with bcrypt, JWT token creation, expiration, and decoding validation.
  - `test_services.py`: AlertEngine condition evaluation, Analytics 5-minute bucket aggregation, TelemetryProcessor pipeline.
  - `test_simulation.py`: TelemetrySimulator snapshot generation, metric bounds, start/stop loop.
  - `test_websocket_manager.py`: ConnectionManager connection management, subscription topics, text broadcasting.
  - `test_utils_tasks.py`: Time formatting, ISO string parsing, AsyncioTaskScheduler async worker execution.
- **Integration Tests**:
  - `test_api.py`: OAuth2 password form login, JSON login, token refresh, logout, RBAC permissions, Node CRUD, Alert Rules CRUD, Historical Metrics date validation.
  - `test_websocket.py`: Connection handshake, subscriber snapshot streams, ping/pong health, sub/unsub commands.
  - `test_mqtt.py`: Async MQTT message callback, topic parsing, payload verification, database telemetry insertion.
- **E2E Tests**:
  - `test_full_flow.py`: Full end-to-end telemetry pipeline from node creation to rule trigger and alert resolution.
- **Performance Tests**:
  - `test_load.py`: High-concurrency telemetry ingestion throughput & API rate limit resilience.

---

## ⚛️ Frontend Testing (React + Vitest)

### 🚀 Quick Run Commands
From the project root:
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
