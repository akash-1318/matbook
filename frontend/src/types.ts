export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "select"
  | "multi-select"
  | "date"
  | "switch";
  

export interface FieldOption {
  label: string;
  value: string;
}

export interface FieldValidation {
  minLength?: number;
  maxLength?: number;
  regex?: string;
  min?: number;
  max?: number;
  minSelected?: number;
  maxSelected?: number;
  minDate?: string;
}

export interface FormField {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  required?: boolean;
  options?: FieldOption[];
  validation?: FieldValidation;
}

export interface FormSchema {
  title: string;
  description?: string;
  fields: FormField[];
}

export interface Submission {
  id: string;
  data: Record<string, unknown>;
  createdAt: string;
}

export interface PaginatedSubmissions {
  success: boolean;
  data: Submission[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
  sort: {
    sortBy: string;
    sortOrder: "asc" | "desc";
  };
}

export type SubmissionData = Record<string, unknown>;