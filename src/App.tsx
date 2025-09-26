import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import PatientData from "./pages/PatientData";
import RiskAssessment from "./pages/RiskAssessment";
import Predictions from "./pages/Predictions";
import TreatmentPlans from "./pages/TreatmentPlans";
import SafetyAlerts from "./pages/SafetyAlerts";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/patient-data" element={<PatientData />} />
          <Route path="/risk-assessment" element={<RiskAssessment />} />
          <Route path="/predictions" element={<Predictions />} />
          <Route path="/treatment" element={<TreatmentPlans />} />
          <Route path="/safety" element={<SafetyAlerts />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
