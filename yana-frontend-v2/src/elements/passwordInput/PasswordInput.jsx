import React, { useState } from "react";
import EyeIcon from "../../assets/customIcons/generalIcons/EyeIcon.svg";
import EyeCloseIcon from "../../assets/customIcons/generalIcons/EyeCloseIcon.svg";

const PasswordInput = ({
  id,
  name,
  value,
  onChange,
  label,
  placeholder,
  required = false,
  className = "",
  validate = true, // Enable or disable validation
  passwordError
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const toggleShowPassword = () => setShowPassword((prev) => !prev);

  // Validation Logic
  const validatePassword = (password) => {
    const validations = [
      { isValid: password.length >= 8, message: "Must be at least 8 characters long." },
      { isValid: /[A-Z]/.test(password), message: "Must include an uppercase letter." },
      { isValid: /[a-z]/.test(password), message: "Must include a lowercase letter." },
      { isValid: /\d/.test(password), message: "Must include a number." },
      { isValid: /[@#$!%*?&.]/.test(password), message: "Must include a special character." },
    ];

    const failedValidation = validations.find((v) => !v.isValid);
    return failedValidation ? failedValidation.message : "";
  };

  const handleBlur = () => {
    if (value && validate) {
      const validationError = validatePassword(value);
      setError(validationError); // Set error specific to this input field
    }
  };

  const handleInputChange = (e) => {
    if (error) {
      setError(""); // Clear error if user starts typing
    }
    onChange(e); // Pass the updated value to the parent
  };

  return (
    <div className="relative flex-1 min-w-[1px]">
      {label && (
        <label htmlFor={id} className="block font-bold mb-[5px]">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          id={id}
          name={name}
          placeholder={placeholder}
          value={value}
          maxLength={15}
          onChange={handleInputChange}
          onBlur={handleBlur}
          required={required}
          className={`w-full border rounded-md px-2 py-1 pr-8 ${className}`}
        />
        <button
          type="button"
          onClick={toggleShowPassword}
          className={`absolute right-2 ${label ? "top-1/3" : "top-1/2"} transform -translate-y-1/2`}
        >
          {showPassword ? (
            <img src={EyeIcon} alt="Show" width={18} height={18} />
          ) : (
            <img src={EyeCloseIcon} alt="Hide" width={18} height={18} />
          )}
        </button>
      </div>
      {error && <div className="text-red">{error}</div>}
      {passwordError && <div className="text-red">{passwordError}</div>}
    </div>
  );
};

export default PasswordInput;