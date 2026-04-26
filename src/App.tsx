import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { Toaster } from "react-hot-toast";
import AppRoutes from "@/routes";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
          <Toaster position="top-right" reverseOrder={false} />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
