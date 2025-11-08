export const validateRegistration = (formData, role) => {
  const errors = {};

  // Name Validation
  if (!formData.name) errors.name = "Full Name is required.";

  // Gender Validation
  if (!formData.gender) errors.gender = "Gender is required.";

  // Date of Birth Validation
  if (!formData.date_of_birth) errors.date_of_birth = "Date of Birth is required.";
  
  // Email Validation
  if (!formData.email) {
    errors.email = "Email is required.";
  } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
    errors.email = "Email address is invalid.";
  }

  // Phone Number Validation (Role-specific)
  if (!formData.phone_no) {
    errors.phone_no = "Phone Number is required.";
  } else if (role === 'Player' && !/^01[0-9]-[0-9]{7,8}$/.test(formData.phone_no)) {
    errors.phone_no = "Please enter a valid Malaysian mobile number (E.g. 012-3456789).";
  } else if (role === 'Owner' && !/^0[1-9]-[0-9]{8}$/.test(formData.phone_no)) {
    errors.phone_no = "Please enter a valid Malaysian phone number. (E.g. 03-12345678).";
  }

  // Password Validation
  if (!formData.password) {
    errors.password = "Password is required.";
  } else {
    const passwordErrors = [];

    // 8-15 characters
    if (formData.password.length < 8 || formData.password.length > 15) {
      passwordErrors.push("must be between 8 - 15 characters");
    }
    // Must contain uppercase letter
    if (!/[A-Z]/.test(formData.password)) {
      passwordErrors.push("must contain an uppercase letter");
    }
    // Must contain lowercase letter
    if (!/[a-z]/.test(formData.password)) {
      passwordErrors.push("must contain a lowercase letter");
    }
    // Must contain number
    if (!/\d/.test(formData.password)) {
      passwordErrors.push("must contain a number");
    }
    // Must contain special character
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]+/.test(formData.password)) {
      passwordErrors.push("must contain a special character");
    }

    if (passwordErrors.length > 0) {
      errors.password = `Password ${passwordErrors.join(', ')}.`;
    }
  }

  // Match with confirm password
  if (formData.password !== formData.password_confirmation) {
    errors.password_confirmation = "Passwords do not match.";
  }
  
  // Owner-specific fields
  if (role === 'Owner') {
    if (!formData.company_name) errors.company_name = "Company Name is required.";
    if (!formData.business_reg_no) {
      errors.business_reg_no = "Business Registration Number is required."
    } else if (!/^((19|20)[0-9]{2})(0[1-6])([0-9]{6})$/.test(formData.business_reg_no)) {
      errors.business_reg_no = "Please enter a valid Business Registration Number. (E.g. 202501000001)"
    };
  }

  return errors;
};