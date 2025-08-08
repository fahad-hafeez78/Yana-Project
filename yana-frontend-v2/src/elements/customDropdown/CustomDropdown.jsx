import React from 'react';

const CustomDropdown = ({ id, label, name, value, onChange, required = true, options, disabled, placeholder, className }) => {
    return (
        <div className='w-full'>
            {label &&
                <label htmlFor={name} className="block font-bold">
                    {label} {required && <span className="text-red-600">*</span>}
                </label>
            }
            <select
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                required={required}
                disabled={disabled}
                className={`w-full border border-gray-light rounded px-1 py-1.5 bg-gray-100 ${className} ${disabled ? 'bg-gray-light' : ''}`}
            >
                {placeholder && <option value="" disabled>
                    {placeholder}
                </option>}
                {options?.map((option, index) => (
                    <option key={index} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default CustomDropdown;
