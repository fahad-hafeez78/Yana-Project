import React from 'react';

const Checkbox = ({ name, label, className, checked, disabled, onChange }) => {
  return (
    <label className="flex items-center text-sm">
      <input
        type="checkbox"
        name={name}
        checked={checked}
        value={label}
        onChange={onChange}
        disabled={disabled}
        className={`mr-2 p-1 ${className}`}
      />
      {label}
    </label>
  );
};

export default Checkbox;
