/************ USER DETAILS ************/
// Name Validation
const validateName = (name) => {
  if (!name) return "Full Name is required.";
  return null;
};

// Gender Validation
const validateGender = (gender) => {
  if (!gender) return "Gender is required.";
  return null;
};

// Date of Birth Validation
const validateDateOfBirth = (dob, role) => {
  if (!dob) return "Date of Birth is required.";

  const minAge = (role === 'Player') ? 7 : 15;
  const today = new Date();
  const selectedDate = new Date(dob);

  const cutoffDate = new Date();
  cutoffDate.setFullYear(today.getFullYear() - minAge);

  if (selectedDate > cutoffDate) {
    return `You must be at least ${minAge} years old.`;
  }

  return null;
};

// Email Validation
const validateEmail = (email) => {
  if (!email) return "Email Address is required.";
  if (!/\S+@\S+\.\S+/.test(email)) return "Email address is invalid.";
  return null;
};

// Player Phone Validation
const validatePlayerPhone = (phone) => {
  if (!phone) return "Phone Number is required.";
  if (!/^01[0-9]-[0-9]{7,8}$/.test(phone)) return "Please enter a valid Malaysian mobile number (E.g. 012-3456789).";
  return null;
};

// Owner Phone Validation
const validateOwnerPhone = (phone) => {
  if (!phone) return "Phone Number is required.";
  if (!/^0[1-9]-[0-9]{8}$/.test(phone)) return "Please enter a valid Malaysian phone number. (E.g. 03-12345678).";
  return null;
};

// Password Validation
const validatePasswords = (password, confirmation) => {
  if (!password) return { password: "Password is required." };

  const passwordErrors = [];
  // 8-15 characters
  if (password.length < 8 || password.length > 15) {
    passwordErrors.push("must be between 8 - 15 characters");
  }
  // Must contain uppercase letter
  if (!/[A-Z]/.test(password)) {
    passwordErrors.push("must contain an uppercase letter");
  }
  // Must contain lowercase letter
  if (!/[a-z]/.test(password)) {
    passwordErrors.push("must contain a lowercase letter");
  }
  // Must contain number
  if (!/\d/.test(password)) {
    passwordErrors.push("must contain a number");
  }
  // Must contain special character
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]+/.test(password)) {
    passwordErrors.push("must contain a special character");
  }

  if (passwordErrors.length > 0) {
    const allPasswordErrors = `Password ${passwordErrors.join(', ')}.`;
    return { password: allPasswordErrors };
  }

  if (password !== confirmation) return { password_confirmation: "Passwords do not match." };

  return null;
};

// Current Password Validation
const validateCurrentPassword = (current_password) => {
  if (!current_password) return "Current Password is required.";
  return null;
};

// New Password Validation
const validateNewPassword = (current_password, password) => {
  if (current_password === password) return "New Password must be different from Current Password.";
  return null;
}


/************ OWNER ************/
// Company Name Validation
const validateCompanyName = (company_name) => {
  if (!company_name) return "Company Name is required.";
  return null;
};

// Business Registration Number Validation
const validateBRN = (brn) => {
  if (!brn) return "Business Registration Number is required.";
  if (!/^((19|20)[0-9]{2})(0[1-6])([0-9]{6})$/.test(brn)) return "Please enter a valid Business Registration Number. (E.g. 202501000001).";
  return null;
};


/************ COACH ************/
// Bio Validation
const validateBio = (bio) => {
  if (!bio) return "Bio is required.";
  return null;
};

// Year of Coaching Experience Validation
const validateExpYear = (exp_year) => {
  if (!exp_year) return "Years of Coaching Experience is required.";
  if (exp_year < 0 || exp_year > 99) return "It must be between 0 - 99.";
  return null;
};

// State Validation
const validateSelectState = (state) => {
  if (!state) return "Primary Coaching State is required.";
  return null;
};


/************ TOURNAMENT ************/
// Tournament Select Category Validation
const validateSelectCategory = (category) => {
  if (!category) return "Please select a category.";
  return null;
}


/************ ACTIVITY ************/
// Select Booking Validation
const validateSelectBooking = (booking) => {
  if (!booking) return "Please select a booking.";
  return null;
}

// Select Skill Level Validation
const validateSelectSkillLevel = (skill_level) => {
  if (!skill_level) return "Please select a preferred skill level.";
  return null;
}

// Fee Validation
const validateFee = (fee) => {
  if (!fee) return "Fee Per Person (RM) is required.";
  return null;
}

