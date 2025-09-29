// src/pages/NewPatient.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface MedicationInput {
  drug_name: string;
  dosage?: string;
  frequency?: string;
}

export default function NewPatient() {
  const navigate = useNavigate();
  const [age, setAge] = useState<number | "">("");
  const [gender, setGender] = useState<string>("");
  const [weight, setWeight] = useState<number | "">("");
  const [height, setHeight] = useState<number | "">("");
  const [bmi, setBmi] = useState<number | "">("");
  const [diabetesDuration, setDiabetesDuration] = useState<number | "">("");
  const [complications, setComplications] = useState<string>("");
  const [comorbidities, setComorbidities] = useState<string>("");

  const [hba1c, setHba1c] = useState<number | "">("");
  const [glucose, setGlucose] = useState<number | "">("");
  const [lipids, setLipids] = useState<string>("");
  const [kidneyFunction, setKidneyFunction] = useState<string>("");

  const [frailtyAssessment, setFrailtyAssessment] = useState<string>("");
  const [adlIndependence, setAdlIndependence] = useState<string>("");

  const [medications, setMedications] = useState<MedicationInput[]>([
    { drug_name: "", dosage: "", frequency: "" },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // API base: works with CRA proxy or explicit URL
  const API_BASE = (import.meta.env?.VITE_API_BASE as string) || (process.env.REACT_APP_API_BASE as string) || "";

  function updateMed(index: number, key: keyof MedicationInput, value: string) {
    setMedications((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [key]: value };
      return copy;
    });
  }

  function addMed() {
    setMedications((prev) => [...prev, { drug_name: "", dosage: "", frequency: "" }]);
  }
  function removeMed(i: number) {
    setMedications((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Basic client validation
    if (age === "" || gender.trim() === "" || weight === "" || height === "" || bmi === "") {
      setError("Please fill required fields: age, gender, weight, height, and bmi.");
      return;
    }

    const payload = {
      age: Number(age),
      gender,
      weight: Number(weight),
      height: Number(height),
      bmi: Number(bmi),
      diabetes_duration: diabetesDuration === "" ? null : Number(diabetesDuration),
      complications: complications || null,
      comorbidities: comorbidities || null,
      medications: medications
        .filter((m) => m.drug_name && m.drug_name.trim().length > 0)
        .map((m) => ({ drug_name: m.drug_name, dosage: m.dosage || null, frequency: m.frequency || null })),
      hba1c: hba1c === "" ? null : Number(hba1c),
      glucose: glucose === "" ? null : Number(glucose),
      lipids: lipids || null,
      kidney_function: kidneyFunction || null,
      frailty_assessment: frailtyAssessment || null,
      adl_independence: adlIndependence || null,
    };

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE || ""}/api/patients`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }

      const saved = await res.json();
      // Redirect to patient list or details
      alert(`Patient saved with id ${saved.id}`);
      navigate("/patients");
    } catch (err: any) {
      console.error("Error saving patient:", err);
      setError(err.message || "Failed to save patient");
    } finally {
      setLoading(false);
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">New Patient</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Patient Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <label>
                  Age *
                  <Input type="number" value={age} onChange={(e) => setAge(Number(e.target.value) || "")} />
                </label>
                <label>
                  Gender *
                  <Input value={gender} onChange={(e) => setGender(e.target.value)} />
                </label>

                <label>
                  Weight (kg) *
                  <Input type="number" value={weight} onChange={(e) => setWeight(Number(e.target.value) || "")} />
                </label>
                <label>
                  Height (m) *
                  <Input type="number" value={height} onChange={(e) => setHeight(Number(e.target.value) || "")} />
                </label>

                <label>
                  BMI *
                  <Input type="number" value={bmi} onChange={(e) => setBmi(Number(e.target.value) || "")} />
                </label>

                <label>
                  Diabetes duration (years)
                  <Input type="number" value={diabetesDuration} onChange={(e) => setDiabetesDuration(Number(e.target.value) || "")} />
                </label>
                <label>
                  Complications
                  <Input value={complications} onChange={(e) => setComplications(e.target.value)} />
                </label>

                <label>
                  Comorbidities
                  <Input value={comorbidities} onChange={(e) => setComorbidities(e.target.value)} />
                </label>
              </div>

              <div>
                <h4 className="font-semibold">Medications</h4>
                {medications.map((med, i) => (
                  <div key={i} className="grid grid-cols-4 gap-2 items-end mb-2">
                    <div>
                      <label>Drug*</label>
                      <Input value={med.drug_name} onChange={(e) => updateMed(i, "drug_name", e.target.value)} />
                    </div>
                    <div>
                      <label>Dosage</label>
                      <Input value={med.dosage} onChange={(e) => updateMed(i, "dosage", e.target.value)} />
                    </div>
                    <div>
                      <label>Frequency</label>
                      <Input value={med.frequency} onChange={(e) => updateMed(i, "frequency", e.target.value)} />
                    </div>
                    <div>
                      <Button type="button" onClick={() => removeMed(i)} variant="ghost">Remove</Button>
                    </div>
                  </div>
                ))}
                <Button type="button" onClick={addMed}>Add medication</Button>
              </div>

              <div>
                <h4 className="font-semibold">Labs</h4>
                <div className="grid grid-cols-3 gap-4">
                  <label>HbA1c<input className="w-full" type="number" step="0.1" value={hba1c} onChange={(e) => setHba1c(Number(e.target.value) || "")} /></label>
                  <label>Glucose<input className="w-full" type="number" value={glucose} onChange={(e) => setGlucose(Number(e.target.value) || "")} /></label>
                  <label>Lipids<input className="w-full" value={lipids} onChange={(e) => setLipids(e.target.value)} /></label>
                </div>
                <label>Kidney function<input className="w-full" value={kidneyFunction} onChange={(e) => setKidneyFunction(e.target.value)} /></label>
              </div>

              <div>
                <h4 className="font-semibold">Functional status</h4>
                <label>Frailty assessment<input className="w-full" value={frailtyAssessment} onChange={(e) => setFrailtyAssessment(e.target.value)} /></label>
                <label>ADL independence<input className="w-full" value={adlIndependence} onChange={(e) => setAdlIndependence(e.target.value)} /></label>
              </div>

              {error && <div className="text-red-600">{error}</div>}

              <div className="flex items-center space-x-2">
                <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save Patient"}</Button>
                <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
