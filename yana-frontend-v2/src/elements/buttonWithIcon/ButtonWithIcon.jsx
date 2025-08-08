const ButtonWithIcon = ({
  icon,
  text,
  type,
  onClick,
  variant = "DEFAULT",
  className = "",
  disabled = false
}) => {
  // Base classes + variant-specific classes
  const baseClasses = `flex items-center justify-center border-none rounded-full cursor-pointer font-medium gap-2 transition-colors duration-200 py-2 ${variant !== "DEFAULT" ? "px-4" : ''} hover:scale-[1.01] `;

  const variantClasses = {
    DEFAULT: '',
    primary: "bg-primary hover:bg-primary-dark active:bg-primary-dark/90 text-white",
    secondary: "bg-secondary hover:bg-secondary-dark active:bg-secondary-dark/80 text-white",

    primaryDark: "bg-primary-dark hover:bg-primary-light active:bg-primary-light/90 text-white",

    confirm: "bg-primary hover:bg-primary-dark active:bg-primary-dark/90 text-white",
    discard: "bg-gray hover:bg-gray-dark active:bg-gray-dark/80 text-white",
    danger: "bg-red hover:bg-red-dark active:bg-red-dark text-white",
  };

  return (
    <button
      onClick={onClick}
      type={type}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      {icon && <span className="flex items-center">{icon}</span>}
      <span>{text}</span>
    </button>
  );
};

export default ButtonWithIcon;
