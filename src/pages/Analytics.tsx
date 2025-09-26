import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Users, TrendingUp, Clock } from "lucide-react";

const Analytics = () => {
  const metrics = [
    {
      title: "Total Patients",
      value: "1,247",
      change: "+12.3%",
      trend: "up",
      icon: Users,
    },
    {
      title: "Risk Assessments",
      value: "3,421",
      change: "+8.7%",
      trend: "up", 
      icon: Activity,
    },
    {
      title: "Treatment Plans",
      value: "2,156",
      change: "+15.2%",
      trend: "up",
      icon: TrendingUp,
    },
    {
      title: "Avg Response Time",
      value: "2.4s",
      change: "-0.3s",
      trend: "down",
      icon: Clock,
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor system performance and clinical outcomes
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric) => (
            <Card key={metric.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {metric.title}
                </CardTitle>
                <metric.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <Badge 
                    variant={metric.trend === "up" ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {metric.change}
                  </Badge>
                  <span>from last month</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Risk Distribution</CardTitle>
              <CardDescription>
                Patient risk categorization over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Low Risk</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-risk-low-bg rounded-full h-2">
                      <div className="bg-risk-low h-2 rounded-full w-16"></div>
                    </div>
                    <span className="text-sm text-muted-foreground">67%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Medium Risk</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-risk-medium-bg rounded-full h-2">
                      <div className="bg-risk-medium h-2 rounded-full w-8"></div>
                    </div>
                    <span className="text-sm text-muted-foreground">25%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">High Risk</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-risk-high-bg rounded-full h-2">
                      <div className="bg-risk-high h-2 rounded-full w-2"></div>
                    </div>
                    <span className="text-sm text-muted-foreground">8%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Model Performance</CardTitle>
              <CardDescription>
                ML model accuracy and reliability metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Random Forest</span>
                  <Badge variant="default">92.4% Accuracy</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Neural Network</span>
                  <Badge variant="default">89.7% Accuracy</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">LLM Recommendations</span>
                  <Badge variant="secondary">95.1% Safety Score</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;