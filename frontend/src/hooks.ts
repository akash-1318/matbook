import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    createSubmission,
  fetchFormSchema
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