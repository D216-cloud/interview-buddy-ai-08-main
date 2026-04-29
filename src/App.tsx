import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import ProtectedRoute from "@/components/ProtectedRoute";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import InterviewSetup from "./pages/InterviewSetup";
import InterviewSession from "./pages/InterviewSession";
import InterviewHistory from "./pages/InterviewHistory";
import InterviewResults from "./pages/InterviewResults";
import Profile from "./pages/Profile";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";
import QuestionBank from "./pages/QuestionBank";
import Analytics from "./pages/Analytics";
import InterviewTips from "./pages/InterviewTips";
import FullInterview from "./pages/FullInterview";
import FullInterviewSession from "./pages/FullInterviewSession";
import FullInterviewResults from "./pages/FullInterviewResults";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/interview/setup" element={<ProtectedRoute><InterviewSetup /></ProtectedRoute>} />
          <Route path="/interview/session" element={<ProtectedRoute><InterviewSession /></ProtectedRoute>} />
          <Route path="/interview/results/:sessionId" element={<ProtectedRoute><InterviewResults /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><InterviewHistory /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          <Route path="/questions" element={<ProtectedRoute><QuestionBank /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
          <Route path="/tips" element={<ProtectedRoute><InterviewTips /></ProtectedRoute>} />
          <Route path="/interview/full" element={<ProtectedRoute><FullInterview /></ProtectedRoute>} />
          <Route path="/interview/full/session" element={<ProtectedRoute><FullInterviewSession /></ProtectedRoute>} />
          <Route path="/interview/full/results" element={<ProtectedRoute><FullInterviewResults /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
