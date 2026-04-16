import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label={
        theme === "dark" ? "Chuyển sang chế độ sáng" : "Chuyển sang chế độ tối"
      }
      title={theme === "dark" ? "Chế độ sáng" : "Chế độ tối"}
      className="
        flex items-center justify-center
        relative p-2 rounded-full
        transition-colors duration-300
        cursor-pointer
        focus:outline-none focus:ring-2 focus:ring-white/40
      "
    >
      {/* Icon chuyển đổi với animation */}
      <span className="relative inline-flex items-center justify-center w-5 h-5">
        <Sun
          className={`
            absolute w-5 h-5 transition-all duration-300
            ${theme === "dark" ? "opacity-100 rotate-0 scale-100" : "opacity-0 rotate-90 scale-50"}
          `}
        />
        <Moon
          className={`
            absolute w-5 h-5 transition-all duration-300
            ${theme === "light" ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-50"}
          `}
        />
      </span>
    </button>
  );
};

export default ThemeToggle;