// Max Player Validation
const validateMaxPlayer = (max_player) => {
  if (!max_player) return "Max Players is required.";
  return null;
}


export const validate = (formData, role = null, context) => {
  const errors = {};

  switch (context) {
    case 'registerPlayer': {
      const nameError = validateName(formData.name);
      if (nameError) errors.name = nameError;

      const genderError = validateGender(formData.gender);
      if (genderError) errors.gender = genderError;

      const dobError = validateDateOfBirth(formData.date_of_birth, 'Player');
      if (dobError) errors.date_of_birth = dobError;

      const emailError = validateEmail(formData.email);
      if (emailError) errors.email = emailError;

      const phoneError = validatePlayerPhone(formData.phone_no);
      if (phoneError) errors.phone_no = phoneError;
      
      const passwordErrors = validatePasswords(formData.password, formData.password_confirmation);
      if (passwordErrors) Object.assign(errors, passwordErrors);
      
      break;
    }
    
    case 'registerOwner': {
      const nameError = validateName(formData.name);
      if (nameError) errors.name = nameError;

      const genderError = validateGender(formData.gender);
      if (genderError) errors.gender = genderError;

      const dobError = validateDateOfBirth(formData.date_of_birth, 'Owner');
      if (dobError) errors.date_of_birth = dobError;

      const emailError = validateEmail(formData.email);
      if (emailError) errors.email = emailError;

      const phoneError = validateOwnerPhone(formData.phone_no);
      if (phoneError) errors.phone_no = phoneError;
      
      const passwordErrors = validatePasswords(formData.password, formData.password_confirmation);
      if (passwordErrors) Object.assign(errors, passwordErrors);

      const companyNameError = validateCompanyName(formData.company_name);
      if (companyNameError) errors.company_name = companyNameError;

      const brnError = validateBRN(formData.business_reg_no);
      if (brnError) errors.business_reg_no = brnError;
      
      break;
    }

    case 'updateUserProfile': {
      const nameError = validateName(formData.name);
      if (nameError) errors.name = nameError;

      const genderError = validateGender(formData.gender);
      if (genderError) errors.gender = genderError;

      const dobError = validateDateOfBirth(formData.date_of_birth, role);
      if (dobError) errors.date_of_birth = dobError;

      const emailError = validateEmail(formData.email);
      if (emailError) errors.email = emailError;

      const phoneError = role === 'Player' ? validatePlayerPhone(formData.phone_no) : validateOwnerPhone(formData.phone_no);
      if (phoneError) errors.phone_no = phoneError;

      break;
    }

    case 'updateCoachProfile': {
      const bioError = validateBio(formData.bio);
      if (bioError) errors.bio = bioError;

      const expYearError = validateExpYear(formData.exp_year);
      if (expYearError) errors.exp_year = expYearError;

      break;
    }

    case 'changePassword': {
      const currentPasswordError = validateCurrentPassword(formData.current_password);
      if (currentPasswordError) errors.current_password = currentPasswordError;

      const newPasswordError = validateNewPassword(formData.current_password, formData.password);
      if (newPasswordError) errors.password = newPasswordError;

      const passwordErrors = validatePasswords(formData.password, formData.password_confirmation);
      if (passwordErrors) Object.assign(errors, passwordErrors);

      break;
    }

    case 'registerTournament': {
      const categoryError = validateSelectCategory(formData.category_id);
      if (categoryError) errors.category_id = categoryError;

      const ecPhoneNoError = validatePlayerPhone(formData.ec_phone_no);
      if (ecPhoneNoError) errors.ec_phone_no = ecPhoneNoError;

      break;
    }

    case 'activityForm': {
      const bookingError = validateSelectBooking(formData.booking_id);
      if (bookingError) errors.booking_id = bookingError;

      const skillLevelError = validateSelectSkillLevel(formData.skill_level_id);
      if (skillLevelError) errors.skill_level_id = skillLevelError;

      const feeError = validateFee(formData.fee);
      if (feeError) errors.fee = feeError;

      const maxPlayerError = validateMaxPlayer(formData.max_player);
      if (maxPlayerError) errors.max_player = maxPlayerError;

      break;
    }

    case 'coachApplication': {
      const bioError = validateBio(formData.bio);
      if (bioError) errors.bio = bioError;

      const expYearError = validateExpYear(formData.exp_year);
      if (expYearError) errors.exp_year = expYearError;

      const stateError = validateSelectState(formData.state_id);
      if (stateError) errors.state_id = stateError;

      break;
    }
    
    default:
      throw new Error(`Invalid validation context: ${context}`);
  }

  return errors;
};