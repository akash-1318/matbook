import React from "react";
import type { FormField } from "../types";

export const SkillsChipsField: React.FC<{
  fieldApi: any;
  config: FormField;
}> = ({ fieldApi, config }) => {
  const { name, label, placeholder, required, options = [] } = config;
  const [inputValue, setInputValue] = React.useState("");

  const error =
    fieldApi.state.meta.isTouched && !fieldApi.state.meta.isValid
      ? fieldApi.state.meta.errors.join(", ")
      : null;

  const selectedValues: string[] = Array.isArray(fieldApi.state.value)
    ? fieldApi.state.value.map((v: unknown) => String(v))
    : [];

  const handleAddSkill = (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return;

    const normalized = trimmed.replace(/\s+/g, " ");

    const exists = selectedValues.some(
      (v) => v.toLowerCase() === normalized.toLowerCase()
    );
    if (exists) return;

    fieldApi.handleChange([...selectedValues, normalized]);
  };

  const handleRemoveSkill = (value: string) => {
    const filtered = selectedValues.filter((v) => v !== value);
    fieldApi.handleChange(filtered);
  };

  const labelNode = (
    <label htmlFor={name} className="block text-sm font-medium text-slate-700">
      {label}
      {required && <span className="ml-0.5 text-red-500">*</span>}
    </label>
  );

  const helpText = error ? (
    <p className="mt-1 text-xs text-red-600">{error}</p>
  ) : (
    <p className="mt-1 text-xs text-slate-500">
      {placeholder ||
        "Type a skill (e.g. JavaScript, React, Node.js) and press Enter."}
    </p>
  );

  return (
    <div className="space-y-1" key={name}>
      {labelNode}

      <div className="mt-1 flex flex-wrap gap-2 rounded-md border border-slate-300 bg-white p-2">
        {selectedValues.map((val) => {
          const opt = options.find((o) => o.value === val);
          const display = opt?.label || val;
          return (
            <span
              key={val}
              className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2 py-0.5 text-xs text-sky-800"
            >
              <span>{display}</span>
              <button
                type="button"
                onClick={() => handleRemoveSkill(val)}
                className="rounded-full bg-sky-100 px-1 text-[10px] leading-none hover:bg-sky-200"
              >
                ×
              </button>
            </span>
          );
        })}

        <input
          id={name}
          name={name}
          className="flex-1 min-w-[120px] border-none text-xs outline-none"
          placeholder={placeholder || "Add skill and press Enter"}
          value={inputValue}
          onBlur={fieldApi.handleBlur}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              handleAddSkill(inputValue);
              setInputValue("");
            }
          }}
        />
      </div>

      {helpText}
      <p className="mt-1 text-[10px] text-slate-400">
        Available: {options.map((o) => o.label).join(", ")}
      </p>
    </div>
  );
};
