
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Activity, 
  Users, 
  AlertTriangle, 
  TrendingUp,
  Heart,
  Droplets,
  Brain,
  Shield,
  Loader2
} from "lucide-react";

// --- TypeScript Interfaces ---
interface Patient {
  id: number;
  age: number;
  conditions: string[];
  diabetes_type: string | null;
}

interface Vital {
  patient_id: number;
  bp: string;
  glucose: number;
  ldl: number;
}

interface Medication {
  patient_id: number;
}

interface Alert {
  patientId: number;
  patientName: string;
  alert: string;
  severity: 'high' | 'medium' | 'low';
  time: string; // For simplicity, we'll use a static string
}

// --- Main Dashboard Component ---
export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [totalPatients, setTotalPatients] = useState(0);
  const [riskMetrics, setRiskMetrics] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [safetyScore, setSafetyScore] = useState(0);

  useEffect(() => {
    const fetchDataAndCalculateRisks = async () => {
      setLoading(true);

      // --- 1. Fetch All Necessary Data ---
      const { data: patients, error: patientsError } = await supabase.from('patients').select('id, age, conditions, diabetes_type');
      const { data: vitals, error: vitalsError } = await supabase.from('vitals').select('patient_id, bp, glucose, ldl, hba1c');
      const { data: medications, error: medicationsError } = await supabase.from('medications').select('patient_id');

      if (patientsError || vitalsError || medicationsError) {
        console.error('Error fetching data:', patientsError || vitalsError || medicationsError);
        setLoading(false);
        return;
      }

      setTotalPatients(patients.length);

      // --- 2. Process Data for Risk Calculation ---
      const patientVitalsMap = vitals.reduce((acc, v) => {
        if (!acc[v.patient_id]) acc[v.patient_id] = [];
        acc[v.patient_id].push(v);
        return acc;
      }, {} as { [key: number]: Vital[] });

      const patientMedicationsCount = medications.reduce((acc, m) => {
        acc[m.patient_id] = (acc[m.patient_id] || 0) + 1;
        return acc;
      }, {} as { [key: number]: number });

      // --- 3. Define and Calculate Risks ---
      let uncontrolledBpCount = 0;
      let polypharmacyCount = 0;
      let hypoglycemiaCount = 0;
      let cardioEventCount = 0;
      const generatedAlerts: Alert[] = [];

      patients.forEach(p => {
        const pVitals = patientVitalsMap[p.id]?.[0]; // Assuming one vital entry per patient for simplicity
        const medCount = patientMedicationsCount[p.id] || 0;

        // Uncontrolled BP: Systolic > 140
        if (pVitals?.bp && parseInt(pVitals.bp.split('/')[0]) > 140) {
          uncontrolledBpCount++;
          if (parseInt(pVitals.bp.split('/')[0]) > 160) {
            generatedAlerts.push({ patientId: p.id, patientName: `Patient #${p.id}`, alert: `Severe HTN detected: ${pVitals.bp}`, severity: 'high', time: 'Just now' });
          }
        }

        // Polypharmacy: 5 or more medications
        if (medCount >= 5) {
          polypharmacyCount++;
          if (medCount > 8) {
             generatedAlerts.push({ patientId: p.id, patientName: `Patient #${p.id}`, alert: `High medication burden (${medCount} drugs)`, severity: 'medium', time: 'Just now' });
          }
        }

        // Hypoglycemia: Diabetic and fasting glucose < 70
        if (p.diabetes_type && (pVitals?.glucose < 70 || pVitals?.hba1c > 9)) {
          hypoglycemiaCount++;
          if (pVitals?.glucose < 60) {
            generatedAlerts.push({ patientId: p.id, patientName: `Patient #${p.id}`, alert: `Low glucose detected: ${pVitals.glucose} mg/dL`, severity: 'high', time: 'Just now' });
          }
        }

        // Cardiovascular Event Risk: Age > 55 and (LDL > 130 or is diabetic)
        const hasHighLdl = pVitals?.ldl > 130;
        const hasDiabetes = !!p.diabetes_type;
        const isOlder = p.age > 65;

        if (isOlder && (hasHighLdl || hasDiabetes)) {
          cardioEventCount++;
          if (hasHighLdl && hasDiabetes) {
             generatedAlerts.push({ patientId: p.id, patientName: `Patient #${p.id}`, alert: `Multiple CV risk factors (DM, LDL > 130)`, severity: 'medium', time: 'Just now' });
          }
        }
      });

      // --- 4. Format Metrics for Display ---
      const createMetric = (label: string, count: number, total: number) => {
        const percentage = total > 0 ? ((count / total) * 100).toFixed(0) : 0;
        let level = 'low';
        if (parseInt(percentage as string) > 15) level = 'high';
        else if (parseInt(percentage as string) > 10) level = 'medium';
        
        return {
          label,
          value: `${percentage}%`,
          patients: count,
          level,
          trend: "N/A" // Trend data is not available
        };
      };

      const metrics = [
        createMetric("Cardiovascular Events", cardioEventCount, patients.length),
        createMetric("Hypoglycemia Risk", hypoglycemiaCount, patients.length),
        createMetric("Uncontrolled BP", uncontrolledBpCount, patients.length),
        createMetric("Polypharmacy Risk", polypharmacyCount, patients.length)
      ];
      setRiskMetrics(metrics);

      // --- 5. Set Derived UI State ---
      setAlerts(generatedAlerts.sort((a, b) => (a.severity === 'high' ? -1 : 1))); // High severity first

      const totalRiskPercentage = metrics.reduce((sum, m) => sum + parseFloat(m.value), 0);
      const averageRisk = totalRiskPercentage / (metrics.length || 1);
      setSafetyScore(Math.max(0, Math.round(100 - averageRisk)));

      setLoading(false);
    };

    fetchDataAndCalculateRisks();
  }, []);

  // --- Render Logic ---
  if (loading) {
    return <DashboardLayout><div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 animate-spin text-primary" /><p className="text-xl ml-4">Calculating Risks...</p></div></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Clinical Dashboard</h1>
          <p className="text-sm md:text-base text-muted-foreground">AI-powered insights for elderly diabetes care</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <Card className="p-6 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Patients</p>
                <p className="text-3xl font-bold text-foreground">{totalPatients}</p>
                <p className="text-sm text-clinical-teal">+12 this month</p>
              </div>
              <Users className="w-12 h-12 text-primary" />
            </div>
          </Card>

          <Card className="p-6 shadow-card">
             <div className="flex items-center justify-between">
               <div>
                 <p className="text-sm text-muted-foreground">High-Risk Alerts</p>
                 <p className="text-3xl font-bold text-foreground">{alerts.length}</p>
                 <p className={`text-sm ${alerts.length > 0 ? 'text-risk-high' : 'text-risk-low'}`}>{alerts.length > 0 ? "Requires attention" : "All clear"}</p>
               </div>
               <AlertTriangle className="w-12 h-12 text-risk-high" />
             </div>
           </Card>

          <Card className="p-6 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Safety Score</p>
                <p className="text-3xl font-bold text-foreground">92%</p>
                <p className="text-sm text-risk-low">Excellent</p>
              </div>
              <Shield className="w-12 h-12 text-risk-low" />
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          <div className="lg:col-span-2">
            <Card className="p-6 shadow-card">
              <h3 className="text-lg md:text-xl font-semibold mb-4 flex items-center">
                <TrendingUp className="w-4 h-4 md:w-5 md:h-5 mr-2 text-primary" />
                Risk Assessment Overview
              </h3>
              <div className="grid grid-cols-1 gap-4">
                {riskMetrics.map((metric, index) => (
                  <div key={index} className="p-4 rounded-lg border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">{metric.label}</h4>
                      <Badge 
                        variant={metric.level === 'high' ? 'destructive' : metric.level === 'medium' ? 'secondary' : 'default'}
                        className={`
                          ${metric.level === 'high' ? "bg-risk-high-bg text-risk-high" :
                           metric.level === 'medium' ? "bg-risk-medium-bg text-risk-medium" :
                           "bg-risk-low-bg text-risk-low"}
                        `}
                      >
                        {metric.level.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold">{metric.value}</span>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">{metric.trend}</p>
                        <p className="text-xs text-muted-foreground">{metric.patients} patients</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div>
            <Card className="p-4 md:p-6 shadow-card">
              <h3 className="text-lg md:text-xl font-semibold mb-4 flex items-center">
                <AlertTriangle className="w-4 h-4 md:w-5 md:h-5 mr-2 text-risk-high" />
                Recent Alerts
              </h3>
              <div className="space-y-4">
                {alerts.slice(0, 3).map((alert, index) => (
                  <div key={index} className="p-3 rounded-lg border border-border">
                    <div className="flex items-start justify-between mb-2">
                      <span className="font-medium text-sm">{alert.patientName}</span>
                      <Badge 
                        variant={alert.severity === 'high' ? 'destructive' : 'secondary'}
                        className={`
                          ${alert.severity === 'high' ? "bg-risk-high-bg text-risk-high" :
                          "bg-risk-medium-bg text-risk-medium"}
                        `}
                      >
                        {alert.severity.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{alert.alert}</p>
                    <p className="text-xs text-muted-foreground">{alert.time}</p>
                  </div>
                ))}
                {alerts.length === 0 && <p className="text-sm text-center text-muted-foreground py-4">No high-risk alerts found.</p>}
              </div>
              {alerts.length > 0 && (
                <Button className="w-full mt-4" variant="outline">View All Alerts</Button>
              )}
            </Card>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
