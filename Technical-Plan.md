# Technical Plan: AI Maintenance Predictor Dashboard

## 1. Problem Understanding

I do not want to build a simple rule-based notification system that detects which individual component has failed and then alerts the user (for example, columns like `pump1_condition = good / imminent_failure / failure`). In those scenarios, even if machine learning could be applied, a set of well-defined rules or threshold-based filters would likely be more appropriate and effective.  

Instead, I want to build a system that ingests all sensor data from an entire factory unit, such as a turbine hall, and uses this data holistically to predict maintenance requirements and recommended actions.

For example, a turbine hall may generate data from a wide range of sensors, including electrical current sensors, pump voltage sensors, bearing vibration sensors, exhaust chemical concentration sensors, compressor temperature sensors, and intake air temperature sensors. Rather than detecting failures using fixed thresholds or independent component rules, the model learns cross-sensor patterns and interactions across the turbine hall. Based on these learned relationships, it predicts which specific components are likely to require maintenance or replacement, whether preventive maintenance should be scheduled, and whether a full system shutdown is recommended for thorough inspection.

To support deployment across different environments, the system is designed to be robust and generalizable. Users will be able to upload their own sensor data to train new models tailored to their specific factory unit, operating conditions, and equipment configurations, while preserving a consistent prediction framework.


**Core Problem:**
- Predicting equipment failures from raw sensor data is challenging because failures emerge from complex interactions across multiple signals, evolve over time, and often lack clear thresholds or explicit failure labels.

**Target Users:**
- Maintenance engineers, reliability engineers responsible for planning inspections, repairs, and system downtime.

**Success Criteria:**
- Since the system will rely heavily on generated data, it is not possible to fully validate the model against real-world operational outcomes. Instead, success is evaluated based on usability and adaptability. When provided with appropriate input data, the dashboard should clearly present model predictions and insights in a way that is understandable and actionable for engineers.  
In addition, engineers should be able to update existing models or create new prediction models by uploading training data. For example, they can retrain a model using the most recent data from a specific unit, or upload data from a new unit to train a dedicated model for that equipment.

---

## 2. Data & CSV Assumptions

**Expected CSV Structure (Example):**  
The following columns are required for turbine unit maintenance prediction:

- `timestamp`
- `asset_type`
- `output_current`
- `pump_voltage`
- `bearing_vibration`
- `exhaust_chemical_percentage`
- `compressor_temperature`
- `intake_air_temperature`

For **model training**, the following additional target columns must be included:

- `pump_risk`
- `bearing_risk`
- `compressor_risk`
- `exhaust_path_risk`
- `cooling_or_lubrication_risk`
- `shutdown_risk`


**Data Handling:**
- CSV files are uploaded through a FastAPI endpoint and validated by checking the presence of all required columns and ensuring timestamps and sensor values have valid data types.
- Missing values are handled using forward fill or interpolation. The data is time-series–based and observations are expected to be temporally correlated.
- Outliers are detected using rolling mean. They are either capped or smoothed to prevent isolated spikes from skewing model predictions.

---

## 3. Feature Engineering Strategy

**Time-Series Features (Per Asset or Window):**
- Rolling mean over a time window.
- Lag features (e.g., bearing_vibration_t-6).
- Aggregations (e.g.,bearing_vibration / output_current).

Raw time-series sensor data is first sorted by timestamp. For each csv file upload, only the most recent 500 hours of data are retained for feature generation, because the most recent sensor behavior is the most indicative of current equipment health and near-term maintenance risk. This fixed time window is used to construct model-ready rows by computing the current sensor values, selected lag values, and rolling means to caperiodic patterns and short-term behavior.  


---

## 4. Model Strategy

**Model Choice:**
- **Random Forest Regressor wrapped in MultiOutputRegressor** is used as the primary model. It handles non-linear relationships between sensor signals, works well with engineered time-series features, requires minimal preprocessing time when run parallely on GPU.

- **XGBoost** is also a suitable alternative due to its strong predictive performance, but it is not chosen as the default because of longer training times, higher computational cost.

**Training Approach:**
- Sensor data is transformed into a feature matrix `X` using time-series feature engineering.
- Maintenance risk targets form the multi-output label matrix `y`
- Models are trained using a multi-output regression approach and evaluated using regression metrics on the validation set.
- Trained models are persisted using `joblib` and stored locally.
- If time allows, trained models will be stored in cloud object storage so that new or updated models can be loaded dynamically at runtime, allowing the system to switch models on the fly without requiring a server restart.

**Risk Mapping:**
- Model returns probability of failure (e.g., `p_failure`).
- Map to risk levels:
  - Green: low probability `<0.3`
  - Yellow: medium probability `0.3–0.7`
  - Red: high probability `>0.7`

---

## 5. Architecture Overview

**Components:**

| Component        | Technology (Planned)         | Purpose                                           |
|------------------|------------------------------|---------------------------------------------------|
| Backend API      | FastAPI + Python             | CSV handling, feature engineering, model training & prediction |
| ML Layer         | scikit-learn (RF)            | Classification model for failure risk             |
| Frontend         | NextJS/React                 | Upload, dashboard, asset list, asset detail pages |
| Charts           | Recharts / Chart.js          | Visualization of sensor data and risk             |
| Containerization | Docker                       | Packaging and deployment                          |

**System Flow (High-Level):**  
 Model Creation / Update Flow

1. The user uploads a CSV file containing training data via the frontend to  
   `/upload-csv-for-model-creation-or-update`, scoped by `asset_type`.
