import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  Eye,
  Loader2,
  UserX,
  FileWarning
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

// --- Helper Types & Interfaces ---
interface PatientData {
  id: number;
  name: string;
  age: number;
  gender: string;
  conditions: string[];
  frailty_score: number;
  // Add other patient fields as needed
}

interface VitalsData {
  hba1c: number;
  bp: string;
  bmi: number;
  egfr: number;
  // Add other vitals fields as needed
}

interface PatientListItem {
  id: number;
  name: string;
}

interface RiskFactor {
  name: string;
  impact: 'High' | 'Medium' | 'Low';
  value: string;
}

interface CalculatedRisk {
  category: string;
  icon: React.ElementType;
  score: number;
  level: 'high' | 'medium' | 'low';
  factors: RiskFactor[];
  modelConfidence?: number;
}

interface Recommendation {
  title: string;
  description: string;
  priority: 'high' | 'medium';
  category: string;
}

// --- Risk Calculation Logic ---
const calculateRiskScores = (patient: PatientData | null, vitals: VitalsData | null): CalculatedRisk[] => {
  if (!patient || !vitals) return [];

  const { age, conditions, frailty_score } = patient;
  const { hba1c, bp, bmi, egfr } = vitals;
  const [systolicBp = 0] = bp ? bp.split('/').map(Number) : [0];

  // 1. Cardiovascular Risk
  const cvRisk: CalculatedRisk = { category: "Cardiovascular Risk", icon: Heart, score: 0, level: 'low', factors: [] };
  if (age > 70) {
    cvRisk.score += 25;
    cvRisk.factors.push({ name: "Age > 70", impact: "High", value: "+25%" });
  }
  if (conditions.includes("Hypertension")) {
    cvRisk.score += 20;
    cvRisk.factors.push({ name: "Existing Hypertension", impact: "High", value: "+20%" });
  }
  if (bmi > 30) {
    cvRisk.score += 15;
    cvRisk.factors.push({ name: "Obesity (BMI > 30)", impact: "Medium", value: "+15%" });
  }
  if (egfr < 60) {
    cvRisk.score += 15;
    cvRisk.factors.push({ name: "CKD (eGFR < 60)", impact: "Medium", value: "+15%" });
  }
   if (hba1c > 8) {
    cvRisk.score += 10;
    cvRisk.factors.push({ name: "Poor Glycemic Control", impact: "Medium", value: "+10%" });
  }
  if (cvRisk.score > 65) cvRisk.level = 'high';
  else if (cvRisk.score > 35) cvRisk.level = 'medium';

  // 2. Hypoglycemia Risk
  const hypoRisk: CalculatedRisk = { category: "Hypoglycemia Risk", icon: Droplets, score: 0, level: 'low', factors: [] };
  if (hba1c > 9.0 && (age >= 80 || frailty_score >= 4)) {
    hypoRisk.score += 50;
    hypoRisk.factors.push({ name: "High HbA1c with Frailty/Age", impact: "High", value: "+50%" });
  }
  if (egfr < 45) {
    hypoRisk.score += 30;
    hypoRisk.factors.push({ name: "Renal Impairment (eGFR < 45)", impact: "High", value: "+30%" });
  }
  if (frailty_score >= 2) {
    hypoRisk.score += 15;
    hypoRisk.factors.push({ name: "Moderate Frailty", impact: "Medium", value: "+15%" });
  }
  if (hypoRisk.score > 50) hypoRisk.level = 'high';
  else if (hypoRisk.score > 20) hypoRisk.level = 'medium';
  
  // 3. Blood Pressure Control
  const bpRisk: CalculatedRisk = { category: "BP Control Risk", icon: Activity, score: 0, level: 'low', factors: [] };
  if (systolicBp >= 160) {
    bpRisk.score += 60;
    bpRisk.factors.push({ name: "Stage 2 HTN (SBP ≥ 160)", impact: "High", value: "+60%" });
  } else if (systolicBp >= 140) {
    bpRisk.score += 30;
    bpRisk.factors.push({ name: "Stage 1 HTN (SBP ≥ 140)", impact: "Medium", value: "+30%" });
  }
  if (age > 75 && systolicBp > 140) {
     bpRisk.score += 20;
     bpRisk.factors.push({ name: "Geriatric Target Failure", impact: "Medium", value: "+20%" });
  }
  if (bpRisk.score > 55) bpRisk.level = 'high';
  else if (bpRisk.score > 25) bpRisk.level = 'medium';

  // 4. Adverse Event Risk (Proxy for Polypharmacy)
  const adverseRisk: CalculatedRisk = { category: "Adverse Event Risk", icon: AlertTriangle, score: 0, level: 'low', factors: [] };
   if (frailty_score >= 4) {
    adverseRisk.score += 40;
    adverseRisk.factors.push({ name: "High Frailty", impact: "High", value: "+40%" });
  }
  if (egfr < 60) {
    adverseRisk.score += 30;
    adverseRisk.factors.push({ name: "Impaired Drug Clearance (eGFR < 60)", impact: "High", value: "+30%" });
  }
  if (conditions.length > 3) {
      adverseRisk.score += 15;
      adverseRisk.factors.push({ name: "Multiple Comorbidities", impact: "Medium", value: "+15%" });
  }
  if (adverseRisk.score > 60) adverseRisk.level = 'high';
  else if (adverseRisk.score > 30) adverseRisk.level = 'medium';

  return [cvRisk, hypoRisk, bpRisk, adverseRisk].map(risk => ({ ...risk, score: Math.min(risk.score, 100) }));
};


