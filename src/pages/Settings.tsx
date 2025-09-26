import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Settings as SettingsIcon, Shield, Brain, Bell, Database } from "lucide-react";

const Settings = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <SettingsIcon className="w-8 h-8" />
            System Settings
          </h1>
          <p className="text-muted-foreground">
            Configure system preferences, safety parameters, and model settings
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ML Model Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                ML Model Settings
              </CardTitle>
              <CardDescription>
                Configure predictive model parameters and thresholds
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rf-threshold">RF Risk Threshold</Label>
                  <Input id="rf-threshold" placeholder="0.75" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nn-threshold">NN Risk Threshold</Label>
                  <Input id="nn-threshold" placeholder="0.80" />
                </div>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-Retrain Models</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically retrain with new patient data
                  </p>
                </div>
                <Switch />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Feature Importance Display</Label>
                  <p className="text-sm text-muted-foreground">
                    Show SHAP values to clinicians
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          {/* Safety & Compliance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Safety & Compliance
              </CardTitle>
              <CardDescription>
                Configure safety guardrails and clinical guidelines
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Drug Interaction Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable contraindication warnings
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>LLM Hallucination Detection</Label>
                  <p className="text-sm text-muted-foreground">
                    Cross-reference with clinical guidelines
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confidence-threshold">Min Confidence Threshold</Label>
                <Input id="confidence-threshold" placeholder="85%" />
              </div>
              
              <div className="space-y-2">
                <Label>Active Guidelines</Label>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="default">ADA 2024</Badge>
                  <Badge variant="default">ESC 2023</Badge>
                  <Badge variant="secondary">Hypertension Guidelines</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notifications
              </CardTitle>
              <CardDescription>
                Configure alert preferences and notification settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>High Risk Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Immediate notifications for high-risk patients
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Treatment Plan Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    Notify when recommendations change
                  </p>
                </div>
                <Switch />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Model Performance Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Alert when accuracy drops below threshold
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Data Management
              </CardTitle>
              <CardDescription>
                Configure data storage, backup, and privacy settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-Backup Patient Data</Label>
                  <p className="text-sm text-muted-foreground">
                    Daily encrypted backups
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="retention-period">Data Retention Period</Label>
                <Input id="retention-period" placeholder="7 years" />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>HIPAA Compliance Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Enhanced privacy and audit logging
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <Button variant="outline" className="w-full">
                Export System Logs
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Danger Zone</CardTitle>
            <CardDescription>
              Irreversible actions that affect the entire system
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg border-destructive/20 bg-destructive/5">
              <div>
                <Label className="text-destructive">Reset All Models</Label>
                <p className="text-sm text-muted-foreground">
                  This will reset all trained models to their initial state
                </p>
              </div>
              <Button variant="destructive" size="sm">
                Reset Models
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Settings;