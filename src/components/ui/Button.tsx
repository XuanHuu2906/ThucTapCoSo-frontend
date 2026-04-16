interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: "primary" | "secondary" | "danger";
}
const styles = {
  primary: "bg-blue-600 text-white hover:bg-blue-700",
  secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
  danger: "bg-red-600 text-white hover:bg-red-700",
};

const Button = ({
  children,
  onClick,
  className,
  variant = "primary",
}: ButtonProps) => {
  const style = styles[variant];
  return (
    <button
      onClick={onClick}
      className={`
        px-4 py-2 rounded-lg flex items-center justify-center font-semibold hover:transition-colors duration-300 cursor-pointer 

        ${style} ${className || ""}
      `}
    >
      {children}
    </button>
  );
};
export default Button;
