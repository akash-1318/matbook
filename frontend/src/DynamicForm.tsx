import React from "react";
import { useForm } from "@tanstack/react-form";
import type { FormField, FormSchema, SubmissionData } from "./types";

interface Props {
  schema: FormSchema;
  onSubmit: (values: SubmissionData) => void | Promise<void>;
  isSubmitting?: boolean;
  initialValues?: SubmissionData;
  submitLabel?: string;
}

type FormValues = Record<string, unknown>;

function validateFieldValue(
  field: FormField,
  rawValue: unknown
): string | undefined {
  const { type, required, validation = {}, options = [] } = field;

  const isEmpty = (value: unknown) => {
    if (value === null || value === undefined) return true;
    if (typeof value === "string" && value.trim() === "") return true;
    if (Array.isArray(value) && value.length === 0) return true;
    return false;
  };

  if (required && isEmpty(rawValue)) {
    return "This field is required.";
  }
  if (!required && isEmpty(rawValue)) {
    return undefined;
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
      return undefined;
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
      return undefined;
    }
    case "select": {
      if (typeof rawValue !== "string") return "Must be a string.";
      const allowed = options.map((o) => o.value);
      if (allowed.length && !allowed.includes(rawValue)) {
        return "Invalid option selected.";
      }
      return undefined;
    }
    case "multi-select": {
      if (!Array.isArray(rawValue)) return "Must be an array.";
      const allowed = options.map((o) => o.value);
      if (allowed.length) {
        const invalid = rawValue.some((v) => !allowed.includes(String(v)));
        if (invalid) return "Contains invalid option(s).";
      }
      if (validation.minSelected && rawValue.length < validation.minSelected) {
        return `Select at least ${validation.minSelected} option(s).`;
      }
      if (validation.maxSelected && rawValue.length > validation.maxSelected) {
        return `Select at most ${validation.maxSelected} option(s).`;
      }
      return undefined;
    }
    case "date": {
      if (typeof rawValue !== "string") {
        return "Must be a date string (YYYY-MM-DD).";
      }
      const date = new Date(rawValue);
      if (Number.isNaN(date.getTime())) return "Invalid date.";
      if (validation.minDate) {
        const min = new Date(validation.minDate);
        if (date < min)
          return `Date must be on or after ${validation.minDate}.`;
      }
      return undefined;
    }
    case "switch": {
      if (typeof rawValue !== "boolean") return "Must be a boolean.";
      return undefined;
    }
    default:
      return undefined;
  }
}

const DynamicForm: React.FC<Props> = ({
  schema,
  onSubmit,
  isSubmitting,
  initialValues,
  submitLabel,
}) => {
  const defaultValues = React.useMemo<FormValues>(() => {
    const result: FormValues = {};
    schema.fields.forEach((field) => {
      const existing = initialValues ? initialValues[field.name] : undefined;
      if (existing !== undefined) {
        result[field.name] = existing;
      } else if (field.type === "multi-select") {
        result[field.name] = [];
      } else if (field.type === "switch") {
        result[field.name] = false;
      } else {
        result[field.name] = "";
      }
    });
    return result;
  }, [schema, initialValues]);

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      await onSubmit(value as SubmissionData);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    form.handleSubmit();
  };

  const renderField = (fieldApi: any, config: FormField) => {
    const { type, name, label, placeholder, required, options } = config;

    const error =
      fieldApi.state.meta.isTouched && !fieldApi.state.meta.isValid
        ? fieldApi.state.meta.errors.join(", ")
        : null;

    const labelNode = (
      <label
        htmlFor={name}
        className="block text-sm font-medium text-slate-700"
      >
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
    );

    const helpText = error ? (
      <p className="mt-1 text-xs text-red-600">{error}</p>
    ) : (
      placeholder && (
        <p className="mt-1 text-xs text-slate-500">{placeholder}</p>
      )
    );

    switch (type) {
      case "text":
      case "number":
      case "date": {
        const inputType =
          type === "text" ? "text" : type === "number" ? "number" : "date";
        return (
          <div className="space-y-1" key={name}>
            {labelNode}
            <input
              id={name}
              name={name}
              type={inputType}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              value={String(fieldApi.state.value ?? "")}
              onBlur={fieldApi.handleBlur}
              onChange={(e) => {
                const value =
                  type === "number"
                    ? e.target.value === ""
                      ? ""
                      : Number(e.target.value)
                    : e.target.value;
                fieldApi.handleChange(value);
              }}
            />
            {helpText}
          </div>
        );
      }
      case "textarea":
        return (
          <div className="space-y-1" key={name}>
            {labelNode}
            <textarea
              id={name}
              name={name}
              rows={4}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              value={String(fieldApi.state.value ?? "")}
              onBlur={fieldApi.handleBlur}
              onChange={(e) => fieldApi.handleChange(e.target.value)}
            />
            {helpText}
          </div>
        );
      case "select":
        return (
          <div className="space-y-1" key={name}>
            {labelNode}
            <select
              id={name}
              name={name}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              value={String(fieldApi.state.value ?? "")}
              onBlur={fieldApi.handleBlur}
              onChange={(e) => fieldApi.handleChange(e.target.value)}
            >
              <option value="">{placeholder || "Select an option"}</option>
              {options?.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {helpText}
          </div>
        );
      case "multi-select": {
        const current = Array.isArray(fieldApi.state.value)
          ? fieldApi.state.value.map(String)
          : [];
        return (
          <div className="space-y-1" key={name}>
            {labelNode}
            <select
              id={name}
              name={name}
              multiple
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              value={current}
              onBlur={fieldApi.handleBlur}
              onChange={(e) => {
                const selected = Array.from(e.target.selectedOptions).map(
                  (opt) => opt.value
                );
                fieldApi.handleChange(selected);
              }}
            >
              {options?.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {helpText}
          </div>
        );
      }
      case "switch": {
        const checked = Boolean(fieldApi.state.value);
        return (
          <div className="flex items-center gap-2" key={name}>
            <label
              htmlFor={name}
              className="inline-flex items-center gap-2 text-sm text-slate-700"
            >
              <input
                id={name}
                name={name}
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                checked={checked}
                onBlur={fieldApi.handleBlur}
                onChange={(e) => fieldApi.handleChange(e.target.checked)}
              />
              <span>{label}</span>
            </label>
          </div>
        );
      }
      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        {schema.fields.map((field) => (
          <form.Field
            key={field.name}
            name={field.name}
            validators={{
              onChange: ({ value }) => validateFieldValue(field, value),
              onBlur: ({ value }) => validateFieldValue(field, value),
            }}
          >
            {(fieldApi) => renderField(fieldApi, field)}
          </form.Field>
        ))}
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isSubmitting ? "Submitting…" : submitLabel || "Submit"}
        </button>
      </div>
    </form>
  );
};

export default DynamicForm;
