import { NavLink, useLocation } from "react-router-dom";
import { 
  Activity, 
  FileText, 
  Target, 
  Brain, 
  Shield, 
  User,
  BarChart3,
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigationItems = [
  { title: "Dashboard", url: "/", icon: BarChart3 },
  { title: "Patient Data", url: "/patient-data", icon: User },
  { title: "Risk Assessment", url: "/risk-assessment", icon: Target },
  { title: "ML Predictions", url: "/predictions", icon: Brain },
  { title: "Treatment Plans", url: "/treatment", icon: FileText },
  { title: "Safety Alerts", url: "/safety", icon: Shield },
  { title: "Analytics", url: "/analytics", icon: Activity },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <div className="w-64 bg-card border-r border-border shadow-card">
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-medical rounded-lg flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">MedAI Dashboard</h1>
            <p className="text-sm text-muted-foreground">Clinical Decision Support</p>
          </div>
        </div>
      </div>

      <nav className="p-4 space-y-2">
        {navigationItems.map((item) => {
          const isActive = location.pathname === item.url;
          return (
            <NavLink
              key={item.title}
              to={item.url}
              className={cn(
                "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-medical" 
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.title}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}