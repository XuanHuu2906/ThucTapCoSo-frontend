import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  ClipboardCheck,
  BarChart3,
  GraduationCap,
  ChevronLeft,
  PanelLeftOpen
} from "lucide-react";
import { cn } from "../../../lib/utils";
import { Link } from "react-router-dom";
import logo from "../../../assets/images/Logo.png";
interface NavItem {
  to: string;
  label: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { to: "/recruiter/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/recruiter/jobs", label: "Tin tuyển dụng", icon: Briefcase },
  { to: "/recruiter/candidates", label: "Hồ sơ ứng viên", icon: Users },
  { to: "/recruiter/probation", label: "Quản lý thử việc", icon: ClipboardCheck },
  { to: "/recruiter/reports", label: "Báo cáo", icon: BarChart3 },
];

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  return (
    <aside
      className={cn(
        "flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 shrink-0 z-50 h-screen",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo Section */}
      <div className={cn("flex items-center h-18 border-b border-slate-100 dark:border-slate-800/50 px-4 shrink-0 transition-all", collapsed ? "justify-center" : "gap-3")}>
        {!collapsed ? (
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <Link
              to="/"
              className="flex items-center gap-2.5 group duration-300"
            >
              <img
                src={logo}
                alt="Logo"
                className="w-auto h-19 object-contain"
              />
            </Link>
          </div>
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
            <img
              src={logo}
              alt="Logo"
              className="w-6 h-6 object-contain"
            />
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
        {!collapsed && (
          <p className="px-3 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4 mt-2">
            Hệ thống
          </p>
        )}
        {collapsed && <div className="h-6 mt-2 mb-4"></div>}

        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-200 group relative",
                isActive
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400",
                collapsed ? "justify-center p-2.5" : "px-3 py-2.5"
              )
            }
          >
            <item.icon className={cn(
              "w-5 h-5 shrink-0",
              "group-hover:scale-110 transition-transform duration-200"
            )} />
            {!collapsed && <span className="truncate flex-1">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Collapse Toggle */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800/50">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "flex items-center w-full rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 transition-colors py-2",
            collapsed ? "justify-center px-0" : "px-3 gap-3"
          )}
        >
          {collapsed ? (
            <PanelLeftOpen className="w-5 h-5 shrink-0" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5 shrink-0" />
              <span className="text-sm font-medium truncate">Thu gọn</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
