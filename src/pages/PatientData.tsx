import { useState } from "react";
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
  Calendar, 
  Activity, 
  Heart, 
  Pill, 
  FileText, 
  Save,
  Upload
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function PatientData() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("demographics");

  const handleSaveData = () => {
    toast({
      title: "Patient data saved",
      description: "Patient information has been successfully updated.",
    });
  };

  const tabs = [
    { id: "demographics", label: "Demographics", icon: User },
    { id: "clinical", label: "Clinical History", icon: Heart },
    { id: "medications", label: "Medications", icon: Pill },
    { id: "labs", label: "Lab Results", icon: Activity },
    { id: "functional", label: "Functional Status", icon: FileText },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Patient Data Entry</h1>
            <p className="text-muted-foreground">Comprehensive patient information for AI analysis</p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" className="flex items-center space-x-2">
              <Upload className="w-4 h-4" />
              <span>Import from EHR</span>
            </Button>
            <Button onClick={handleSaveData} className="flex items-center space-x-2 bg-gradient-medical">
              <Save className="w-4 h-4" />
              <span>Save Data</span>
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <Card className="p-1 shadow-card">
          <div className="flex space-x-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground shadow-medical"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </Card>

        {/* Demographics Tab */}
        {activeTab === "demographics" && (
          <Card className="p-6 shadow-card">
            <h3 className="text-xl font-semibold mb-6 flex items-center">
              <User className="w-5 h-5 mr-2 text-primary" />
              Patient Demographics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="Enter patient name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input id="age" type="number" placeholder="Enter age" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input id="weight" type="number" placeholder="Enter weight" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">Height (cm)</Label>
                <Input id="height" type="number" placeholder="Enter height" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bmi">BMI</Label>
                <Input id="bmi" placeholder="Calculated automatically" readOnly />
              </div>
            </div>
          </Card>
        )}

        {/* Clinical History Tab */}
        {activeTab === "clinical" && (
          <Card className="p-6 shadow-card">
            <h3 className="text-xl font-semibold mb-6 flex items-center">
              <Heart className="w-5 h-5 mr-2 text-primary" />
              Clinical History
            </h3>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="diabetes-duration">Diabetes Duration (years)</Label>
                  <Input id="diabetes-duration" type="number" placeholder="Enter duration" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="diabetes-type">Diabetes Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="type1">Type 1</SelectItem>
                      <SelectItem value="type2">Type 2</SelectItem>
                      <SelectItem value="gestational">Gestational</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Comorbidities</Label>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="bg-clinical-teal-light text-clinical-teal">Hypertension</Badge>
                  <Badge variant="secondary" className="bg-clinical-teal-light text-clinical-teal">Metabolic Syndrome</Badge>
                  <Badge variant="outline">+ Add Condition</Badge>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="medical-history">Detailed Medical History</Label>
                <Textarea 
                  id="medical-history" 
                  placeholder="Enter detailed medical history, previous hospitalizations, surgeries, etc."
                  className="min-h-32"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="family-history">Family History</Label>
                <Textarea 
                  id="family-history" 
                  placeholder="Enter relevant family medical history"
                  className="min-h-24"
                />
              </div>
            </div>
          </Card>
        )}

        {/* Medications Tab */}
        {activeTab === "medications" && (
          <Card className="p-6 shadow-card">
            <h3 className="text-xl font-semibold mb-6 flex items-center">
              <Pill className="w-5 h-5 mr-2 text-primary" />
              Current Medications
            </h3>
            <div className="space-y-4">
              {[
                { name: "Metformin", dose: "1000mg", frequency: "Twice daily", indication: "Diabetes" },
                { name: "Lisinopril", dose: "10mg", frequency: "Once daily", indication: "Hypertension" },
                { name: "Atorvastatin", dose: "20mg", frequency: "Once daily", indication: "Cholesterol" },
              ].map((med, index) => (
                <div key={index} className="p-4 border border-border rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">Medication</Label>
                      <p className="font-medium">{med.name}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Dose</Label>
                      <p className="font-medium">{med.dose}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Frequency</Label>
                      <p className="font-medium">{med.frequency}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Indication</Label>
                      <Badge variant="secondary" className="bg-clinical-teal-light text-clinical-teal">
                        {med.indication}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full">
                + Add New Medication
              </Button>
            </div>
          </Card>
        )}

        {/* Lab Results Tab */}
        {activeTab === "labs" && (
          <Card className="p-6 shadow-card">
            <h3 className="text-xl font-semibold mb-6 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-primary" />
              Laboratory Results
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="hba1c">HbA1c (%)</Label>
                <Input id="hba1c" type="number" step="0.1" placeholder="7.2" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="glucose">Fasting Glucose (mg/dL)</Label>
                <Input id="glucose" type="number" placeholder="120" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bp-systolic">Systolic BP (mmHg)</Label>
                <Input id="bp-systolic" type="number" placeholder="140" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bp-diastolic">Diastolic BP (mmHg)</Label>
                <Input id="bp-diastolic" type="number" placeholder="90" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cholesterol">Total Cholesterol (mg/dL)</Label>
                <Input id="cholesterol" type="number" placeholder="200" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ldl">LDL Cholesterol (mg/dL)</Label>
                <Input id="ldl" type="number" placeholder="120" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hdl">HDL Cholesterol (mg/dL)</Label>
                <Input id="hdl" type="number" placeholder="45" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="triglycerides">Triglycerides (mg/dL)</Label>
                <Input id="triglycerides" type="number" placeholder="150" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="creatinine">Creatinine (mg/dL)</Label>
                <Input id="creatinine" type="number" step="0.1" placeholder="1.0" />
              </div>
            </div>
          </Card>
        )}

        {/* Functional Status Tab */}
        {activeTab === "functional" && (
          <Card className="p-6 shadow-card">
            <h3 className="text-xl font-semibold mb-6 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-primary" />
              Functional Status Assessment
            </h3>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="frailty-score">Frailty Score (0-5)</Label>
                  <Input id="frailty-score" type="number" min="0" max="5" placeholder="2" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mobility">Mobility Assessment</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select mobility level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="independent">Independent</SelectItem>
                      <SelectItem value="assisted">Requires Assistance</SelectItem>
                      <SelectItem value="dependent">Dependent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="adl-assessment">Activities of Daily Living (ADL) Assessment</Label>
                <Textarea 
                  id="adl-assessment" 
                  placeholder="Describe patient's ability to perform daily activities (bathing, dressing, eating, etc.)"
                  className="min-h-32"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cognitive-status">Cognitive Status</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select cognitive status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="mild-impairment">Mild Cognitive Impairment</SelectItem>
                    <SelectItem value="moderate-impairment">Moderate Impairment</SelectItem>
                    <SelectItem value="severe-impairment">Severe Impairment</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="social-support">Social Support System</Label>
                <Textarea 
                  id="social-support" 
                  placeholder="Describe patient's social support network, caregivers, living situation"
                  className="min-h-24"
                />
              </div>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}