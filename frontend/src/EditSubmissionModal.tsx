import React from "react";
import DynamicForm from "./DynamicForm";
import { useFormSchema, useUpdateSubmission } from "./hooks";
import type { Submission, SubmissionData } from "./types";

interface Props {
  open: boolean;
  submission: Submission | null;
  onClose: () => void;
}

const EditSubmissionModal: React.FC<Props> = ({ open, submission, onClose }) => {
  const { data } = useFormSchema();
  const mutation = useUpdateSubmission();

  if (!open || !submission || !data) return null;

  const handleSubmit = async (values: SubmissionData) => {
    await mutation.mutateAsync({ id: submission.id, data: values });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-2xl rounded-md bg-white p-4 shadow-lg">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-medium text-slate-900">Edit submission</h3>
          <button
            type="button"
            className="rounded-full border border-slate-300 px-2 py-1 text-xs text-slate-600 hover:bg-slate-100"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <DynamicForm
          schema={data}
          initialValues={submission.data}
          onSubmit={handleSubmit}
          isSubmitting={mutation.isPending}
          submitLabel={mutation.isPending ? "Saving…" : "Save changes"}
        />
      </div>
    </div>
  );
};

export default EditSubmissionModal;
