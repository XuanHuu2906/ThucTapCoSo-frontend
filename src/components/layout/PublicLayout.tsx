import React from "react";
import { Outlet } from "react-router-dom";
import Footer from "./Footer";
import PublicHeader from "./PublicHeader";
import DashboardHeader from "./DashboardHeader";

const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen w-full relative">
      {/* Radial Gradient Background */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(125% 125% at 50% 10%, #fff 40%, #6366f1 100%)",
        }}
      />
      {/* Your Content/Components */}

      {/* Lớp nội dung đè lên trên */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <PublicHeader />
        <DashboardHeader />
        <main className="flex-1 w-full py-8 px-8 container mx-auto">
          <Outlet />
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default PublicLayout;
