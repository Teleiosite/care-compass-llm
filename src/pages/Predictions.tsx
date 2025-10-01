import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, 
  BarChart3, 
  TrendingUp, 
  Calendar,
  Download,
  RefreshCw,
  Eye,
  Lightbulb
} from "lucide-react";

export default function Predictions() {
  const modelPredictions = [
    {
      model: "Random Forest Classifier",
      accuracy: 94.2,
      precision: 91.8,
      recall: 96.1,
      f1Score: 93.9,
      predictions: [
        { outcome: "Cardiovascular Event (30 days)", probability: 0.68, confidence: "High" },
        { outcome: "Hypoglycemic Episode (7 days)", probability: 0.12, confidence: "Medium" },
        { outcome: "Emergency Hospitalization (90 days)", probability: 0.34, confidence: "High" },
        { outcome: "Medication Non-adherence", probability: 0.45, confidence: "Medium" }
      ]
    },
    {
      model: "Neural Network (Deep Learning)",
      accuracy: 92.7,
      precision: 90.3,
      recall: 94.8,
      f1Score: 92.5,
      predictions: [
        { outcome: "Cardiovascular Event (30 days)", probability: 0.71, confidence: "High" },
        { outcome: "Hypoglycemic Episode (7 days)", probability: 0.09, confidence: "Low" },
        { outcome: "Emergency Hospitalization (90 days)", probability: 0.38, confidence: "High" },
        { outcome: "Medication Non-adherence", probability: 0.42, confidence: "Medium" }
      ]
    }
  ];

  const featureImportance = [
    { feature: "Age", importance: 0.23, description: "Patient age (74 years)" },
    { feature: "HbA1c Level", importance: 0.19, description: "Current: 8.2% (target: <7%)" },
    { feature: "Blood Pressure", importance: 0.17, description: "Systolic: 145 mmHg" },
    { feature: "Medication Count", importance: 0.14, description: "Currently taking 8 medications" },
    { feature: "Frailty Score", importance: 0.12, description: "Score: 3/5 (moderate frailty)" },
    { feature: "Comorbidities", importance: 0.08, description: "Hypertension, metabolic syndrome" },
    { feature: "BMI", importance: 0.07, description: "32.1 kg/m² (obese)" }
  ];

  const getProbabilityColor = (prob: number) => {
    if (prob >= 0.6) return "text-risk-high";
    if (prob >= 0.3) return "text-risk-medium";
    return "text-risk-low";
  };

  const getProbabilityBg = (prob: number) => {
    if (prob >= 0.6) return "bg-risk-high-bg";
    if (prob >= 0.3) return "bg-risk-medium-bg";
    return "bg-risk-low-bg";
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">ML Predictions</h1>
            <p className="text-sm md:text-base text-muted-foreground">Machine learning model outputs and interpretability</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button variant="outline" className="flex items-center justify-center space-x-2 w-full sm:w-auto text-sm">
              <Download className="w-4 h-4" />
              <span>Export Results</span>
            </Button>
            <Button variant="outline" className="flex items-center justify-center space-x-2 w-full sm:w-auto text-sm">
              <RefreshCw className="w-4 h-4" />
              <span>Retrain Models</span>
            </Button>
            <Button className="flex items-center justify-center space-x-2 bg-gradient-medical w-full sm:w-auto text-sm">
              <Brain className="w-4 h-4" />
              <span>Run Prediction</span>
            </Button>
          </div>
        </div>

        {/* Model Performance Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {modelPredictions.map((model, index) => (
          <Card key={index} className="p-4 md:p-6 shadow-card">
            <div className="flex items-center justify-between mb-4 md:mb-6 flex-wrap gap-2">
              <div>
                <h3 className="text-base md:text-lg font-semibold">{model.model}</h3>
                <div className="flex items-center space-x-2 mt-1 flex-wrap gap-1">
                    <Badge variant="secondary" className="bg-clinical-teal-light text-clinical-teal">
                      Accuracy: {model.accuracy}%
                    </Badge>
                    <Badge variant="outline">
                      F1: {model.f1Score}%
                    </Badge>
                  </div>
                </div>
                <Brain className="w-8 h-8 text-primary" />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Precision</p>
                  <p className="text-xl font-bold text-foreground">{model.precision}%</p>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Recall</p>
                  <p className="text-xl font-bold text-foreground">{model.recall}%</p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-sm text-muted-foreground">Current Predictions</h4>
                {model.predictions.map((pred, predIndex) => (
                  <div key={predIndex} className={`p-4 rounded-lg ${getProbabilityBg(pred.probability)}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{pred.outcome}</span>
                      <Badge 
                        variant="outline"
                        className={
                          pred.confidence === 'High' ? "bg-risk-high-bg text-risk-high border-risk-high" :
                          pred.confidence === 'Medium' ? "bg-risk-medium-bg text-risk-medium border-risk-medium" :
                          "bg-risk-low-bg text-risk-low border-risk-low"
                        }
                      >
                        {pred.confidence}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <Progress value={pred.probability * 100} className="flex-1 mr-3" />
                      <span className={`font-bold ${getProbabilityColor(pred.probability)}`}>
                        {(pred.probability * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>

        {/* Feature Importance (SHAP Values) */}
        <Card className="p-6 shadow-card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold flex items-center">
                <Eye className="w-5 h-5 mr-2 text-primary" />
                Feature Importance Analysis (SHAP)
              </h3>
              <p className="text-sm text-muted-foreground">
                Explainable AI showing which factors contribute most to predictions
              </p>
            </div>
            <Button variant="outline" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Detailed SHAP Plot</span>
            </Button>
          </div>

          <div className="space-y-4">
            {featureImportance.map((feature, index) => (
              <div key={index} className="p-4 border border-border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-medium">{feature.feature}</h4>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-lg text-primary">
                      {(feature.importance * 100).toFixed(1)}%
                    </span>
                    <p className="text-xs text-muted-foreground">Importance</p>
                  </div>
                </div>
                <Progress value={feature.importance * 100} className="h-2" />
              </div>
            ))}
          </div>
        </Card>

        {/* Model Insights & Recommendations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6 shadow-card">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <Lightbulb className="w-5 h-5 mr-2 text-primary" />
              Key Insights
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-clinical-teal-light rounded-lg">
                <h4 className="font-medium text-clinical-teal mb-2">High Cardiovascular Risk</h4>
                <p className="text-sm text-muted-foreground">
                  Both models agree on elevated 30-day cardiovascular event risk. 
                  Primary contributors: age, uncontrolled BP, and elevated HbA1c.
                </p>
              </div>
              <div className="p-4 bg-risk-medium-bg rounded-lg">
                <h4 className="font-medium text-risk-medium mb-2">Polypharmacy Concern</h4>
                <p className="text-sm text-muted-foreground">
                  High medication count (8 drugs) increases complexity. 
                  Consider medication reconciliation and simplification.
                </p>
              </div>
              <div className="p-4 bg-risk-low-bg rounded-lg">
                <h4 className="font-medium text-risk-low mb-2">Low Hypoglycemia Risk</h4>
                <p className="text-sm text-muted-foreground">
                  Current medication regimen shows low hypoglycemia risk. 
                  Safe to consider mild intensification if needed.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 shadow-card">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-primary" />
              Model Performance Trends
            </h3>
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Overall Accuracy Trend</span>
                  <span className="text-clinical-teal font-medium">+2.3% this month</span>
                </div>
                <Progress value={94} className="h-2" />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Prediction Confidence</span>
                  <span className="text-clinical-teal font-medium">92.4% average</span>
                </div>
                <Progress value={92} className="h-2" />
              </div>

              <div className="p-4 bg-primary-light rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span className="font-medium text-primary">Next Model Update</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Scheduled for next Monday with 50 new patient cases
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}