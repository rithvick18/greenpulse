# GreenPulse OS Smart-City Dashboard

A comprehensive smart city monitoring and management dashboard built with Django REST Framework backend and React + TypeScript frontend.

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 18+
- npm or yarn

### Backend Setup

1. **Navigate to the backend directory:**
```bash
cd backend/django/
```

2. **Create and activate a virtual environment:**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\\Scripts\\activate
```

3. **Install Python dependencies:**
```bash
pip install -r requirements.txt
```

4. **Run database migrations:**
```bash
python manage.py migrate
```

5. **Start the Django development server:**
```bash
python manage.py runserver
```

The backend will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to the frontend directory:**
```bash
cd frontend/
```

2. **Install JavaScript dependencies:**
```bash
npm install
```

3. **Start the Vite development server:**
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## 🎯 Running the Full Application

To run both backend and frontend simultaneously, you'll need two terminal windows:

**Terminal 1 (Backend):**
```bash
cd backend/django/
source venv/bin/activate  # Activate virtual environment
python manage.py runserver
```

**Terminal 2 (Frontend):**
```bash
cd frontend/
npm run dev
```

## 📊 Features

- **Real-time Monitoring**: Track city infrastructure, energy grids, traffic systems, and public safety
- **Interactive Dashboards**: Visualize data with charts, maps, and KPI indicators
- **Modular Architecture**: Separate operational modules for different city systems
- **Responsive Design**: Works on desktop and tablet devices

## 🧪 Testing

### Backend Tests
```bash
cd backend/django/
source venv/bin/activate
python manage.py test
```

### Frontend Tests
```bash
cd frontend/
npm run test          # Run tests once
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
```

## 🔧 Configuration

### Backend Environment Variables
Create a `.env` file in `backend/django/` for custom configuration:
```
SECRET_KEY=your-secret-key
POSTGRES_DB=greenpulse
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
REDIS_URL=redis://localhost:6379/0
```

### Frontend Configuration
Edit `frontend/vite.config.ts` for custom build settings.

## 📁 Project Structure

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
        ├── App.tsx                      # Main application component
        ├── main.tsx                     # React entry point
        ├── components/                  # UI components
        ├── context/                     # State management
        └── types/                       # TypeScript types
```

## 📝 Notes

- The backend uses SQLite by default for development
- CORS is enabled to allow frontend-backend communication
- The application runs in development mode with hot reloading enabled