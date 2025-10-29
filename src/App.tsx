import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/auth" element={<Auth />} />
            
            {/* Dashboard - All authenticated users */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['employee', 'supervisor', 'hr', 'admin', 'bod']}>
                  <Index />
                </ProtectedRoute>
              } 
            />
            
            {/* Employee Routes */}
            <Route 
              path="/ot/submit" 
              element={
                <ProtectedRoute allowedRoles={['employee']}>
                  <div>Submit OT Page (Coming Soon)</div>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/ot/history" 
              element={
                <ProtectedRoute allowedRoles={['employee']}>
                  <div>OT History Page (Coming Soon)</div>
                </ProtectedRoute>
              } 
            />
            
            {/* Supervisor Routes */}
            <Route 
              path="/supervisor/verify" 
              element={
                <ProtectedRoute allowedRoles={['supervisor', 'admin']}>
                  <div>Verify OT Page (Coming Soon)</div>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/supervisor/team-history" 
              element={
                <ProtectedRoute allowedRoles={['supervisor', 'admin']}>
                  <div>Team History Page (Coming Soon)</div>
                </ProtectedRoute>
              } 
            />
            
            {/* HR Routes */}
            <Route 
              path="/hr/employees" 
              element={
                <ProtectedRoute allowedRoles={['hr', 'admin']}>
                  <div>Employees Page (Coming Soon)</div>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/hr/approve" 
              element={
                <ProtectedRoute allowedRoles={['hr', 'admin']}>
                  <div>Approve OT Page (Coming Soon)</div>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/hr/reports" 
              element={
                <ProtectedRoute allowedRoles={['hr', 'admin']}>
                  <div>Reports Page (Coming Soon)</div>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/hr/settings" 
              element={
                <ProtectedRoute allowedRoles={['hr', 'admin']}>
                  <div>Settings Page (Coming Soon)</div>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/hr/departments" 
              element={
                <ProtectedRoute allowedRoles={['hr', 'admin']}>
                  <div>Departments Page (Coming Soon)</div>
                </ProtectedRoute>
              } 
            />
            
            {/* BOD Routes */}
            <Route 
              path="/bod/review" 
              element={
                <ProtectedRoute allowedRoles={['bod', 'admin']}>
                  <div>Review OT Page (Coming Soon)</div>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/bod/analytics" 
              element={
                <ProtectedRoute allowedRoles={['bod', 'admin']}>
                  <div>Analytics Page (Coming Soon)</div>
                </ProtectedRoute>
              } 
            />
            
            {/* Admin Routes */}
            <Route 
              path="/admin/roles" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <div>User Roles Page (Coming Soon)</div>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/system-settings" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <div>System Settings Page (Coming Soon)</div>
                </ProtectedRoute>
              } 
            />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