// --- Main Component ---

export default function RiskAssessment() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [patient, setPatient] = useState<PatientData | null>(null);
  const [vitals, setVitals] = useState<VitalsData | null>(null);
  const [patientList, setPatientList] = useState<PatientListItem[]>([]);

  useEffect(() => {
    // Fetch the list of all patients for the dropdown selector
    const fetchPatientList = async () => {
      const { data, error } = await supabase.from('patients').select('id, name').order('name');
      if (error) {
        toast({ title: "Failed to load patient list", variant: "destructive" });
      } else {
        setPatientList(data || []);
      }
    };
    fetchPatientList();
  }, [toast]);

  useEffect(() => {
    if (!patientId) {
      setIsLoading(false);
      setPatient(null);
      setVitals(null);
      return;
    }

    const fetchPatientData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data: patientData, error: patientError } = await supabase
          .from('patients')
          .select('*')
          .eq('id', patientId)
          .single();

        if (patientError) {
          // Throw error if patient not found
          throw new Error("Patient profile not found. Please select a valid patient.");
        }
        setPatient(patientData);

        // Now fetch vitals, but don't throw a fatal error if they don't exist
        const { data: vitalsData, error: vitalsError } = await supabase
          .from('vitals')
          .select('*')
          .eq('patient_id', patientId)
          .single();
        
        if (vitalsError && vitalsError.code !== 'PGRST116') {
            // PGRST116 is the code for 'exact one row not found', which is okay here.
            // Throw for other, unexpected errors.
            throw new Error("Could not load patient's clinical vitals.");
        }
        setVitals(vitalsData); // This will be null if no vitals found, which is handled by the UI

      } catch (error: any) {
        setError(error.message);
        setPatient(null);
        setVitals(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatientData();
  }, [patientId]);

  const riskScores = useMemo(() => calculateRiskScores(patient, vitals), [patient, vitals]);

  const clinicalRecommendations = useMemo((): Recommendation[] => {
    const recommendations: Recommendation[] = [];
    const recommendationMap: Record<string, Record<'high' | 'medium', Omit<Recommendation, 'category'>>> = {
      "Cardiovascular Risk": {
        high: { title: "High-Priority: Cardiovascular Intervention", description: "Patient's risk is high. Strongly consider ACE inhibitor/ARB dose adjustment, statin therapy optimization, and referral to cardiology.", priority: 'high' },
        medium: { title: "Cardiovascular Risk Mitigation", description: "Review lifestyle factors (diet, exercise) and ensure blood pressure and lipid targets are being met.", priority: 'medium' }
      },
      "Hypoglycemia Risk": {
        high: { title: "Urgent: Hypoglycemia Prevention", description: "Patient is at high risk. Review insulin/secretagogue regimen for potential de-intensification. Provide extensive patient education on recognition and management of lows.", priority: 'high' },
        medium: { title: "Hypoglycemia Awareness", description: "Patient has moderate risk. Educate on symptoms of hypoglycemia and ensure they have a plan for treatment.", priority: 'medium' }
      },
      "BP Control Risk": {
        high: { title: "Urgent: Blood Pressure Control", description: "Patient has Stage 2+ Hypertension. Immediate medication review and adjustment is required to lower cardiovascular risk.", priority: 'high' },
        medium: { title: "Blood Pressure Management", description: "Patient is not meeting BP targets. Consider lifestyle modifications and medication adherence review before dose escalation.", priority: 'medium' }
      },
      "Adverse Event Risk": {
        high: { title: "High-Priority: Medication Review", description: "High frailty and/or poor renal function puts patient at significant risk. A comprehensive medication reconciliation is strongly advised to simplify regimen and avoid interactions.", priority: 'high' },
        medium: { title: "Medication Management", description: "Patient has multiple factors increasing adverse event risk. Review non-essential medications and educate on potential side effects.", priority: 'medium' }
      }
    };

    riskScores.forEach(risk => {
      if (risk.level === 'high' || risk.level === 'medium') {
        const rec = recommendationMap[risk.category]?.[risk.level];
        if (rec) {
          recommendations.push({ ...rec, category: risk.category });
        }
      }
    });

    // Sort by priority: high first, then medium
    return recommendations.sort((a, b) => {
      if (a.priority === 'high' && b.priority !== 'high') {
        return -1;
      }
      if (a.priority !== 'high' && b.priority === 'high') {
        return 1;
      }
      return 0;
    });

  }, [riskScores]);

  const handlePatientChange = (id: string) => {
    if (id !== patientId) {
      navigate(`/risk-assessment/${id}`);
    }
  };

  // --- Render States ---

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  const renderContent = () => {
    if (!patientId || !patient) {
       return (
        <div className="flex flex-col items-center justify-center h-full text-center">
            <UserX className="w-16 h-16 text-muted-foreground mb-4"/>
            <h2 className="text-xl font-semibold mb-2">No Patient Selected</h2>
            <p className="text-muted-foreground mb-4 max-w-md">Please select a patient from the dropdown below to view their risk assessment.</p>
            <div className="w-full max-w-sm">
              <Select onValueChange={handlePatientChange}>
                <SelectTrigger><SelectValue placeholder="Select a patient..." /></SelectTrigger>
                <SelectContent>
                  {patientList.map(p => (<SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
        </div>
      );
    }

    if (error) {
       return (
        <div className="flex flex-col items-center justify-center h-full text-center">
            <AlertTriangle className="w-16 h-16 text-destructive mb-4"/>
            <h2 className="text-xl font-semibold mb-2">Failed to Load Assessment</h2>
            <p className="text-destructive max-w-md mb-4">{error}</p>
            <Button onClick={() => navigate('/dashboard')}>Return to Dashboard</Button>
        </div>
      );
    }

    if (patient && !vitals) {
        return (
        <div className="flex flex-col items-center justify-center h-full text-center">
            <FileWarning className="w-16 h-16 text-yellow-500 mb-4"/>
            <h2 className="text-xl font-semibold mb-2">Missing Clinical Vitals</h2>
            <p className="text-muted-foreground max-w-md mb-4">
                A risk assessment for <strong>{patient.name}</strong> cannot be generated because their vital signs (BP, HbA1c, etc.) have not been recorded.
            </p>
            <Button onClick={() => navigate(`/patient-data/${patientId}`)}>Enter Vitals Data</Button>
        </div>
      );
    }

    if (patient && vitals) {
      return (
        <div className="space-y-4 md:space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1">
             <h1 className="text-2xl md:text-3xl font-bold text-foreground">Risk Assessment</h1>
             <p className="text-sm md:text-base text-muted-foreground">Rule-based risk calculation for selected patient</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="w-full sm:w-64">
              <Select onValueChange={handlePatientChange} value={patientId}>
                <SelectTrigger><SelectValue placeholder="Select a patient..." /></SelectTrigger>
                <SelectContent>
                  {patientList.map(p => (<SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            {/* Future buttons can go here
            <Button variant="outline" className="flex items-center justify-center space-x-2 w-full sm:w-auto">
              <Eye className="w-4 h-4" />
              <span>SHAP Analysis</span>
            </Button>
            <Button className="flex items-center justify-center space-x-2 bg-gradient-medical w-full sm:w-auto">
              <Brain className="w-4 h-4" />
              <span>Run New Assessment</span>
            </Button>
            */}
          </div>
        </div>

        {/* Risk Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {riskScores.map((risk, index) => (
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
                  <span className={`text-sm font-medium ${
                      risk.level === 'high' ? 'text-risk-high' :
                      risk.level === 'medium' ? 'text-risk-medium' :
                      'text-risk-low'
                  }`}>
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
          {riskScores.map((risk, index) => (
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
                {risk.factors.length > 0 ? risk.factors.map((factor, factorIndex) => (
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
                )) : (
                   <div className="text-center text-muted-foreground py-4">No significant risk factors identified.</div>
                )}
              </div>

            </Card>
          ))}
        </div>

        {/* Clinical Recommendations (Static for now) */}
        {clinicalRecommendations.length > 0 && (
          <Card className="p-4 md:p-6 shadow-card">
            <h3 className="text-lg md:text-xl font-semibold mb-4 flex items-center">
              <Target className="w-4 h-4 md:w-5 md:h-5 mr-2 text-primary" />
              Risk-Based Clinical Recommendations
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              {clinicalRecommendations.map((rec, index) => (
                <div key={index} className={`p-4 rounded-lg border-l-4 ${rec.priority === 'high' ? 'border-risk-high bg-risk-high-bg' : 'border-risk-medium bg-risk-medium-bg'}`}>
                  <h4 className={`font-semibold mb-1 ${rec.priority === 'high' ? 'text-risk-high' : 'text-risk-medium'}`}>
                    {rec.title}
                  </h4>
                  <p className="text-sm text-muted-foreground">{rec.description}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {clinicalRecommendations.length === 0 && (
          <Card className="p-6 shadow-card text-center">
            <div className="flex flex-col items-center justify-center">
              <h3 className="text-lg font-semibold mb-2">No High-Priority Recommendations</h3>
              <p className="text-muted-foreground max-w-md">Based on the current data, no medium or high-risk categories were identified that require specific clinical action at this time. Continue routine monitoring.</p>
            </div>
          </Card>
        )}
      </div>
      );
    }
  }

  return (
    <DashboardLayout>
      {renderContent()}
    </DashboardLayout>
  );
}
