const validationPatterns = {
  alphanumeric: {
    pattern: "^[a-zA-Z0-9\\s]+$",
    errorMessage: "Enter Alphanumeric characters only.",
  },
  numeric: {
    pattern: "^[0-9]+$",
    errorMessage: "Enter numeric characters only.",
  },
  email: {
    pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
    errorMessage: "Enter a valid email address.",
  },
  street: {
    pattern: "^(?=.*[a-zA-Z]).{3,}$",
    errorMessage: "Street must be at least 3 characters and at least 1 Alphabet",
  },
  cityorstate: {
    pattern: "^(?=.*[a-zA-Z])[a-zA-Z0-9\\s]+$",
    errorMessage: "Must include alphabets.",
  },
  vehicleNumber: {
    pattern: "^[a-zA-Z0-9]{3,}(?:-[a-zA-Z0-9]+)?$",
    errorMessage: "Must be at least 3 alphanumeric characters without special characters",
  },
  note: {
    pattern: ".*Tot-\\d+(\\.\\d+)?.*",
    errorMessage: "Invalid, Note must contain 'Tot-' followed by a number (e.g., Tot-7.00)"
  }
};

export default validationPatterns;
