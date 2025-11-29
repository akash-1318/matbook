export const formSchema = {
  title: "Employee Onboarding",
  description: "Onboarding form for new employees.",
  fields: [
    {
      name: "fullName",
      label: "Full Name",
      type: "text",
      placeholder: "Enter full name",
      required: true,
      validation: { minLength: 3, maxLength: 100 },
    },
    {
      name: "email",
      label: "Email",
      type: "text",
      placeholder: "name@company.com",
      required: true,
      validation: {
        regex: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$",
      },
    },
    {
      name: "age",
      label: "Age",
      type: "number",
      placeholder: "Enter age",
      required: false,
      validation: { min: 18, max: 65 },
    },
    {
      name: "department",
      label: "Department",
      type: "select",
      placeholder: "Select department",
      required: true,
      options: [
        { label: "Engineering", value: "engineering" },
        { label: "HR", value: "hr" },
        { label: "Finance", value: "finance" },
      ],
    },
    {
      name: "skills",
      label: "Skills",
      type: "multi-select",
      placeholder: "Add skills",
      required: false,
      options: [
        { label: "JavaScript", value: "JavaScript" },
        { label: "React", value: "React" },
        { label: "Node.js", value: "Node.js" },
      ],
      validation: { minSelected: 1, maxSelected: 5 },
    },
    {
      name: "joiningDate",
      label: "Joining Date",
      type: "date",
      placeholder: "Select joining date",
      required: true,
      validation: { minDate: "2020-01-01" },
    },
    {
      name: "notes",
      label: "Notes",
      type: "textarea",
      placeholder: "Additional information",
      required: false,
      validation: { maxLength: 500 },
    },
    {
      name: "isRemote",
      label: "Remote Employee",
      type: "switch",
      required: false,
    },
  ],
};

function isEmpty(value) {
  if (value === null || value === undefined) return true;
  if (typeof value === "string" && value.trim() === "") return true;
  if (Array.isArray(value) && value.length === 0) return true;
  return false;
}

function validateField(field, rawValue) {
  const { type, required, validation = {}, options = [] } = field;

  if (required && isEmpty(rawValue)) {
    return "This field is required.";
  }
  if (!required && isEmpty(rawValue)) {
    return null;
  }

  switch (type) {
    case "text":
    case "textarea": {
      if (typeof rawValue !== "string") return "Must be a string.";
      const value = rawValue.trim();
      if (validation.minLength && value.length < validation.minLength) {
        return `Must be at least ${validation.minLength} characters.`;
      }
      if (validation.maxLength && value.length > validation.maxLength) {
        return `Must be at most ${validation.maxLength} characters.`;
      }
      if (validation.regex) {
        const regex = new RegExp(validation.regex);
        if (!regex.test(value)) return "Invalid format.";
      }
      return null;
    }
    case "number": {
      const num = Number(rawValue);
      if (Number.isNaN(num)) return "Must be a number.";
      if (validation.min !== undefined && num < validation.min) {
        return `Must be at least ${validation.min}.`;
      }
      if (validation.max !== undefined && num > validation.max) {
        return `Must be at most ${validation.max}.`;
      }
      return null;
    }
    case "select": {
      if (typeof rawValue !== "string") return "Must be a string.";
      const allowed = options.map((o) => o.value);
      if (allowed.length && !allowed.includes(rawValue)) {
        return "Invalid option selected.";
      }
      return null;
    }
    case "multi-select": {
      if (!Array.isArray(rawValue)) return "Must be an array.";

      // For skills we allow any free text values.
      if (field.name !== "skills") {
        const allowed = options.map((o) => o.value);
        if (allowed.length) {
          const invalid = rawValue.some((v) => !allowed.includes(String(v)));
          if (invalid) return "Contains invalid option(s).";
        }
      }

      if (validation.minSelected && rawValue.length < validation.minSelected) {
        return `Select at least ${validation.minSelected} option(s).`;
      }
      if (validation.maxSelected && rawValue.length > validation.maxSelected) {
        return `Select at most ${validation.maxSelected} option(s).`;
      }
      return null;
    }
    case "date": {
      if (typeof rawValue !== "string") {
        return "Must be a date string (YYYY-MM-DD).";
      }
      const date = new Date(rawValue);
      if (Number.isNaN(date.getTime())) return "Invalid date.";
      if (validation.minDate) {
        const min = new Date(validation.minDate);
        if (date < min) {
          return `Date must be on or after ${validation.minDate}.`;
        }
      }
      return null;
    }
    case "switch": {
      if (typeof rawValue !== "boolean") return "Must be a boolean.";
      return null;
    }
    default:
      return null;
  }
}

export function validateSubmission(data) {
  const errors = {};
  for (const field of formSchema.fields) {
    const value = data[field.name];
    const err = validateField(field, value);
    if (err) {
      errors[field.name] = err;
    }
  }
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
