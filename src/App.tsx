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
import DashboardManager from "./pages/manager/DashBoard";
import Interviews from "./pages/manager/Interviews";
import Reviews from "./pages/manager/Reviews";
import { ManagerProvider } from "./context/ManagerContext";

import RecruiterJobs from "./pages/recruiter/Jobs";

// Trang nội bộ – Director
import DirectorDashboard from "./pages/director/Dashboard";
import DirectorApprovals from "./pages/director/Approvals";

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* Trang công khai */}
          <Route path="/" element={<PublicLayout />}>
            <Route index element={<HomePage />} />
            <Route path="/jobs/:id" element={<JobDetail />} />
            <Route path="/login" element={<Login />} />
          </Route>
          {/* Trang nội bộ */}
          <Route element={<DashboardLayout />}>
            {/* Recruiter */}
            <Route
              path="/recruiter/dashboard"
              element={<RecruiterDashboard />}
            />
            <Route path="/recruiter/jobs" element={<RecruiterJobs />} />
          </Route>
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

          <Route element={<DashboardLayout />}>
            {/* Trang dashboard của Recruiter */}
            <Route path="/recruiter/dashboard" element={<RecruiterDashboard />} />
            <Route path="/director/dashboard" element={<DirectorDashboard />} />
            <Route path="/director/approvals" element={<DirectorApprovals />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
