interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

const Button = ({ children, onClick, className }: ButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={`
        px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center justify-center font-semibold hover:bg-blue-800 transition-colors duration-300 cursor-pointer 
        ${className || ""}
      `}
    >
      {children}
    </button>
  );
};

export default Button;
