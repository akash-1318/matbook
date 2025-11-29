import axios from "axios";
import type { FormSchema, Submission, SubmissionData } from "./types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

export async function fetchFormSchema() {
  const res = await axios.get<FormSchema>(`${API_BASE_URL}/api/form-schema`);
  return res.data;
}

export async function createSubmission(data: SubmissionData) {
  const res = await axios.post<{ success: boolean; submission: Submission }>(
    `${API_BASE_URL}/api/submissions`,
    data
  );
  return res.data.submission;
}