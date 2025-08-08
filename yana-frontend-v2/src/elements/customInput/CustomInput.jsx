import React, { useRef, useState } from 'react';
import validationPatterns from './ValidationPatterns';

const CustomInput = ({ className, id, name, label, placeholder, value, minLength, validationKey, onChange, onKeyDown, required, type = 'text', readOnly = false, maxLength }) => {

  const { pattern, errorMessage } = validationPatterns[validationKey] || {};
  const [error, setError] = useState("");

  const handleBlur = (e) => {
    const inputValue = e.target.value
    if (inputValue && pattern && !new RegExp(pattern).test(inputValue)) {
      setError(errorMessage || 'Please match the requested format.')
    }
  }

  const handleOnChange = (e) => {
    if (readOnly) return;
    e.preventDefault()
    setError('')
    const updatedValue = e.target.value.replace(/^\s+/, "").replace(/[$#%`"'^]/g, "");

    if (onChange) {
      onChange({ target: { name, value: updatedValue } });
    }
  }

  return (
    <div>
      <label htmlFor={name} className="block font-bold">
        {label} {required && <span className="text-red-600">*</span>}
      </label>
      <div className="flex flex-col">
        <input
          type={type}
          id={name}
          name={name}
          placeholder={placeholder}
          value={value}
          minLength={minLength}
          maxLength={maxLength}
          onChange={handleOnChange}
          onBlur={handleBlur}
          onKeyDown={onKeyDown}
          required={required}
          readOnly={readOnly}
          className={`remove-arrow w-full p-1 bg-gray-100 border border-gray-light rounded-md text-base box-border focus:outline-none focus:border-gray-light ${className} ${readOnly ? 'bg-gray-light' : ''}`}
          pattern={pattern}
          autoComplete="off"
        />
        {error && <span className="text-red text-sm mt-1">{error}</span>}
      </div>
    </div>
  );
};

export default CustomInput;
