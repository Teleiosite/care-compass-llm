import { NavLink, useLocation } from "react-router-dom";
import { 
  Activity, 
  FileText, 
  Target, 
  Brain, 
  Shield, 
  User,
  Users,
  BarChart3,
  Settings,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

const navigationItems = [
  { title: "Dashboard", url: "/", icon: BarChart3 },
  { title: "Patient Data", url: "/patient-data", icon: Users },
  { title: "Patient Profile", url: "/patient-profile", icon: User },
  { title: "Risk Assessment", url: "/risk-assessment", icon: Target },
  { title: "ML Predictions", url: "/predictions", icon: Brain },
  { title: "Treatment Plans", url: "/treatment", icon: FileText },
  { title: "Safety Alerts", url: "/safety", icon: Shield },
  { title: "Analytics", url: "/analytics", icon: Activity },
  { title: "Settings", url: "/settings", icon: Settings },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const isMobile = useIsMobile();

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed md:sticky top-0 left-0 h-screen bg-card border-r border-border shadow-card z-50 transition-transform duration-300",
          "w-64 md:translate-x-0",
          isMobile && !isOpen && "-translate-x-full"
        )}
      >
        <div className="p-4 md:p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-medical rounded-lg flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-base md:text-lg font-bold text-foreground truncate">MedAI Dashboard</h1>
                <p className="text-xs md:text-sm text-muted-foreground truncate">Clinical Decision Support</p>
              </div>
            </div>
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="md:hidden"
              >
                <X className="w-5 h-5" />
              </Button>
            )}
          </div>
        </div>

        <nav className="p-3 md:p-4 space-y-1 overflow-y-auto h-[calc(100vh-80px)]">
          {navigationItems.map((item) => {
            const isActive = location.pathname.startsWith(item.url) && (item.url !== '/' || location.pathname === '/');
            return (
              <NavLink
                key={item.title}
                to={item.url}
                onClick={() => isMobile && onClose()}
                className={cn(
                  "flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-medical" 
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span className="truncate">{item.title}</span>
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </>
  );
}