import { BrowserRouter, Routes, Route } from "react-router-dom";
import PublicLayout from "./components/layout/public";
import DashboardLayout from "./components/layout/dashboard";
import { ThemeProvider } from "./context/ThemeContext";

// Trang công khai 
import HomePage from "./pages/HomePage";
import JobList from "./pages/Jobs/JobList";
import JobDetail from "./pages/Jobs/JobDetail";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

// Trang nội bộ – Recruiter
import RecruiterDashboard from "./pages/recruiter/Dashboard";

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
            <Route path="jobs" element={<JobList />} />
            <Route path="jobs/:id" element={<JobDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* Trang nội bộ */}
          <Route element={<DashboardLayout />}>
            {/* Recruiter */}
            <Route path="/recruiter/dashboard" element={<RecruiterDashboard />} />
          </Route>

          <Route element={<DashboardLayout />}>
            {/* Trang dashboard của Recruiter */}
            <Route path="/recruiter/dashboard" element={<RecruiterDashboard />} />
            <Route path="/director/dashboard" element={<DirectorDashboard />} />
            <Route path="/director/approvals" element={<DirectorApprovals />} />
          </Route>

        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;



