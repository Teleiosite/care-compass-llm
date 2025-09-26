import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Shield, 
  AlertTriangle, 
  Search, 
  Filter,
  Clock,
  User,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SafetyAlerts() {
  const { toast } = useToast();

  const alerts = [
    {
      id: 1,
      patient: "John D., 74",
      type: "Drug Interaction",
      severity: "high",
      message: "Potential interaction: Metformin + ACE inhibitor may increase risk of lactic acidosis",
      details: "Patient has mild kidney impairment (eGFR 55). Monitor creatinine closely.",
      recommendation: "Consider dose reduction or alternative therapy",
      timestamp: "2 minutes ago",
      status: "active",
      source: "Clinical Decision Support"
    },
    {
      id: 2,
      patient: "Mary S., 68",
      type: "Hypoglycemia Risk",
      severity: "medium",
      message: "Increased hypoglycemia risk due to recent medication change",
      details: "Added insulin glargine 10 units. Patient lives alone and has mild cognitive impairment.",
      recommendation: "Educate on hypoglycemia recognition. Consider CGM.",
      timestamp: "15 minutes ago",
      status: "active",
      source: "ML Risk Model"
    },
    {
      id: 3,
      patient: "Robert K., 71",
      type: "Target Deviation",
      severity: "medium",
      message: "Blood pressure consistently above target (>140/90)",
      details: "Last 3 readings: 148/92, 145/88, 152/90. Current: Lisinopril 10mg daily.",
      recommendation: "Consider dose increase or add second agent",
      timestamp: "1 hour ago",
      status: "active",
      source: "Automated Monitoring"
    },
    {
      id: 4,
      patient: "Emma T., 69",
      type: "Medication Adherence",
      severity: "low",
      message: "Potential medication non-adherence detected",
      details: "HbA1c increased from 7.2% to 8.1% without medication changes.",
      recommendation: "Medication adherence assessment and counseling",
      timestamp: "3 hours ago",
      status: "acknowledged",
      source: "Pattern Analysis"
    },
    {
      id: 5,
      patient: "William H., 76",
      type: "Contraindication",
      severity: "high",
      message: "Contraindicated medication prescribed",
      details: "Metformin prescribed despite eGFR <30 (current: 28).",
      recommendation: "Discontinue metformin immediately. Consider insulin therapy.",
      timestamp: "5 hours ago",
      status: "resolved",
      source: "Safety Checker"
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high": return "text-risk-high";
      case "medium": return "text-risk-medium";
      case "low": return "text-risk-low";
      default: return "text-muted-foreground";
    }
  };

  const getSeverityBg = (severity: string) => {
    switch (severity) {
      case "high": return "bg-risk-high-bg border-l-risk-high";
      case "medium": return "bg-risk-medium-bg border-l-risk-medium";
      case "low": return "bg-risk-low-bg border-l-risk-low";
      default: return "bg-muted border-l-muted";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active": return <AlertCircle className="w-4 h-4 text-risk-high" />;
      case "acknowledged": return <Clock className="w-4 h-4 text-risk-medium" />;
      case "resolved": return <CheckCircle className="w-4 h-4 text-risk-low" />;
      default: return <XCircle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const handleAcknowledge = (alertId: number) => {
    toast({
      title: "Alert acknowledged",
      description: "The safety alert has been acknowledged and logged.",
    });
  };

  const handleResolve = (alertId: number) => {
    toast({
      title: "Alert resolved",
      description: "The safety alert has been marked as resolved.",
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Safety Alerts</h1>
            <p className="text-muted-foreground">Clinical safety monitoring and automated guardrails</p>
          </div>
          <div className="flex items-center space-x-3">
            <Badge variant="destructive" className="bg-risk-high-bg text-risk-high">
              3 High Priority
            </Badge>
            <Badge variant="secondary" className="bg-risk-medium-bg text-risk-medium">
              2 Medium Priority
            </Badge>
          </div>
        </div>

        {/* Alert Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Alerts</p>
                <p className="text-2xl font-bold text-risk-high">5</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-risk-high" />
            </div>
          </Card>
          
          <Card className="p-4 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Resolved Today</p>
                <p className="text-2xl font-bold text-risk-low">12</p>
              </div>
              <CheckCircle className="w-8 h-8 text-risk-low" />
            </div>
          </Card>
          
          <Card className="p-4 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Drug Interactions</p>
                <p className="text-2xl font-bold text-risk-medium">3</p>
              </div>
              <Shield className="w-8 h-8 text-risk-medium" />
            </div>
          </Card>
          
          <Card className="p-4 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">System Uptime</p>
                <p className="text-2xl font-bold text-clinical-teal">99.8%</p>
              </div>
              <Shield className="w-8 h-8 text-clinical-teal" />
            </div>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="p-4 shadow-card">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input 
                placeholder="Search alerts by patient, type, or message..." 
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="flex items-center space-x-2">
              <Filter className="w-4 h-4" />
              <span>Filter</span>
            </Button>
            <Button variant="outline">Export</Button>
          </div>
        </Card>

        {/* Alerts List */}
        <div className="space-y-4">
          {alerts.map((alert) => (
            <Card key={alert.id} className={`p-6 shadow-card border-l-4 ${getSeverityBg(alert.severity)}`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(alert.status)}
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-semibold">{alert.type}</h3>
                      <Badge 
                        variant="outline"
                        className={`${getSeverityColor(alert.severity)} border-current`}
                      >
                        {alert.severity.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <User className="w-3 h-3" />
                      <span>{alert.patient}</span>
                      <span>•</span>
                      <Clock className="w-3 h-3" />
                      <span>{alert.timestamp}</span>
                      <span>•</span>
                      <span>{alert.source}</span>
                    </div>
                  </div>
                </div>
                <Badge variant={
                  alert.status === "resolved" ? "default" :
                  alert.status === "acknowledged" ? "secondary" : "destructive"
                } className={
                  alert.status === "resolved" ? "bg-risk-low-bg text-risk-low" :
                  alert.status === "acknowledged" ? "bg-risk-medium-bg text-risk-medium" :
                  "bg-risk-high-bg text-risk-high"
                }>
                  {alert.status.toUpperCase()}
                </Badge>
              </div>

              <div className="mb-4">
                <p className="font-medium mb-2">{alert.message}</p>
                <p className="text-sm text-muted-foreground mb-3">{alert.details}</p>
                <div className="p-3 bg-clinical-teal-light rounded-lg">
                  <p className="text-sm font-medium text-clinical-teal">
                    Recommendation: {alert.recommendation}
                  </p>
                </div>
              </div>

              {alert.status === "active" && (
                <div className="flex items-center space-x-3">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleAcknowledge(alert.id)}
                  >
                    Acknowledge
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => handleResolve(alert.id)}
                    className="bg-gradient-medical"
                  >
                    Mark Resolved
                  </Button>
                  <Button variant="ghost" size="sm">
                    View Patient
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Safety System Status */}
        <Card className="p-6 shadow-card">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Shield className="w-5 h-5 mr-2 text-primary" />
            Safety System Status
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-risk-low-bg rounded-lg">
              <CheckCircle className="w-8 h-8 text-risk-low mx-auto mb-2" />
              <h4 className="font-medium text-risk-low">Drug Interaction Checker</h4>
              <p className="text-sm text-muted-foreground">Online - Last check: 1 min ago</p>
            </div>
            
            <div className="text-center p-4 bg-risk-low-bg rounded-lg">
              <CheckCircle className="w-8 h-8 text-risk-low mx-auto mb-2" />
              <h4 className="font-medium text-risk-low">Contraindication Monitor</h4>
              <p className="text-sm text-muted-foreground">Online - Last check: 30 sec ago</p>
            </div>
            
            <div className="text-center p-4 bg-risk-low-bg rounded-lg">
              <CheckCircle className="w-8 h-8 text-risk-low mx-auto mb-2" />
              <h4 className="font-medium text-risk-low">Risk Assessment Engine</h4>
              <p className="text-sm text-muted-foreground">Online - Model v2.1.4</p>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}