
import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Heart, 
  Pill, 
  Activity, 
  FileText, 
  Save,
  Loader2,
  X,
  TrendingUp,
  ShieldCheck,
  Zap,
  Droplets
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

// --- Helper Functions & Components ---

const calculateEgfr = (creatinine: number, age: number, gender: string): number | null => {
  if (!creatinine || !age || !gender) return null;
  const k = gender === 'Female' ? 0.7 : 0.9;
  const alpha = gender === 'Female' ? -0.329 : -0.411;
  const femaleFactor = gender === 'Female' ? 1.018 : 1.0;

  const egfr = 141 * Math.min(creatinine / k, 1) ** alpha * Math.max(creatinine / k, 1) ** -1.209 * (0.993 ** age) * femaleFactor;
  return parseFloat(egfr.toFixed(2));
};

interface RiskScore {
  label: string;
  icon: React.ElementType;
  level: 'low' | 'medium' | 'high' | 'none';
  rationale: string;
}

const RiskDisplayCard = ({ scores }: { scores: RiskScore[] }) => (
  <Card className="p-4 md:p-6 shadow-card">
    <h3 className="text-lg font-semibold mb-4 flex items-center">
      <ShieldCheck className="w-5 h-5 mr-2 text-primary"/>
      Real-Time Risk Analysis
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {scores.map(score => (
        <div key={score.label} className="p-4 border rounded-lg flex flex-col">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-medium flex items-center"><score.icon className="w-4 h-4 mr-2"/>{score.label}</h4>
            <Badge 
              variant={score.level === 'high' ? 'destructive' : score.level === 'medium' ? 'secondary' : 'default'}
              className={`text-xs font-bold
                ${score.level === 'high' ? "bg-risk-high-bg text-risk-high" :
                  score.level === 'medium' ? "bg-risk-medium-bg text-risk-medium" :
                  score.level === 'low' ? "bg-risk-low-bg text-risk-low" :
                  "bg-green-100 text-green-800"}
              `}
            >
              {score.level.toUpperCase()}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground flex-grow">{score.rationale}</p>
        </div>
      ))}
    </div>
  </Card>
);

// --- Main Component ---

