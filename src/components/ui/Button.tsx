interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "danger" | "outline";
}

const styles = {
  primary: "bg-blue-600 text-white hover:bg-blue-700",
  secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
  danger: "bg-red-600 text-white hover:bg-red-700",
  outline: "border border-border bg-transparent text-foreground hover:bg-muted",
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
