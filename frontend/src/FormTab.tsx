import React from "react";
import { useCreateSubmission, useFormSchema } from "./hooks";
import DynamicForm from "./DynamicForm";
import type { SubmissionData } from "./types";

const FormPage: React.FC = () => {
  const { data, isLoading, isError } = useFormSchema();
  const createMutation = useCreateSubmission();
  const [message, setMessage] = React.useState<string | null>(null);

  const schema = data ?? null;

  const handleSubmit = async (values: SubmissionData) => {
    setMessage(null);
    try {
      await createMutation.mutateAsync(values);
      setMessage("Employee data saved successfully.");
    } catch (e) {
      console.error(e);
      setMessage("Failed to submit...");
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-md border border-slate-200 bg-white p-4 text-sm text-slate-600">
        Loading form schema…
      </div>
    );
  }

  if (isError || !schema) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        Could not load form schema.
      </div>
    );
  }

  return (
    <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-lg font-medium text-slate-900">{schema.title}</h2>
      {schema.description && (
        <p className="mt-1 text-sm text-slate-600">{schema.description}</p>
      )}

      {message && (
        <p
          className="mt-2 text-xs text-slate-600 bg-green-100 p-1.5 rounded-[5px]"
          role="status"
        >
          {message}
        </p>
      )}

      <div className="mt-4">
        <DynamicForm
          schema={schema}
          onSubmit={handleSubmit}
          isSubmitting={createMutation.isPending}
        />
      </div>
    </div>
  );
};

export default FormPage;
