interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "danger" | "outline";
}

const styles = {
  primary: "bg-blue-600 text-white hover:bg-blue-700",
  secondary: "bg-slate-100 text-slate-800 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700",
  danger: "bg-red-600 text-white hover:bg-red-700",
  outline: "border border-slate-200 dark:border-slate-800 bg-transparent text-slate-750 dark:text-slate-250 hover:bg-slate-100 dark:hover:bg-slate-800",
};

const Button = ({
  children,
  className,
  variant = "primary",
  disabled,
  ...props
}: ButtonProps) => {
  const style = styles[variant];
  return (
    <button
      disabled={disabled}
      className={`
        px-4 py-2 rounded-lg flex items-center justify-center font-semibold 
        transition-colors duration-300 cursor-pointer 
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        ${style} ${className || ""}
      `}
      {...props}
    >
      {children}
    </button>
  );
};
export default Button;
