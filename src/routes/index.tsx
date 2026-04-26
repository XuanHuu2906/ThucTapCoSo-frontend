import { Route, Routes } from "react-router-dom";
import DashboardLayout from "@/components/layout/dashboard";
import PublicLayout from "@/components/layout/public";
import { ManagerProvider } from "@/context/ManagerContext";
import DirectorApprovals from "@/pages/director/Approvals";
import DirectorDashboard from "@/pages/director/Dashboard";
import DirectorReports from "@/pages/director/Reports";
import HomePage from "@/pages/HomePage";
import JobDetail from "@/pages/Jobs/JobDetail";
import Login from "@/pages/Login";
import DashboardManager from "@/pages/manager/DashBoard";
import Interviews from "@/pages/manager/Interviews";
import Reviews from "@/pages/manager/Reviews";
import NotFound from "@/pages/NotFound";
import ProbationerDashboard from "@/pages/probationer/Dashboard";
import RecruiterCandidates from "@/pages/recruiter/Candidates";
import RecruiterDashboard from "@/pages/recruiter/Dashboard";
import RecruiterJobs from "@/pages/recruiter/Jobs";
import Probation from "@/pages/recruiter/Probation";
import Reports from "@/pages/recruiter/Reports";
import ProtectedRoute from "./ProtectedRoute";
import { ROUTES } from "./routes.config";

const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path={ROUTES.home} element={<HomePage />} />
        <Route path={ROUTES.jobDetail} element={<JobDetail />} />
        <Route path={ROUTES.login} element={<Login />} />
      </Route>

      <Route
        element={
          <ProtectedRoute allowedRoles={["recruiter"]}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path={ROUTES.recruiter.dashboard} element={<RecruiterDashboard />} />
        <Route path={ROUTES.recruiter.jobs} element={<RecruiterJobs />} />
        <Route path={ROUTES.recruiter.candidates} element={<RecruiterCandidates />} />
        <Route path={ROUTES.recruiter.probation} element={<Probation />} />
        <Route path={ROUTES.recruiter.reports} element={<Reports />} />
      </Route>

      <Route
        element={
          <ProtectedRoute allowedRoles={["manager"]}>
            <ManagerProvider>
              <DashboardLayout />
            </ManagerProvider>
          </ProtectedRoute>
        }
      >
        <Route path={ROUTES.manager.dashboard} element={<DashboardManager />} />
        <Route path={ROUTES.manager.interviews} element={<Interviews />} />
        <Route path={ROUTES.manager.reviews} element={<Reviews />} />
      </Route>

      <Route
        element={
          <ProtectedRoute allowedRoles={["director"]}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path={ROUTES.director.dashboard} element={<DirectorDashboard />} />
        <Route path={ROUTES.director.approvals} element={<DirectorApprovals />} />
        <Route path={ROUTES.director.reports} element={<DirectorReports />} />
      </Route>

      <Route
        element={
          <ProtectedRoute allowedRoles={["probationer"]}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path={ROUTES.probationer.dashboard} element={<ProbationerDashboard />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
