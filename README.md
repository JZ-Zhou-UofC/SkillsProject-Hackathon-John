
# AI Predictive Dashboard

A full-stack system for **industrial asset monitoring, risk prediction, and model lifecycle management**.

This platform allows users to:

* Register and manage industrial assets
* Train machine-learning models using historical sensor data
* Upload new sensor CSVs for **real-time risk prediction**
* Persist predictions and time-series data
* Monitor asset risk levels via a modern dashboard
* Receive live training updates via **WebSockets**

---

## Core Features

### Asset Management

* Create, view, filter, archive assets
* Asset metadata: name, type, city, address, manager info
* Asset status: `active` / `archived`

### Model Training

* Upload CSV training data per asset type
* Feature engineering (lags, rolling means, derived physics)
* Multi-output ML model training
* Model versioning and activation
* Training progress streamed via WebSocket

### Prediction Pipeline

* Upload CSV data for a specific asset
* Automatic model lookup by `asset_type`
* Risk prediction per timestep
* Persist:

  * Cleaned sensor data (`asset_detail`)
  * Risk predictions (`predictions`)
* Update asset risk state automatically

### Risk Outputs

Each prediction produces:

```json
{
  "pump_risk": 0.01,
  "bearing_risk": 0.40,
  "compressor_risk": 1.00,
  "exhaust_path_risk": 0.78,
  "cooling_or_lubrication_risk": 0.70,
  "shutdown_risk": 0.55
}
```

---

## Tech Stack

### Backend

* **FastAPI**
* **Supabase (Postgres)**
* **scikit-learn**
* **joblib**
* **WebSockets**
* **Pandas / NumPy**

### Frontend

* **Next.js**
* **TypeScript**
* **Tailwind CSS**
* **MUI (filters)**
* **WebSocket client**

### Infrastructure

* **Docker**
* **Docker Compose**

---


## Database Tables

* `assets`
* `models`
* `training_jobs`
* `asset_detail`
* `predictions`

All time-series and predictions are **fully persisted** for analytics and visualization.

---

## Running with Docker (Recommended)

### Environment variables

Create a `.env` file in `backend/`:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-service-key
```

### Build & start services

```bash
docker-compose up --build
```

Backend will be available at:

```
http://localhost:8000
```

---

## Running Backend Locally (Without Docker)

### Create environment

```bash
conda create -n asset-risk python=3.11
conda activate asset-risk
```

or

```bash
python -m venv venv
source venv/bin/activate
```

### Install dependencies

```bash
pip install -r requirements.txt
```

### Start FastAPI server

```bash
uvicorn app.main:app --reload
```

---

## Running Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
```

Environment variables:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_WS_BASE_URL=ws://localhost:8000
```

---

##  Key API Endpoints

### Training

```
POST /upload-csv-for-model-creation-or-update?asset_type=gas_turbine
WS   /ws/training/{job_id}
```

### Prediction

```
POST /upload-csv-for-an-asset?asset_id=123
GET  /assets/{id}/risk
GET  /assets/{id}/detail
```

### Assets

```
GET    /assets
POST   /assets
PATCH  /assets/{id}/archive
```

---

##  WebSocket Events

Training stages streamed live:

* `validating`
* `feature_engineering`
* `training`
* `saving_model`
* `registering_model`
* `completed`
* `failed`

---

## Design Principles

* **Single source of truth**: DB is authoritative
* **Stateless prediction API**
* **Model caching for performance**
* **Explicit schemas & dataclasses**
* **Clean separation of concerns**
* **Production-ready async handling**

---

##  Future Improvements

* Model version comparison
* Automated retraining schedules
* Alerting on high risk
* Prediction trend dashboards
* Multi-asset batch prediction
* RBAC / authentication

---