export default function PatientData() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { patientId } = useParams();

  const [activeTab, setActiveTab] = useState("demographics");
  const [isLoading, setIsLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(!!patientId);
  const [vitalsId, setVitalsId] = useState<number | null>(null);

  // Form state
  const [demographics, setDemographics] = useState({ name: "", age: "", gender: "", weight: "", height: "", mrn: "" });
  const [clinicalHistory, setClinicalHistory] = useState({ diabetes_duration: "", htn_duration: "", diabetes_type: "", conditions: [] as string[], medical_history: "", family_history: "" });
  const [labs, setLabs] = useState({ hba1c: "", glucose: "", bp_systolic: "", bp_diastolic: "", creatinine: "" });
  const [functionalStatus, setFunctionalStatus] = useState({ frailty_score: "", mobility_assessment: "", adl_assessment: "", cognitive_status: "", social_support: "" });
  
  // Derived state
  const bmi = useMemo(() => {
    const weight = parseFloat(demographics.weight);
    const height = parseFloat(demographics.height);
    if (weight > 0 && height > 0) return (weight / ((height / 100) ** 2));
    return null;
  }, [demographics.weight, demographics.height]);

  const egfr = useMemo(() => {
    return calculateEgfr(parseFloat(labs.creatinine), parseInt(demographics.age), demographics.gender);
  }, [labs.creatinine, demographics.age, demographics.gender]);

  // Risk analysis state
  const [riskScores, setRiskScores] = useState<RiskScore[]>([]);

  // --- Data Loading ---
  useEffect(() => {
    const loadPatientDataForEdit = async () => {
      if (!patientId) return;
      setIsLoading(true);
      const { data: patient, error: patientError } = await supabase.from('patients').select('*').eq('id', patientId).single();
      if (patientError) { toast({ title: "Error Loading Patient", variant: "destructive" }); navigate('/patient-data'); return; }
      
      const { data: vitals } = await supabase.from('vitals').select('*').eq('patient_id', patientId).single();

      setDemographics({ name: patient.name || '', age: String(patient.age || ''), gender: patient.gender || '', weight: String(patient.weight || ''), height: String(patient.height || ''), mrn: patient.mrn });
      setClinicalHistory({ diabetes_duration: String(patient.diabetes_duration || ''), htn_duration: String(patient.htn_duration || ''), diabetes_type: patient.diabetes_type || '', conditions: patient.conditions || [], medical_history: patient.medical_history || '', family_history: patient.family_history || '' });
      setFunctionalStatus({ 
        frailty_score: String(patient.frailty_score || ''),
        mobility_assessment: patient.mobility_assessment || '',
        adl_assessment: patient.adl_assessment || '',
        cognitive_status: patient.cognitive_status || '',
        social_support: patient.social_support || ''
      });
      if (vitals) {
          setVitalsId(vitals.id);
          const [systolic, diastolic] = vitals.bp?.replace(/\\s*mmHg/g, '').split('/') || ['', ''];
          setLabs({ hba1c: String(vitals.hba1c || ''), glucose: String(vitals.glucose || ''), bp_systolic: systolic, bp_diastolic: diastolic, creatinine: String(vitals.creatinine || '') });
      }
      setIsLoading(false);
    };

    if (patientId) {
      loadPatientDataForEdit();
    } else {
      setIsEditMode(false);
      setDemographics(prev => ({ ...prev, mrn: `MRN${Math.floor(100000 + Math.random() * 900000)}`}));
    }
  }, [patientId, navigate, toast]);
  
  // --- Real-time Risk Calculation ---
  useEffect(() => {
    const age = parseInt(demographics.age) || 0;
    const hba1c = parseFloat(labs.hba1c) || 0;
    const systolicBp = parseInt(labs.bp_systolic) || 0;
    const frailtyScore = parseInt(functionalStatus.frailty_score);

    const isHighFrailty = frailtyScore >= 4;
    const isModerateFrailty = frailtyScore >= 2 && frailtyScore <= 3;
    const currentBmi = bmi || 0;
    const currentEgfr = egfr || 120; // Default to a high eGFR if not calculable

    // 1. Hypoglycemia
    let hypoglycemia: RiskScore = { label: "Hypoglycemia", icon: Droplets, level: 'none', rationale: "No specific risk factors identified." };
    if (hba1c > 9.0 && (age >= 80 || isHighFrailty)) {
      hypoglycemia = { ...hypoglycemia, level: 'high', rationale: "Highest Risk: HbA1c > 9.0% in a patient who is highly frail or aged 80+." };
    } else if (hba1c > 8.5 && (age >= 75 || isModerateFrailty)) {
      hypoglycemia = { ...hypoglycemia, level: 'medium', rationale: "Moderate Risk: HbA1c > 8.5% in a patient who is moderately frail or aged 75+." };
    } else if (currentEgfr < 45) {
      hypoglycemia = { ...hypoglycemia, level: 'medium', rationale: "Renal Risk: eGFR is below 45, increasing risk from reduced drug clearance." };
    }

    // 2. Uncontrolled HTN
    let htn: RiskScore = { label: "Uncontrolled HTN", icon: Zap, level: 'none', rationale: "No specific risk factors identified." };
    if (systolicBp >= 160 && currentEgfr < 60) {
      htn = { ...htn, level: 'high', rationale: "Highest Risk: Stage 2 hypertension (SBP ≥160) with co-existing chronic kidney disease (eGFR < 60)." };
    } else if (systolicBp > 140 && age >= 75) {
      htn = { ...htn, level: 'medium', rationale: "Geriatric Target Failure: SBP > 140 in a patient aged 75+, failing to meet elderly-specific targets." };
    } else if (currentBmi > 35) {
      htn = { ...htn, level: 'medium', rationale: "Comorbidity Risk: Morbid obesity (BMI > 35) is a predictor of resistant hypertension." };
    }

    // 3. CV Event Risk
    let cvRisk: RiskScore = { label: "CV Event Risk", icon: Heart, level: 'none', rationale: "No specific risk factors identified." };
    if (hba1c > 8.0 && currentBmi > 35) {
      cvRisk = { ...cvRisk, level: 'high', rationale: "Highest Risk Combo: Poorly controlled diabetes (HbA1c > 8.0%) combined with morbid obesity (BMI > 35)." };
    } else if (currentEgfr >= 30 && currentEgfr < 60) {
      cvRisk = { ...cvRisk, level: 'medium', rationale: "CKD Contribution: Moderate chronic kidney disease is an independent, strong risk factor for cardiovascular events." };
    }

    // 4. Medication Adverse Events
    let medRisk: RiskScore = { label: "Medication Adverse Events", icon: Pill, level: 'none', rationale: "No specific risk factors identified." };
    if (isHighFrailty && currentEgfr < 60) {
      medRisk = { ...medRisk, level: 'high', rationale: "Highest Risk Combo: High frailty combined with reduced kidney function (eGFR < 60) impairs drug metabolism." };
    } else if (isHighFrailty) {
      medRisk = { ...medRisk, level: 'medium', rationale: "High Frailty: Patient has increased sensitivity to side effects and reduced physiological reserve." };
    }
    
    setRiskScores([hypoglycemia, htn, cvRisk, medRisk]);

  }, [demographics, clinicalHistory, labs, functionalStatus, bmi, egfr]);


  // --- Event Handlers ---
  const handleInputChange = (setter: Function, field: string, value: any) => {
    setter((prev: any) => ({ ...prev, [field]: value }));
  };
  
  const handleConditionToggle = (condition: string) => {
    const newConditions = clinicalHistory.conditions.includes(condition)
      ? clinicalHistory.conditions.filter(c => c !== condition)
      : [...clinicalHistory.conditions, condition];
    setClinicalHistory(prev => ({ ...prev, conditions: newConditions }));
  };

  const handleSaveData = async () => {
    setIsLoading(true);
    const patientPayload = {
      name: demographics.name,
      age: Number(demographics.age) || null,
      gender: demographics.gender,
      mrn: demographics.mrn,
      weight: Number(demographics.weight) || null,
      height: Number(demographics.height) || null,
      diabetes_type: clinicalHistory.diabetes_type,
      diabetes_duration: Number(clinicalHistory.diabetes_duration) || null,
      htn_duration: Number(clinicalHistory.htn_duration) || null,
      conditions: clinicalHistory.conditions,
      medical_history: clinicalHistory.medical_history,
      family_history: clinicalHistory.family_history,
      frailty_score: Number(functionalStatus.frailty_score) || null,
      mobility_assessment: functionalStatus.mobility_assessment,
      adl_assessment: functionalStatus.adl_assessment,
      cognitive_status: functionalStatus.cognitive_status,
      social_support: functionalStatus.social_support,
      last_visit: new Date().toISOString(),
    };
    const vitalsPayload = {
      bp: `${labs.bp_systolic || 'N/A'}/${labs.bp_diastolic || 'N/A'} mmHg`,
      glucose: Number(labs.glucose) || null,
      hba1c: Number(labs.hba1c) || null,
      creatinine: Number(labs.creatinine) || null,
      bmi: bmi,
      egfr: egfr,
    };

    try {
      let currentPatientId = patientId;
      if (isEditMode) {
        const { error: patientError } = await supabase.from('patients').update(patientPayload).eq('id', patientId);
        if (patientError) throw patientError;
        
        if (vitalsId) {
          await supabase.from('vitals').update({ ...vitalsPayload, patient_id: currentPatientId }).eq('id', vitalsId);
        } else {
          await supabase.from('vitals').insert({ ...vitalsPayload, patient_id: currentPatientId });
        }
      } else {
        const { data: newPatient, error: patientError } = await supabase.from('patients').insert(patientPayload).select().single();
        if (patientError) throw patientError;
        currentPatientId = newPatient.id;
        await supabase.from('vitals').insert({ ...vitalsPayload, patient_id: currentPatientId });
      }

      toast({ title: isEditMode ? "Patient Updated" : "Patient Created", description: `Data for ${demographics.name} has been saved.` });
      navigate(`/patient-profile/${currentPatientId}`);
    } catch (error: any) {
      console.error("Save Error:", error);
      toast({ title: "Save Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  // --- Render Configuration ---
  const tabs = [
    { id: "demographics", label: "Demographics", icon: User },
    { id: "clinical", label: "Clinical History", icon: Heart },
    { id: "labs", label: "Lab Results", icon: Activity },
    { id: "functional", label: "Functional Status", icon: FileText },
    { id: "risk", label: "Risk Analysis", icon: TrendingUp }
  ];

  const commonConditions = ["Hypertension", "Metabolic Syndrome", "Chronic Kidney Disease", "Coronary Artery Disease"];

  return (
    <DashboardLayout>
      <div className="space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">{isEditMode ? "Edit Patient Data" : "Patient Data Entry"}</h1>
            <p className="text-sm md:text-base text-muted-foreground">{isEditMode ? `Updating profile for ${demographics.name}` : "Enter patient information for AI-powered risk analysis"}</p>
          </div>
          <Button onClick={handleSaveData} disabled={isLoading} className="flex items-center justify-center space-x-2 bg-gradient-medical w-full sm:w-auto">
            {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Saving...</span></> : <><Save className="w-4 h-4" /><span>{isEditMode ? "Update Patient" : "Save Patient"}</span></>}\
          </Button>
        </div>

        {isLoading && !isEditMode ? (
          <div className="flex items-center justify-center p-10"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : (
        <>
          <Card className="p-1 shadow-card overflow-x-auto"><div className="flex space-x-1 min-w-max">{tabs.map((tab) => (<button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center space-x-2 px-3 md:px-4 py-2 md:py-3 rounded-lg text-xs md:text-sm font-medium transition-colors whitespace-nowrap ${activeTab === tab.id ? "bg-primary text-primary-foreground shadow-medical" : "text-muted-foreground hover:text-foreground hover:bg-accent"}`}><tab.icon className="w-3 h-3 md:w-4 md:h-4" /><span>{tab.label}</span></button>))}</div></Card>

          {activeTab === "demographics" && (
            <Card className="p-4 md:p-6 shadow-card">
              <h3 className="text-lg font-semibold mb-4">Patient Demographics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2"><Label>Full Name *</Label><Input value={demographics.name} onChange={(e) => handleInputChange(setDemographics, "name", e.target.value)} /></div>
                <div className="space-y-2"><Label>Age *</Label><Input type="number" value={demographics.age} onChange={(e) => handleInputChange(setDemographics, "age", e.target.value)} /></div>
                <div className="space-y-2"><Label>Gender</Label><Select value={demographics.gender} onValueChange={(v) => handleInputChange(setDemographics, "gender", v)}><SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger><SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem></SelectContent></Select></div>
                <div className="space-y-2"><Label>Weight (kg)</Label><Input type="number" value={demographics.weight} onChange={(e) => handleInputChange(setDemographics, "weight", e.target.value)} /></div>
                <div className="space-y-2"><Label>Height (cm)</Label><Input type="number" value={demographics.height} onChange={(e) => handleInputChange(setDemographics, "height", e.target.value)} /></div>
                <div className="space-y-2"><Label>BMI</Label><Input value={bmi ? bmi.toFixed(2) : 'N/A'} readOnly className="bg-muted/50"/></div>
              </div>
            </Card>
          )}
          
          {activeTab === "clinical" && (
            <Card className="p-4 md:p-6 shadow-card">
              <h3 className="text-lg font-semibold mb-4">Clinical History</h3>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2"><Label>Hypertension Duration (years)</Label><Input type="number" value={clinicalHistory.htn_duration} onChange={(e) => handleInputChange(setClinicalHistory, "htn_duration", e.target.value)} /></div>
                  <div className="space-y-2"><Label>Diabetes Duration (years)</Label><Input type="number" value={clinicalHistory.diabetes_duration} onChange={(e) => handleInputChange(setClinicalHistory, "diabetes_duration", e.target.value)} /></div>
                  <div className="space-y-2"><Label>Diabetes Type</Label><Select value={clinicalHistory.diabetes_type} onValueChange={(v) => handleInputChange(setClinicalHistory, "diabetes_type", v)}><SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger><SelectContent><SelectItem value="Type 1">Type 1</SelectItem><SelectItem value="Type 2">Type 2</SelectItem><SelectItem value="Gestational">Gestational</SelectItem><SelectItem value="None">None</SelectItem></SelectContent></Select></div>
                </div>
                <div className="space-y-2">
                  <Label>Comorbidities</Label>
                  <div className="flex flex-wrap gap-2">{commonConditions.map(condition => (<Button key={condition} variant={clinicalHistory.conditions.includes(condition) ? "default": "outline"} onClick={() => handleConditionToggle(condition)} className="text-xs">{condition}</Button>))}</div>
                </div>
                <div className="space-y-2"><Label>Detailed Medical History</Label><Textarea className="min-h-28" placeholder="Previous hospitalizations, surgeries, etc." value={clinicalHistory.medical_history} onChange={(e) => handleInputChange(setClinicalHistory, "medical_history", e.target.value)} /></div>
                <div className="space-y-2"><Label>Family History</Label><Textarea className="min-h-24" placeholder="Relevant family medical history" value={clinicalHistory.family_history} onChange={(e) => handleInputChange(setClinicalHistory, "family_history", e.target.value)} /></div>
              </div>
            </Card>
          )}

          {activeTab === "labs" && (
            <Card className="p-4 md:p-6 shadow-card">
              <h3 className="text-lg font-semibold mb-4">Clinical Labs & Vitals</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2"><Label>Systolic BP (mmHg)</Label><Input type="number" value={labs.bp_systolic} onChange={(e) => handleInputChange(setLabs, "bp_systolic", e.target.value)} /></div>
                <div className="space-y-2"><Label>Diastolic BP (mmHg)</Label><Input type="number" value={labs.bp_diastolic} onChange={(e) => handleInputChange(setLabs, "bp_diastolic", e.target.value)} /></div>
                <div className="space-y-2"><Label>Fasting Glucose (mg/dL)</Label><Input type="number" value={labs.glucose} onChange={(e) => handleInputChange(setLabs, "glucose", e.target.value)} /></div>
                <div className="space-y-2"><Label>HbA1c (%)</Label><Input type="number" step="0.1" value={labs.hba1c} onChange={(e) => handleInputChange(setLabs, "hba1c", e.target.value)} /></div>
                <div className="space-y-2"><Label>Creatinine (mg/dL)</Label><Input type="number" step="0.01" value={labs.creatinine} onChange={(e) => handleInputChange(setLabs, "creatinine", e.target.value)} /></div>
                <div className="space-y-2"><Label>eGFR</Label><Input value={egfr ? `${egfr} ml/min/1.73m²` : 'N/A'} readOnly className="bg-muted/50"/></div>
              </div>
            </Card>
          )}

          {activeTab === "functional" && (
             <Card className="p-4 md:p-6 shadow-card">
                <h3 className="text-lg font-semibold mb-4">Functional Status Assessment</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label>Frailty Score (0-5)</Label>
                        <Input type="number" min="0" max="5" value={functionalStatus.frailty_score} onChange={(e) => handleInputChange(setFunctionalStatus, "frailty_score", e.target.value)} />
                        <p className="text-xs text-muted-foreground pt-1">0-1: Not Frail, 2-3: Moderately Frail, 4-5: Highly Frail</p>
                    </div>
                    <div className="space-y-2">
                        <Label>Mobility Assessment</Label>
                        <Select value={functionalStatus.mobility_assessment} onValueChange={(v) => handleInputChange(setFunctionalStatus, "mobility_assessment", v)}><SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger><SelectContent><SelectItem value="independent">Independent</SelectItem><SelectItem value="requires_assistance">Requires Assistance</SelectItem><SelectItem value="immobile">Immobile</SelectItem></SelectContent></Select>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <Label>Activities of Daily Living (ADL) Assessment</Label>
                        <Textarea placeholder="Describe patient's ability to perform daily activities..." value={functionalStatus.adl_assessment} onChange={(e) => handleInputChange(setFunctionalStatus, "adl_assessment", e.target.value)} />
                    </div>
                     <div className="space-y-2">
                        <Label>Cognitive Status</Label>
                        <Select value={functionalStatus.cognitive_status} onValueChange={(v) => handleInputChange(setFunctionalStatus, "cognitive_status", v)}><SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger><SelectContent><SelectItem value="normal">Normal</SelectItem><SelectItem value="mild_impairment">Mild Impairment</SelectItem><SelectItem value="severe_impairment">Severe Impairment</SelectItem></SelectContent></Select>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <Label>Social Support System</Label>
                        <Textarea placeholder="Describe patient's social support network..." value={functionalStatus.social_support} onChange={(e) => handleInputChange(setFunctionalStatus, "social_support", e.target.value)} />
                    </div>
                </div>
            </Card>
          )}

          {activeTab === "risk" && <RiskDisplayCard scores={riskScores} />}

        </>
        )}
      </div>
    </DashboardLayout>
  );
}
