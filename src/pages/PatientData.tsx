import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";

// Define the Patient interface
interface Patient {
  id: number;
  age: number;
  gender: string;
  bmi: number;
}

export default function PatientData() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Use environment var or fallback to relative path (works with CRA proxy or Vite proxy)
  const API_BASE = (import.meta.env?.VITE_API_BASE as string) || (process.env.REACT_APP_API_BASE as string) || "";

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    const url = `${API_BASE || ""}/api/patients`;

    fetch(url)
      .then(async (res) => {
        if (!res.ok) {
          // try to parse error body for helpful message
          const t = await res.text().catch(() => "");
          throw new Error(t || `HTTP ${res.status}`);
        }
        return res.json();
      })
      .then((data: Patient[]) => {
        if (!mounted) return;
        setPatients(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (!mounted) return;
        console.error("Failed to fetch patients:", err);
        setError(err.message || "Failed to load patients");
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []); // empty deps -> run once on mount

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Patient Data</h1>
          <Link to="/new-patient">
            <Button className="flex items-center space-x-2 bg-gradient-medical">
              <User className="w-4 h-4" />
              <span>New Patient</span>
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Patients</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div>Loading patients…</div>
            ) : error ? (
              <div className="text-red-600">Error: {error}</div>
            ) : patients.length === 0 ? (
              <div>No patients found.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead>BMI</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patients.map((patient) => (
                    <TableRow key={patient.id}>
                      <TableCell>{patient.id}</TableCell>
                      <TableCell>{patient.age}</TableCell>
                      <TableCell>{patient.gender}</TableCell>
                      <TableCell>{patient.bmi}</TableCell>
                      <TableCell>
                        <Link to={`/patients/${patient.id}`}>
                          <Button variant="outline" size="sm">View Details</Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