2. The backend validates the CSV schema and notifies the frontend if validation fails.
3. The backend processes the data and saves a cleaned copy of the CSV.
4. The backend trains a new model or updates an existing model and saves it locally.
5. By default, a server restart is required to reload the updated model. If time allows, models will be saved to cloud storage and loaded dynamically without requiring a restart.
6. The user receives real-time training progress updates through a WebSocket connection.
---

Asset Creation Flow

1. The user submits asset information from the frontend to `/assets` using a POST request.
2. The request includes required metadata such as `asset_type`, `location`, `manager_name`, and `manager_phone`.
3. The backend validates the input fields and creates a new asset record in the database.
4. The asset is initialized with a default `risk_status` set to `N/A`, since no sensor data or predictions exist yet.
5. The backend returns the newly created asset details to the frontend.
6. The asset becomes available for future CSV uploads and risk prediction workflows.
---

Prediction Flow
1. The user uploads a CSV file containing prediction data via the frontend to  
   `/upload-csv-for-an-asset`.
2. The backend validates the CSV and notifies the frontend if validation fails.
3. The backend processes the data and saves a cleaned copy of the CSV. Data required for chart generation is stored in the database.
4. The backend generates risk predictions for the asset, stores the results in the database, and returns a status message to the frontend.
5. The frontend calls `/assets/{id}/risk` to retrieve the latest risk status for the asset.
6. The frontend calls `/assets/{id}/detail` to retrieve detailed time-series data for visualizations such as current, temperature, and vibration trends.

---

| Endpoint                                   | Method | Purpose                                                                 |
|--------------------------------------------|--------|-------------------------------------------------------------------------|
| `/upload-csv-for-model-creation-or-update` | POST   | Upload training CSV, validate data, and trigger model creation or update |
| `/upload-csv-for-an-asset`                 | POST   | Upload sensor CSV for prediction and store cleaned time-series data      |
| `/assets` | POST   | Create a new asset with metadata and initialize its risk status to `N/A` |
| `/assets`                                 | GET    | List all assets with their current risk status                           |
| `/assets/{id}/risk`                       | GET    | Retrieve the latest risk scores for a specific asset                     |
| `/assets/{id}/detail`                     | GET    | Retrieve time-series data and details for charts and diagnostics         |


---

## 7. Asset Risk & Recommendation Design

**Risk Levels:**
- **Green**: The asset is operating within normal conditions. No immediate maintenance is required, and the system will continue routine monitoring.
- **Yellow**: The asset shows early signs of potential issues. Increased monitoring is recommended, and preventive maintenance should be planned.
- **Red**: The asset is at high risk of failure. Immediate inspection or corrective maintenance is recommended to avoid unplanned downtime.


**Recommendations:**
- Recommendations are generated using a simple rule-based mapping from predicted risk scores and risk levels.
- Asset detail page will have a list of actionable recommendations (e.g., “Monitor bearing vibration closely” or “Schedule compressor inspection”).

---

## 8. UI Wireframe Description

**Dashboard / Asset List Page:**
- Table of assets with:
  - Asset ID
  - Risk status (color-coded)
  - Meta data(Location/Manager Phone number)
- Filters for risk level (Green/Yellow/Red).
- Filters for Location.

**Asset Detail Page:**
- Time-series chart(s) (Recharts/Chart.js) for sensor values over time.
- Indicator for current risk and risk history if available.
- Simple feature importance summary:
  - Global: top features from model (e.g., RF feature importances).
  - Or per-asset: simplified explanation (e.g., high vibration → high risk).
- Text recommendation block (Stretch Goals).

---

## 9. Trade-offs & Decisions

**Decision 1: Feature Windowing Strategy**
- The system uses the most recent **500 hours** of sensor data per asset for feature generation.
- This approach focuses on recent behavior and periodic patterns, which are most indicative of current equipment health. This strategy is adopted to save training time.

**Decision 2: Model Complexity**
- A **Random Forest Regressor wrapped in `MultiOutputRegressor`** is used as the core model.
- This model provides a good balance between predictive performance, robustness to noisy sensor data, and interpretability through feature importance.


**Known Limitations:**
- The MVP relies on generated datasets and is not validated against real-world operational failure data.
- The training process assumes a standardized CSV schema, where input files use the same column headers regardless of the factory unit or asset type.
- The model assumes consistent sensor availability and assumes that all sensor data produces hourly data points.
- Risk predictions are probabilistic estimates and do not guarantee actual failure outcomes.

---

## 10. MVP Scope

- [ ] `/upload-csv-for-model-creation-or-update` and `/upload-csv-for-an-asset` endpoints for training and prediction data uploads.
- [ ] Feature engineering pipeline for time-series data (lag features, rolling statistics, and derived features).
- [ ] Multi-output regression model trained from uploaded data.
- [ ] Risk score mapping to qualitative statuses (Green / Yellow / Red).
- [ ] React dashboard with asset creation, asset list, and asset detail pages.
- [ ] Time-series visualizations and a simple model output or feature importance display.


**Stretch Goals (If Time Permits):**
- [ ] Save model in cloud storage to allow the generation of model dynanmically
- [ ] System generalize the creation flow with multiple asset type. Allows input of different CSV schema.
- [ ] LLM enabled asset-risk report.
- [ ] Authentication / simple user creation/roles.

---

## 11. Timeline Estimate (24–28h Build)

| Phase                             | Estimated Time |
|----------------------------------|----------------|
| Environment & Docker setup       | [1 hours]      |
| CSV ingestion & validation       | [1 hours]      |
| Feature engineering pipeline     | [3 hours]      |
| Model training (`/train`)        | [3 hours]      |
| Prediction & risk mapping        | [1 hours]      |
| Backend endpoints                | [2 hours]      |
| React dashboard & asset UI       | [2 hours]      |
| Charts & detail page             | [2 hours]      |
| Testing & polish                 | [3 hours]      |