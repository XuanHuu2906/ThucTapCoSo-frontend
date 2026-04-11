import { BrowserRouter, Routes, Route } from "react-router-dom";
// Chỉnh lại import cho đồng nhất
import PublicLayout from "./components/layout/PublicLayout";
import JobList from "./pages/Jobs/JobList";
import JobDetail from "./pages/Jobs/JobDetail";
import NotFound from "./pages/NotFound";
import HomePage from "./pages/HomePage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route path="jobs" element={<JobList />} />{" "}
          <Route path="jobs/:id" element={<JobDetail />} />{" "}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
