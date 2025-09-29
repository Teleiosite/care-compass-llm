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
  Shield
} from "lucide-react";

export default function Dashboard() {
  const riskMetrics = [
    { 
      label: "Cardiovascular Events", 
      value: "12%", 
      trend: "+2.1%", 
      level: "medium",
      patients: 34 
    },
    { 
      label: "Hypoglycemia Risk", 
      value: "8%", 
      trend: "-1.2%", 
      level: "low",
      patients: 22 
    },
    { 
      label: "Uncontrolled BP", 
      value: "18%", 
      trend: "+3.5%", 
      level: "high",
      patients: 51 
    },
    { 
      label: "Polypharmacy Risk", 
      value: "15%", 
      trend: "+0.8%", 
      level: "medium",
      patients: 43 
    },
  ];

  const recentAlerts = [
    {
      patient: "John D., 74",
      alert: "Drug interaction detected: Metformin + ACE inhibitor",
      severity: "high",
      time: "2 min ago"
    },
    {
      patient: "Mary S., 68",
      alert: "Hypoglycemia risk increased due to recent medication change",
      severity: "medium",
      time: "15 min ago"
    },
    {
      patient: "Robert K., 71",
      alert: "Blood pressure target not met - consider treatment adjustment",
      severity: "medium",
      time: "1 hour ago"
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Clinical Dashboard</h1>
          <p className="text-muted-foreground">AI-powered insights for elderly diabetes care</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Patients</p>
                <p className="text-3xl font-bold text-foreground">284</p>
                <p className="text-sm text-clinical-teal">+12 this month</p>
              </div>
              <Users className="w-12 h-12 text-primary" />
            </div>
          </Card>

          <Card className="p-6 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Alerts</p>
                <p className="text-3xl font-bold text-foreground">47</p>
                <p className="text-sm text-risk-high">Requires attention</p>
              </div>
              <AlertTriangle className="w-12 h-12 text-risk-high" />
            </div>
          </Card>

          <Card className="p-6 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">ML Predictions</p>
                <p className="text-3xl font-bold text-foreground">1,247</p>
                <p className="text-sm text-clinical-teal">94.2% accuracy</p>
              </div>
              <Brain className="w-12 h-12 text-clinical-teal" />
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

        {/* Risk Assessment Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="p-6 shadow-card">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-primary" />
                Risk Assessment Overview
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {riskMetrics.map((metric, index) => (
                  <div key={index} className="p-4 rounded-lg border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">{metric.label}</h4>
                      <Badge 
                        variant={metric.level === 'high' ? 'destructive' : 
                               metric.level === 'medium' ? 'secondary' : 'default'}
                        className={
                          metric.level === 'high' ? "bg-risk-high-bg text-risk-high" :
                          metric.level === 'medium' ? "bg-risk-medium-bg text-risk-medium" :
                          "bg-risk-low-bg text-risk-low"
                        }
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
            <Card className="p-6 shadow-card">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-risk-high" />
                Recent Alerts
              </h3>
              <div className="space-y-4">
                {recentAlerts.map((alert, index) => (
                  <div key={index} className="p-3 rounded-lg border border-border">
                    <div className="flex items-start justify-between mb-2">
                      <span className="font-medium text-sm">{alert.patient}</span>
                      <Badge 
                        variant={alert.severity === 'high' ? 'destructive' : 'secondary'}
                        className={
                          alert.severity === 'high' ? "bg-risk-high-bg text-risk-high" :
                          "bg-risk-medium-bg text-risk-medium"
                        }
                      >
                        {alert.severity.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{alert.alert}</p>
                    <p className="text-xs text-muted-foreground">{alert.time}</p>
                  </div>
                ))}
              </div>
              <Button className="w-full mt-4" variant="outline">
                View All Alerts
              </Button>
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
        <Card className="p-6 shadow-card">
          <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button className="h-20 flex flex-col space-y-2 bg-gradient-medical text-white">
              <Heart className="w-6 h-6" />
              <span>New Risk Assessment</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col space-y-2">
              <Droplets className="w-6 h-6" />
              <span>Blood Sugar Analysis</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col space-y-2">
              <Activity className="w-6 h-6" />
              <span>BP Monitoring</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col space-y-2">
              <Brain className="w-6 h-6" />
              <span>ML Model Training</span>
            </Button>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}