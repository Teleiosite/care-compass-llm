from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Literal, Optional
import joblib
import numpy as np

# Create the FastAPI app
app = FastAPI()

# --- ML Model Loading ---
# Load the trained model when the application starts.
# In a production environment, you might load multiple models or use a model registry.
# This model is trained by halo_pipeline_run.py to predict 6-month hypoglycemia risk.
try:
    # Load the model trained by the pipeline
    model_hypo_risk = joblib.load('hypo_risk_rf_model.joblib')
except FileNotFoundError:
    print("WARNING: Model file not found. API will use mock data.")
    model_hypo_risk = None

# --- Pydantic Models for Data Validation ---
# These models should mirror the TypeScript interfaces

class PredictionItem(BaseModel):
    outcome: str
    probability: float
    confidence: Literal['High', 'Medium', 'Low']

class ModelPrediction(BaseModel):
    model: str
    accuracy: float
    precision: float
    recall: float
    f1Score: float
    predictions: List[PredictionItem]

class FeatureImportance(BaseModel):
    feature: str
    importance: float
    description: str

class PredictionRequest(BaseModel):
    patient_features: List[float]
    model_id: Optional[str] = "Random Forest Classifier"

# --- API Endpoints ---

@app.get("/api/ml/predictions", response_model=List[ModelPrediction])
async def get_model_predictions():
    """
    Provides predictions from the ML models.
    In a real application, this would load a trained model,
    run predictions on a specific patient's data, and return the results.
    """
    return [
        {
            "model": "Random Forest Classifier",
            "accuracy": 94.2,
            "precision": 91.8,
            "recall": 96.1,
            "f1Score": 93.9,
            "predictions": [
                {"outcome": "Cardiovascular Event (30 days)", "probability": 0.68, "confidence": "High"},
                {"outcome": "Hypoglycemic Episode (7 days)", "probability": 0.12, "confidence": "Medium"},
                {"outcome": "Emergency Hospitalization (90 days)", "probability": 0.34, "confidence": "High"},
                {"outcome": "Medication Non-adherence", "probability": 0.45, "confidence": "Medium"}
            ]
        },
        {
            "model": "Neural Network (Deep Learning)",
            "accuracy": 92.7,
            "precision": 90.3,
            "recall": 94.8,
            "f1Score": 92.5,
            "predictions": [
                {"outcome": "Cardiovascular Event (30 days)", "probability": 0.71, "confidence": "High"},
                {"outcome": "Hypoglycemic Episode (7 days)", "probability": 0.09, "confidence": "Low"},
                {"outcome": "Emergency Hospitalization (90 days)", "probability": 0.38, "confidence": "High"},
                {"outcome": "Medication Non-adherence", "probability": 0.42, "confidence": "Medium"}
            ]
        }
    ]

@app.get("/api/ml/feature-importance", response_model=List[FeatureImportance])
async def get_feature_importance():
    """
    Provides feature importance data (e.g., SHAP values).
    In a real application, this would calculate or load these metrics
    for a specific model prediction.
    """
    return [
        {"feature": "Age", "importance": 0.23, "description": "Patient age (74 years)"},
        {"feature": "HbA1c Level", "importance": 0.19, "description": "Current: 8.2% (target: <7%)"},
        {"feature": "Blood Pressure", "importance": 0.17, "description": "Systolic: 145 mmHg"},
        {"feature": "Medication Count", "importance": 0.14, "description": "Currently taking 8 medications"},
        {"feature": "Frailty Score", "importance": 0.12, "description": "Score: 3/5 (moderate frailty)"},
        {"feature": "Comorbidities", "importance": 0.08, "description": "Hypertension, metabolic syndrome"},
        {"feature": "BMI", "importance": 0.07, "description": "32.1 kg/m² (obese)"}
    ]

@app.post("/api/ml/run-prediction", response_model=PredictionItem)
async def run_prediction(request: PredictionRequest):
    """
    Runs a real-time prediction for a given set of patient features.
    This endpoint is called by the "Run Prediction" button.
    """
    if model_hypo_risk is None:
        # Fallback to mock data if model isn't loaded
        return {"outcome": "Hypoglycemic Episode (6 months)", "probability": 0.75, "confidence": "High"}

    # The model expects features in a specific order, as defined by the training pipeline.
    # The frontend must construct this feature vector correctly.
    # New feature order from halo_pipeline_run.py:
    # ['age_at_index', 'bmi', 'dm_duration_years', 'htn_duration_years', 
    #  'hba1c_T0', 'creatinine_T0', 'eGFR_T0', 'sbp_T0', 'dbp_T0', 
    #  'weight_kg_T0', 'sex_M']
    patient_features = request.patient_features

    # Scikit-learn expects a 2D array for prediction
    features = np.array(patient_features).reshape(1, -1)
    
    # Get prediction probability
    # predict_proba returns probabilities for each class, e.g., [[P(class_0), P(class_1)]]
    probabilities = model_hypo_risk.predict_proba(features)[0]
    probability_of_event = probabilities[1] # Assuming class 1 is the "event"

    confidence = "Low"
    if probability_of_event > 0.7:
        confidence = "High"
    elif probability_of_event > 0.4:
        confidence = "Medium"

    # Determine outcome based on which probability is higher
    if probability_of_event > 0.5:
        outcome_text = "Hypoglycemic Episode (6 months)"
    else:
        outcome_text = "No Hypoglycemic Event Expected (6 months)"

    return {
        "outcome": outcome_text,
        "probability": round(probability_of_event, 2),
        "confidence": confidence
    }

# To run this server:
# 1. Make sure you have fastapi and uvicorn installed:
#    pip install fastapi "uvicorn[standard]" scikit-learn joblib numpy
# 2. Run the server from your terminal in the 'api' directory:
#    uvicorn main:app --reload
