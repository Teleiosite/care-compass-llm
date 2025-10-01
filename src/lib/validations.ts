import { z } from "zod";

// Patient Demographics Schema
export const demographicsSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name must be less than 100 characters"),
  age: z.number().min(60, "Age must be at least 60").max(120, "Age must be less than 120"),
  gender: z.enum(["male", "female", "other"], {
    required_error: "Please select a gender",
  }),
  weight: z.number().min(30, "Weight must be at least 30 kg").max(300, "Weight must be less than 300 kg"),
  height: z.number().min(100, "Height must be at least 100 cm").max(250, "Height must be less than 250 cm"),
  bmi: z.number().optional(),
});

// Clinical History Schema
export const clinicalHistorySchema = z.object({
  diabetesDuration: z.number().min(0, "Duration cannot be negative").max(100, "Duration must be less than 100 years"),
  diabetesType: z.enum(["type1", "type2", "gestational"], {
    required_error: "Please select diabetes type",
  }),
  medicalHistory: z.string().max(2000, "Medical history must be less than 2000 characters"),
  familyHistory: z.string().max(1000, "Family history must be less than 1000 characters").optional(),
});

// Lab Results Schema
export const labResultsSchema = z.object({
  hba1c: z.number().min(3, "HbA1c must be at least 3%").max(20, "HbA1c must be less than 20%"),
  glucose: z.number().min(40, "Glucose must be at least 40 mg/dL").max(600, "Glucose must be less than 600 mg/dL"),
  bpSystolic: z.number().min(70, "Systolic BP must be at least 70 mmHg").max(250, "Systolic BP must be less than 250 mmHg"),
  bpDiastolic: z.number().min(40, "Diastolic BP must be at least 40 mmHg").max(150, "Diastolic BP must be less than 150 mmHg"),
  cholesterol: z.number().min(50, "Cholesterol must be at least 50 mg/dL").max(500, "Cholesterol must be less than 500 mg/dL").optional(),
  ldl: z.number().min(20, "LDL must be at least 20 mg/dL").max(400, "LDL must be less than 400 mg/dL").optional(),
  hdl: z.number().min(10, "HDL must be at least 10 mg/dL").max(150, "HDL must be less than 150 mg/dL").optional(),
  triglycerides: z.number().min(30, "Triglycerides must be at least 30 mg/dL").max(1000, "Triglycerides must be less than 1000 mg/dL").optional(),
  creatinine: z.number().min(0.2, "Creatinine must be at least 0.2 mg/dL").max(15, "Creatinine must be less than 15 mg/dL").optional(),
});

// Functional Status Schema
export const functionalStatusSchema = z.object({
  frailtyScore: z.number().min(0, "Frailty score must be at least 0").max(5, "Frailty score must be at most 5"),
  mobility: z.enum(["independent", "assisted", "dependent"], {
    required_error: "Please select mobility level",
  }),
  adlAssessment: z.string().max(1000, "ADL assessment must be less than 1000 characters").optional(),
  cognitiveStatus: z.enum(["normal", "mild-impairment", "moderate-impairment", "severe-impairment"], {
    required_error: "Please select cognitive status",
  }),
  socialSupport: z.string().max(500, "Social support description must be less than 500 characters").optional(),
});

export type DemographicsFormData = z.infer<typeof demographicsSchema>;
export type ClinicalHistoryFormData = z.infer<typeof clinicalHistorySchema>;
export type LabResultsFormData = z.infer<typeof labResultsSchema>;
export type FunctionalStatusFormData = z.infer<typeof functionalStatusSchema>;
