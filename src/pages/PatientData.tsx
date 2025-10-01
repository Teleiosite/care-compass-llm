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
  Upload,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

export default function PatientData() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("demographics");
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    weight: "",
    height: "",
    hba1c: "",
    glucose: "",
    bpSystolic: "",
    bpDiastolic: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSaveData = async () => {
    try {
      setIsLoading(true);
      setErrors({});

      // Basic validation
      const validationErrors: Record<string, string> = {};
      
      if (activeTab === "demographics") {
        if (!formData.name || formData.name.length < 2) {
          validationErrors.name = "Name must be at least 2 characters";
        }
        if (formData.age && (Number(formData.age) < 60 || Number(formData.age) > 120)) {
          validationErrors.age = "Age must be between 60 and 120";
        }
      }

      if (activeTab === "labs") {
        if (formData.hba1c && (Number(formData.hba1c) < 3 || Number(formData.hba1c) > 20)) {
          validationErrors.hba1c = "HbA1c must be between 3% and 20%";
        }
        if (formData.glucose && (Number(formData.glucose) < 40 || Number(formData.glucose) > 600)) {
          validationErrors.glucose = "Glucose must be between 40 and 600 mg/dL";
        }
      }

      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        toast({
          title: "Validation Error",
          description: "Please correct the errors in the form.",
          variant: "destructive",
        });
        return;
      }

      // Simulate save
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Patient data saved",
        description: "Patient information has been successfully updated.",
      });
    } catch (error) {
      toast({
        title: "Error saving data",
        description: "An error occurred while saving. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
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
      <div className="space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Patient Data Entry</h1>
            <p className="text-sm md:text-base text-muted-foreground">Comprehensive patient information for AI analysis</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button variant="outline" className="flex items-center justify-center space-x-2 w-full sm:w-auto">
              <Upload className="w-4 h-4" />
              <span>Import from EHR</span>
            </Button>
            <Button 
              onClick={handleSaveData} 
              disabled={isLoading}
              className="flex items-center justify-center space-x-2 bg-gradient-medical w-full sm:w-auto"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Data</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <Card className="p-1 shadow-card overflow-x-auto">
          <div className="flex space-x-1 min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3 md:px-4 py-2 md:py-3 rounded-lg text-xs md:text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground shadow-medical"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
              >
                <tab.icon className="w-3 h-3 md:w-4 md:h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </Card>

        {/* Demographics Tab */}
        {activeTab === "demographics" && (
          <Card className="p-4 md:p-6 shadow-card">
            <h3 className="text-lg md:text-xl font-semibold mb-4 md:mb-6 flex items-center">
              <User className="w-4 h-4 md:w-5 md:h-5 mr-2 text-primary" />
              Patient Demographics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input 
                  id="name" 
                  placeholder="Enter patient name" 
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className={errors.name ? "border-destructive" : ""}
                />
                {errors.name && (
                  <p className="text-xs text-destructive">{errors.name}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">Age *</Label>
                <Input 
                  id="age" 
                  type="number" 
                  placeholder="Enter age" 
                  value={formData.age}
                  onChange={(e) => handleInputChange("age", e.target.value)}
                  className={errors.age ? "border-destructive" : ""}
                />
                {errors.age && (
                  <p className="text-xs text-destructive">{errors.age}</p>
                )}
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
                <Label htmlFor="weight">Weight (kg) *</Label>
                <Input 
                  id="weight" 
                  type="number" 
                  placeholder="Enter weight" 
                  value={formData.weight}
                  onChange={(e) => handleInputChange("weight", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">Height (cm) *</Label>
                <Input 
                  id="height" 
                  type="number" 
                  placeholder="Enter height" 
                  value={formData.height}
                  onChange={(e) => handleInputChange("height", e.target.value)}
                />
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
          <Card className="p-4 md:p-6 shadow-card">
            <h3 className="text-lg md:text-xl font-semibold mb-4 md:mb-6 flex items-center">
              <Heart className="w-4 h-4 md:w-5 md:h-5 mr-2 text-primary" />
              Clinical History
            </h3>
            <div className="space-y-4 md:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
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
          <Card className="p-4 md:p-6 shadow-card">
            <h3 className="text-lg md:text-xl font-semibold mb-4 md:mb-6 flex items-center">
              <Pill className="w-4 h-4 md:w-5 md:h-5 mr-2 text-primary" />
              Current Medications
            </h3>
            <div className="space-y-4">
              {[
                { name: "Metformin", dose: "1000mg", frequency: "Twice daily", indication: "Diabetes" },
                { name: "Lisinopril", dose: "10mg", frequency: "Once daily", indication: "Hypertension" },
                { name: "Atorvastatin", dose: "20mg", frequency: "Once daily", indication: "Cholesterol" },
              ].map((med, index) => (
                <div key={index} className="p-3 md:p-4 border border-border rounded-lg">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
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
          <Card className="p-4 md:p-6 shadow-card">
            <h3 className="text-lg md:text-xl font-semibold mb-4 md:mb-6 flex items-center">
              <Activity className="w-4 h-4 md:w-5 md:h-5 mr-2 text-primary" />
              Laboratory Results
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              <div className="space-y-2">
                <Label htmlFor="hba1c">HbA1c (%) *</Label>
                <Input 
                  id="hba1c" 
                  type="number" 
                  step="0.1" 
                  placeholder="7.2" 
                  value={formData.hba1c}
                  onChange={(e) => handleInputChange("hba1c", e.target.value)}
                  className={errors.hba1c ? "border-destructive" : ""}
                />
                {errors.hba1c && (
                  <p className="text-xs text-destructive">{errors.hba1c}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="glucose">Fasting Glucose (mg/dL) *</Label>
                <Input 
                  id="glucose" 
                  type="number" 
                  placeholder="120" 
                  value={formData.glucose}
                  onChange={(e) => handleInputChange("glucose", e.target.value)}
                  className={errors.glucose ? "border-destructive" : ""}
                />
                {errors.glucose && (
                  <p className="text-xs text-destructive">{errors.glucose}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="bp-systolic">Systolic BP (mmHg) *</Label>
                <Input 
                  id="bp-systolic" 
                  type="number" 
                  placeholder="140" 
                  value={formData.bpSystolic}
                  onChange={(e) => handleInputChange("bpSystolic", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bp-diastolic">Diastolic BP (mmHg) *</Label>
                <Input 
                  id="bp-diastolic" 
                  type="number" 
                  placeholder="90" 
                  value={formData.bpDiastolic}
                  onChange={(e) => handleInputChange("bpDiastolic", e.target.value)}
                />
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
          <Card className="p-4 md:p-6 shadow-card">
            <h3 className="text-lg md:text-xl font-semibold mb-4 md:mb-6 flex items-center">
              <FileText className="w-4 h-4 md:w-5 md:h-5 mr-2 text-primary" />
              Functional Status Assessment
            </h3>
            <div className="space-y-4 md:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
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