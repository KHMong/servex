import React, { useState } from 'react';
import { Form } from 'react-bootstrap';
import { FaEyeSlash, FaEye } from 'react-icons/fa';
import './FormField.css';

const FormField = ({
  label,
  name,
  minLength = 1,
  maxLength = 255,
  value,
  onChange,
  type = 'text',
  iconLeft: IconLeft,
  options = [], // For select dropdowns
  error,
  required = false,
  id = name,
  ...rest
}) => {
  // Show/Hide state
  const isPasswordToggle = type === 'password-toggle';
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  // Input type
  const inputType = isPasswordToggle ? (isPasswordVisible ? 'text' : 'password') : type;

  // Show/Hide icon
  const IconRight = isPasswordToggle ? (isPasswordVisible ? FaEye : FaEyeSlash) : null;

  let inputClasses = '';
  if (IconLeft) inputClasses += ' input-with-icon-left';
  if (IconRight) inputClasses += ' input-with-icon-right';

  const renderInput = () => {
    if (type === 'select') {
      return (
        <Form.Select
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          className={inputClasses.trim()}
          isInvalid={!!error}
          {...rest}
        >
          {rest.placeholder && <option value="">{rest.placeholder}</option>}
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Form.Select>
      );
    }

    return (
      <Form.Control
        id={id}
        type={inputType}
        name={name}
        minLength={minLength}
        maxLength={maxLength}
        value={value}
        onChange={onChange}
        className={`${inputClasses.trim()} ${type === 'password-toggle' ? 'password-input' : ''}`}
        isInvalid={!!error}
        {...rest}
      />
    );
  };

  return (
    <div className="form-field">
      {label && <Form.Label htmlFor={id}>{label} {required && <span className="text-danger ms-1">*</span>}</Form.Label>}
      <div className="input-wrapper">
        {IconLeft && <IconLeft className="input-icon input-icon-left" />}
        {renderInput()}
        {IconRight && (
          <IconRight 
            className="input-icon input-icon-right" 
            onClick={() => setIsPasswordVisible(!isPasswordVisible)}
          />
        )}
      </div>
      {error && <Form.Text className="text-danger">{error}</Form.Text>}
    </div>
  );
};

export default FormField;