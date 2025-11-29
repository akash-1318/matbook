import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    createSubmission,
  deleteSubmission,
  fetchFormSchema,
  fetchSubmissions,
  updateSubmission
} from "./api";
import type { SubmissionData } from "./types";

export function useFormSchema() {
  return useQuery({
    queryKey: ["formSchema"],
    queryFn: fetchFormSchema
  });
}

export function useCreateSubmission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: SubmissionData) => createSubmission(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["submissions"] });
    }
  });
}

export function useSubmissions(page: number, limit: number, sortOrder: "asc" | "desc") {
  return useQuery({
    queryKey: ["submissions", page, limit, sortOrder],
    queryFn: () => fetchSubmissions({ page, limit, sortOrder }),
  });
}

export function useUpdateSubmission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { id: string; data: SubmissionData }) =>
      updateSubmission(input.id, input.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["submissions"] });
    }
  });
}

export function useDeleteSubmission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteSubmission(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["submissions"] });
    }
  });
}
