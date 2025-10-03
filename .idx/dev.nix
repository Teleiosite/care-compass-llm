{pkgs}:
let
  # Create a Python environment with our FastAPI and ML dependencies
  pythonEnv = pkgs.python311.withPackages (ps: [
    ps.fastapi
    ps.uvicorn
    ps.scikit-learn # For machine learning models
    ps.pandas       # For data manipulation
    ps.numpy        # For numerical operations
    ps.matplotlib   # For plotting
    ps.imbalanced-learn # For SMOTE
    ps.shap         # For model explainability
    ps.joblib       # For saving the model
  ]);
in
{
  channel = "stable-24.05";
  packages = [
    pkgs.nodejs_20
    # Add the Python environment to the system PATH
    pythonEnv
  ];
  idx.extensions = [
    # Recommended extensions for TypeScript/React projects
    "dbaeumer.vscode-eslint"
  ];
  idx.previews = {
    previews = {
      web = {
        command = [
          "npm"
          "run"
          "dev"
          "--"
          "--port"
          "$PORT"
          "--host"
          "0.0.0.0"
        ];
        manager = "web";
      };
      # Add a preview for our Python backend
      backend = {
        command = [
          "uvicorn"
          "api.main:app"
          "--host"
          "0.0.0.0"
          "--port"
          "8000"
          "--reload"
        ];
        manager = "web";
      };
    };
  };
}
