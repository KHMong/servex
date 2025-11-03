import React from 'react';
import { Form } from 'react-bootstrap';
import './FormField.css';

const FormField = ({
  label,
  name,
  value,
  onChange,
  type = 'text',
  icon: Icon,
  options = [], // For select dropdowns
  error,
  ...rest
}) => {
  const inputHasIcon = !!Icon;

  const renderInput = () => {
    if (type === 'select') {
      return (
        <Form.Select
          name={name}
          value={value}
          onChange={onChange}
          className={inputHasIcon ? 'input-with-icon' : ''}
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
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className={inputHasIcon ? 'input-with-icon' : ''}
        {...rest}
      />
    );
  };

  return (
    <div className="form-field">
      {label && <Form.Label>{label}</Form.Label>}
      <div className="input-wrapper">
        {Icon && <Icon className="input-icon" />}
        {renderInput()}
      </div>
      {error && <Form.Text className="text-danger">{error}</Form.Text>}
    </div>
  );
};

export default FormField;