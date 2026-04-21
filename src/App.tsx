import { BrowserRouter, Routes, Route } from "react-router-dom";
import PublicLayout from "./components/layout/public";
import DashboardLayout from "./components/layout/dashboard";
import { ThemeProvider } from "./context/ThemeContext";

// Trang công khai
import HomePage from "./pages/HomePage";
import JobDetail from "./pages/Jobs/JobDetail";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

// Trang nội bộ – Recruiter
import RecruiterDashboard from "./pages/recruiter/Dashboard";
import RecruiterJobs from "./pages/recruiter/Jobs";
import RecruiterCandidates from "./pages/recruiter/Candidates";
import Probation from "./pages/recruiter/Probation";
import Reports from "./pages/recruiter/Reports";

// Trang nội bộ – Manager
import DashboardManager from "./pages/manager/DashBoard";
import Interviews from "./pages/manager/Interviews";
import Reviews from "./pages/manager/Reviews";
import { ManagerProvider } from "./context/ManagerContext";

// Trang nội bộ – Director
import DirectorDashboard from "./pages/director/Dashboard";
import DirectorApprovals from "./pages/director/Approvals";
import DirectorReports from "./pages/director/Reports";

// Trang nội bộ – Probationer
import ProbationerDashboard from "./pages/probationer/Dashboard";

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/jobs/:id" element={<JobDetail />} />
            <Route path="/login" element={<Login />} />
          </Route>

          {/* Recruiter Routes */}
          <Route element={<DashboardLayout />}>
            <Route path="/recruiter/dashboard" element={<RecruiterDashboard />} />
            <Route path="/recruiter/jobs" element={<RecruiterJobs />} />
            <Route path="/recruiter/candidates" element={<RecruiterCandidates />} />
            <Route path="/recruiter/probation" element={<Probation />} />
            <Route path="/recruiter/reports" element={<Reports />} />
          </Route>

          {/* Manager Routes */}
          <Route
            path="/manager"
            element={
              <ManagerProvider>
                <DashboardLayout />
              </ManagerProvider>
            }
          >
            <Route path="dashboard" element={<DashboardManager />} />
            <Route path="interviews" element={<Interviews />} />
            <Route path="reviews" element={<Reviews />} />
          </Route>

          {/* Director Routes */}
          <Route element={<DashboardLayout />}>
            <Route path="/director/dashboard" element={<DirectorDashboard />} />
            <Route path="/director/approvals" element={<DirectorApprovals />} />
            <Route path="/director/reports" element={<DirectorReports />} />
          </Route>

          {/* Probationer Routes */}
          <Route element={<DashboardLayout />}>
            <Route path="/probationer/dashboard" element={<ProbationerDashboard />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
