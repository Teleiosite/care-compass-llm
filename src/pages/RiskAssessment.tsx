import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Target, 
  Heart, 
  Droplets, 
  Activity, 
  AlertTriangle,
  TrendingUp,
  Brain,
  Eye
} from "lucide-react";

export default function RiskAssessment() {
  const riskFactors = [
    {
      category: "Cardiovascular Risk",
      icon: Heart,
      score: 68,
      level: "high",
      factors: [
        { name: "Age > 70", impact: "High", value: "+15%" },
        { name: "Hypertension", impact: "High", value: "+20%" },
        { name: "High LDL", impact: "Medium", value: "+10%" },
        { name: "Family History", impact: "Medium", value: "+8%" }
      ]
    },
    {
      category: "Hypoglycemia Risk",
      icon: Droplets,
      score: 35,
      level: "low",
      factors: [
        { name: "Multiple Medications", impact: "Medium", value: "+12%" },
        { name: "Frailty Score", impact: "Low", value: "+5%" },
        { name: "Renal Function", impact: "Low", value: "+3%" }
      ]
    },
    {
      category: "Blood Pressure Control",
      icon: Activity,
      score: 52,
      level: "medium",
      factors: [
        { name: "Current BP Reading", impact: "High", value: "+25%" },
        { name: "Medication Adherence", impact: "Medium", value: "+15%" },
        { name: "Salt Intake", impact: "Low", value: "+7%" }
      ]
    },
    {
      category: "Polypharmacy Risk",
      icon: AlertTriangle,
      score: 45,
      level: "medium",
      factors: [
        { name: "Total Medications", impact: "High", value: "+18%" },
        { name: "Drug Interactions", impact: "Medium", value: "+12%" },
        { name: "Cognitive Status", impact: "Medium", value: "+10%" }
      ]
    }
  ];

  const getScoreColor = (level: string) => {
    switch (level) {
      case "high": return "text-risk-high";
      case "medium": return "text-risk-medium";
      case "low": return "text-risk-low";
      default: return "text-muted-foreground";
    }
  };

  const getProgressColor = (level: string) => {
    switch (level) {
      case "high": return "bg-risk-high";
      case "medium": return "bg-risk-medium";
      case "low": return "bg-risk-low";
      default: return "bg-muted";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Risk Assessment</h1>
            <p className="text-sm md:text-base text-muted-foreground">ML-powered risk prediction with explainable AI</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button variant="outline" className="flex items-center justify-center space-x-2 w-full sm:w-auto">
              <Eye className="w-4 h-4" />
              <span>SHAP Analysis</span>
            </Button>
            <Button className="flex items-center justify-center space-x-2 bg-gradient-medical w-full sm:w-auto">
              <Brain className="w-4 h-4" />
              <span>Run New Assessment</span>
            </Button>
          </div>
        </div>

        {/* Risk Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {riskFactors.map((risk, index) => (
          <Card key={index} className="p-4 md:p-6 shadow-card">
            <div className="flex items-center justify-between mb-3 md:mb-4 flex-wrap gap-2">
              <div className="flex items-center space-x-2 md:space-x-3">
                <div className="p-1.5 md:p-2 rounded-lg bg-primary-light">
                  <risk.icon className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-xs md:text-sm">{risk.category}</h3>
                    <Badge 
                      variant="secondary"
                      className={
                        risk.level === 'high' ? "bg-risk-high-bg text-risk-high" :
                        risk.level === 'medium' ? "bg-risk-medium-bg text-risk-medium" :
                        "bg-risk-low-bg text-risk-low"
                      }
                    >
                      {risk.level.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-foreground">{risk.score}%</span>
                  <span className={`text-sm font-medium ${getScoreColor(risk.level)}`}>
                    Risk Score
                  </span>
                </div>
                
                <Progress 
                  value={risk.score} 
                  className="h-2"
                />
              </div>
            </Card>
          ))}
        </div>

        {/* Detailed Risk Factors */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {riskFactors.map((risk, index) => (
          <Card key={index} className="p-4 md:p-6 shadow-card">
            <div className="flex items-center space-x-2 md:space-x-3 mb-4 md:mb-6">
              <div className="p-1.5 md:p-2 rounded-lg bg-primary-light">
                <risk.icon className="w-4 h-4 md:w-5 md:h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-base md:text-lg font-semibold">{risk.category}</h3>
                <p className="text-xs md:text-sm text-muted-foreground">Contributing Factors Analysis</p>
              </div>
            </div>

              <div className="space-y-4">
                {risk.factors.map((factor, factorIndex) => (
                  <div key={factorIndex} className="flex items-center justify-between p-3 rounded-lg border border-border">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{factor.name}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge 
                          variant="outline" 
                          className={
                            factor.impact === 'High' ? "bg-risk-high-bg text-risk-high border-risk-high" :
                            factor.impact === 'Medium' ? "bg-risk-medium-bg text-risk-medium border-risk-medium" :
                            "bg-risk-low-bg text-risk-low border-risk-low"
                          }
                        >
                          {factor.impact} Impact
                        </Badge>
                        <span className="text-sm font-medium text-primary">{factor.value}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-clinical-teal-light rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-clinical-teal" />
                  <span className="font-medium text-clinical-teal">ML Model Confidence</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-clinical-teal">94.2%</span>
                  <span className="text-sm text-clinical-teal">Random Forest Model</span>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Clinical Recommendations */}
        <Card className="p-4 md:p-6 shadow-card">
          <h3 className="text-lg md:text-xl font-semibold mb-4 flex items-center">
            <Target className="w-4 h-4 md:w-5 md:h-5 mr-2 text-primary" />
            Risk-Based Clinical Recommendations
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-risk-high">High Priority Actions</h4>
              <div className="space-y-3">
                <div className="p-3 border-l-4 border-risk-high bg-risk-high-bg rounded-r-lg">
                  <p className="font-medium text-sm">Cardiovascular Risk Management</p>
                  <p className="text-sm text-muted-foreground mt-1">Consider ACE inhibitor dose adjustment and statin therapy optimization</p>
                </div>
                <div className="p-3 border-l-4 border-risk-medium bg-risk-medium-bg rounded-r-lg">
                  <p className="font-medium text-sm">Blood Pressure Monitoring</p>
                  <p className="text-sm text-muted-foreground mt-1">Increase monitoring frequency to weekly for 4 weeks</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-clinical-teal">Preventive Measures</h4>
              <div className="space-y-3">
                <div className="p-3 border-l-4 border-clinical-teal bg-clinical-teal-light rounded-r-lg">
                  <p className="font-medium text-sm">Hypoglycemia Prevention</p>
                  <p className="text-sm text-muted-foreground mt-1">Patient education on recognition and management of hypoglycemic episodes</p>
                </div>
                <div className="p-3 border-l-4 border-risk-low bg-risk-low-bg rounded-r-lg">
                  <p className="font-medium text-sm">Medication Review</p>
                  <p className="text-sm text-muted-foreground mt-1">Schedule comprehensive medication review within 2 weeks</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}