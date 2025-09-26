import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  FileText, 
  Bot, 
  Shield, 
  CheckCircle, 
  AlertTriangle,
  Download,
  Edit,
  BookOpen,
  Zap
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function TreatmentPlans() {
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState("ai-generated");

  const treatmentPlans = [
    {
      id: "ai-generated",
      title: "AI-Generated Treatment Plan",
      source: "LLM + Clinical Guidelines",
      confidence: 94,
      status: "recommended",
      lastUpdated: "2 hours ago"
    },
    {
      id: "clinician-modified",
      title: "Clinician-Modified Plan",
      source: "AI + Clinical Oversight",
      confidence: 98,
      status: "approved",
      lastUpdated: "30 minutes ago"
    }
  ];

  const aiRecommendations = {
    medications: [
      {
        action: "Adjust",
        medication: "Metformin",
        currentDose: "1000mg BID",
        recommendedDose: "1000mg TID",
        rationale: "HbA1c >8% despite current therapy. ADA guidelines recommend intensification.",
        safety: "Monitor for GI side effects. Contraindicated if eGFR <30.",
        evidence: "ADA 2024 Standards of Care, Section 9"
      },
      {
        action: "Add",
        medication: "Linagliptin",
        currentDose: "None",
        recommendedDose: "5mg daily",
        rationale: "DPP-4 inhibitor for elderly patients. Low hypoglycemia risk.",
        safety: "Renally adjusted. Monitor for pancreatitis symptoms.",
        evidence: "Geriatric Diabetes Guidelines 2023"
      },
      {
        action: "Continue",
        medication: "Lisinopril",
        currentDose: "10mg daily",
        recommendedDose: "10mg daily",
        rationale: "BP control adequate. Continue current therapy.",
        safety: "Monitor potassium and creatinine monthly.",
        evidence: "ACC/AHA Hypertension Guidelines"
      }
    ],
    lifestyle: [
      {
        recommendation: "Dietary Consultation",
        priority: "High",
        details: "Refer to certified diabetes educator for carbohydrate counting and meal planning."
      },
      {
        recommendation: "Exercise Program",
        priority: "Medium",
        details: "Low-impact activities 150 min/week. Consider physical therapy assessment."
      },
      {
        recommendation: "Blood Glucose Monitoring",
        priority: "High",
        details: "Increase to QID x 1 week, then BID fasting and post-prandial."
      }
    ],
    monitoring: [
      {
        parameter: "HbA1c",
        frequency: "Every 3 months",
        target: "<7.5% (individualized for age)",
        nextDue: "March 15, 2024"
      },
      {
        parameter: "Blood Pressure",
        frequency: "Weekly x 4 weeks, then monthly",
        target: "<140/90 mmHg",
        nextDue: "Next visit"
      },
      {
        parameter: "Lipid Panel",
        frequency: "Every 6 months",
        target: "LDL <100 mg/dL",
        nextDue: "April 1, 2024"
      }
    ]
  };

  const safetyAlerts = [
    {
      type: "Drug Interaction",
      severity: "moderate",
      message: "Lisinopril + Metformin: Monitor kidney function closely",
      action: "Check creatinine in 1 week"
    },
    {
      type: "Age Consideration",
      severity: "low",
      message: "Patient >70 years: Consider relaxed glycemic targets",
      action: "HbA1c target 7.0-7.5% acceptable"
    }
  ];

  const handleApprovePlan = () => {
    toast({
      title: "Treatment plan approved",
      description: "The treatment plan has been approved and saved to patient record.",
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Treatment Plans</h1>
            <p className="text-muted-foreground">LLM-powered personalized recommendations with clinical oversight</p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" className="flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Export PDF</span>
            </Button>
            <Button className="flex items-center space-x-2 bg-gradient-medical">
              <Bot className="w-4 h-4" />
              <span>Generate New Plan</span>
            </Button>
          </div>
        </div>

        {/* Plan Selection */}
        <Card className="p-6 shadow-card">
          <h3 className="text-lg font-semibold mb-4">Available Treatment Plans</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {treatmentPlans.map((plan) => (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                  selectedPlan === plan.id
                    ? "border-primary bg-primary-light"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{plan.title}</h4>
                  <Badge 
                    variant={plan.status === "approved" ? "default" : "secondary"}
                    className={
                      plan.status === "approved" 
                        ? "bg-risk-low-bg text-risk-low" 
                        : "bg-clinical-teal-light text-clinical-teal"
                    }
                  >
                    {plan.status.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{plan.source}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Confidence: {plan.confidence}%</span>
                  <span className="text-xs text-muted-foreground">{plan.lastUpdated}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Safety Alerts */}
        <Card className="p-6 shadow-card">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Shield className="w-5 h-5 mr-2 text-primary" />
            Safety Guardrails & Alerts
          </h3>
          <div className="space-y-3">
            {safetyAlerts.map((alert, index) => (
              <div key={index} className={`p-4 rounded-lg border-l-4 ${
                alert.severity === "high" ? "bg-risk-high-bg border-risk-high" :
                alert.severity === "moderate" ? "bg-risk-medium-bg border-risk-medium" :
                "bg-risk-low-bg border-risk-low"
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{alert.type}</span>
                  <Badge variant="outline" className={
                    alert.severity === "high" ? "bg-risk-high-bg text-risk-high border-risk-high" :
                    alert.severity === "moderate" ? "bg-risk-medium-bg text-risk-medium border-risk-medium" :
                    "bg-risk-low-bg text-risk-low border-risk-low"
                  }>
                    {alert.severity.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{alert.message}</p>
                <p className="text-sm font-medium">{alert.action}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Treatment Recommendations */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Medications */}
          <Card className="p-6 shadow-card">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Zap className="w-5 h-5 mr-2 text-primary" />
              Medication Changes
            </h3>
            <div className="space-y-4">
              {aiRecommendations.medications.map((med, index) => (
                <div key={index} className="p-4 border border-border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{med.medication}</span>
                    <Badge variant={
                      med.action === "Add" ? "default" : 
                      med.action === "Adjust" ? "secondary" : "outline"
                    } className={
                      med.action === "Add" ? "bg-clinical-teal-light text-clinical-teal" :
                      med.action === "Adjust" ? "bg-risk-medium-bg text-risk-medium" :
                      "bg-muted"
                    }>
                      {med.action}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mb-2">
                    <p><strong>Current:</strong> {med.currentDose}</p>
                    <p><strong>Recommended:</strong> {med.recommendedDose}</p>
                  </div>
                  <p className="text-sm mb-2">{med.rationale}</p>
                  <div className="text-xs text-muted-foreground">
                    <p className="mb-1"><strong>Safety:</strong> {med.safety}</p>
                    <p><strong>Evidence:</strong> {med.evidence}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Lifestyle Recommendations */}
          <Card className="p-6 shadow-card">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-primary" />
              Lifestyle Interventions
            </h3>
            <div className="space-y-4">
              {aiRecommendations.lifestyle.map((lifestyle, index) => (
                <div key={index} className="p-4 border border-border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{lifestyle.recommendation}</span>
                    <Badge variant={lifestyle.priority === "High" ? "destructive" : "secondary"}>
                      {lifestyle.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{lifestyle.details}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Monitoring Plan */}
          <Card className="p-6 shadow-card">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-primary" />
              Monitoring Schedule
            </h3>
            <div className="space-y-4">
              {aiRecommendations.monitoring.map((monitor, index) => (
                <div key={index} className="p-4 border border-border rounded-lg">
                  <h4 className="font-medium text-sm mb-2">{monitor.parameter}</h4>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p><strong>Frequency:</strong> {monitor.frequency}</p>
                    <p><strong>Target:</strong> {monitor.target}</p>
                    <p><strong>Next Due:</strong> {monitor.nextDue}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Clinical Notes */}
        <Card className="p-6 shadow-card">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Edit className="w-5 h-5 mr-2 text-primary" />
            Clinical Notes & Modifications
          </h3>
          <Textarea 
            placeholder="Add clinical notes, modifications to AI recommendations, or additional considerations..."
            className="min-h-32 mb-4"
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                All recommendations are based on current ADA, ESC, and ACC/AHA guidelines
              </span>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline">Save Draft</Button>
              <Button onClick={handleApprovePlan} className="bg-gradient-medical">
                Approve & Implement
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}