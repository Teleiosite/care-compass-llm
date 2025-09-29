import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";

// Define the Alert interface
interface Alert {
  id: number;
  age: number;
  gender: string;
  alert_message: string;
  severity: string;
  created_at: string;
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    // Fetch all alerts
    fetch("http://localhost:3000/api/alerts")
      .then((res) => res.json())
      .then((data) => setAlerts(data));
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-foreground">All Alerts</h1>

        <Card>
          <CardHeader>
            <CardTitle>Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alerts.map((alert) => (
                  <TableRow key={alert.id}>
                    <TableCell>{`Patient, ${alert.age}, ${alert.gender}`}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={alert.severity === 'high' ? 'destructive' : 'secondary'}
                        className={
                          alert.severity === 'high' ? "bg-risk-high-bg text-risk-high" :
                          "bg-risk-medium-bg text-risk-medium"
                        }
                      >
                        {alert.severity.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>{alert.alert_message}</TableCell>
                    <TableCell>{new Date(alert.created_at).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
