
// src/lib/ml-models.ts

export interface PredictionItem {
  outcome: string;
  probability: number;
  confidence: 'High' | 'Medium' | 'Low';
}

// --- Data Structures ---
// These interfaces define the expected shape of the data from the API.

export interface ModelPrediction {
  model: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  predictions: PredictionItem[];
}

export interface FeatureImportance {
  feature: string;
  importance: number;
  description: string;
}

// --- API Functions ---
// These functions call the real machine learning backend.
// The base URL should be configured in an environment variable.
const API_BASE_URL = '/api/ml'; // This will be proxied by Vite's dev server

/**
 * A helper function to perform a GET request to the ML API.
 * @param endpoint The API endpoint to call.
 * @returns The JSON response as a promise.
 */
const fetchApi = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API call to ${url} failed with status ${response.status}`);
    }

    return response.json() as Promise<T>;
  } catch (error) {
    console.error("API Fetch Error:", error);
    // Re-throw the error to be caught by the calling component
    throw error;
  }
};

/**
 * Fetches model prediction results from the ML backend.
 */
export const fetchModelPredictions = (): Promise<ModelPrediction[]> => {
  return fetchApi<ModelPrediction[]>('/predictions');
};

/**
 * Fetches feature importance data (e.g., SHAP values) from the ML backend.
 */
export const fetchFeatureImportance = (): Promise<FeatureImportance[]> => {
  return fetchApi<FeatureImportance[]>('/feature-importance');
};

/**
 * Runs a real-time prediction for a single patient.
 * @param features A numeric array of patient features.
 */
export const runSinglePrediction = (features: number[]): Promise<PredictionItem> => {
  return fetchApi<PredictionItem>('/run-prediction', {
    method: 'POST',
    body: JSON.stringify({
      patient_features: features,
    }),
  });
};
