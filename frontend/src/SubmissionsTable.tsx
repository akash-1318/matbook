import React from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { useDeleteSubmission, useFormSchema, useSubmissions } from "./hooks";
import type { PaginatedSubmissions, Submission } from "./types";

interface Props {
  page: number;
  sortOrder: "asc" | "desc";
  onPageChange: (page: number) => void;
  onSortOrderChange: (order: "asc" | "desc") => void;
  onEdit: (s: Submission) => void;
}

const PAGE_SIZE = 5;

const SubmissionsTable: React.FC<Props> = ({
  page,
  sortOrder,
  onPageChange,
  onSortOrderChange,
  onEdit,
}) => {
  const { data, isLoading, isError, error } = useSubmissions(
    page,
    PAGE_SIZE,
    sortOrder
  );
  const { data: schema } = useFormSchema();
  const deleteMutation = useDeleteSubmission();

  const apiData = data as PaginatedSubmissions | undefined;
  const submissions: Submission[] = apiData?.data ?? [];
  const pagination = apiData?.pagination;

  const columns = React.useMemo<ColumnDef<Submission>[]>(
    () => [
      {
        header: "ID",
        accessorKey: "id",
        cell: (info) => {
          const v = String(info.getValue());
          return (
            <span className="text-xs text-slate-500">{v.slice(0, 8)}…</span>
          );
        },
      },
      {
        header: "Created At",
        accessorKey: "createdAt",
        cell: (info) => {
          const v = info.getValue() as string;
          const d = new Date(v);
          return (
            <span className="text-xs text-slate-700">
              {d.toLocaleString(undefined, {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </span>
          );
        },
      },
      {
        header: "Data",
        accessorKey: "data",
        cell: (info) => {
          const row = info.row.original;
          if (!schema) {
            return (
              <pre className="whitespace-pre-wrap wrap-break-words text-xs text-slate-700">
                {JSON.stringify(row.data, null, 2)}
              </pre>
            );
          }
          return (
            <div className="space-y-1 text-xs">
              {schema.fields.map((field) => {
                const value = row.data[field.name];
                let display: string;

                if (Array.isArray(value)) {
                  display = value.join(", ");
                } else if (typeof value === "boolean") {
                  display = value ? "Yes" : "No";
                } else if (
                  value === null ||
                  value === undefined ||
                  value === ""
                ) {
                  display = "-";
                } else {
                  display = String(value);
                }

                return (
                  <div key={field.name} className="flex gap-1">
                    <span className="font-medium text-slate-600">
                      {field.label}:
                    </span>
                    <span className="text-slate-700">{display}</span>
                  </div>
                );
              })}
            </div>
          );
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: (info) => {
          const row = info.row.original;
          return (
            <div className="flex gap-2">
              <button
                type="button"
                className="rounded border border-slate-300 px-2 py-1 text-xs text-slate-700 hover:bg-slate-50"
                onClick={() => onEdit(row)}
              >
                Edit
              </button>
              <button
                type="button"
                className="rounded border border-red-300 px-2 py-1 text-xs text-red-700 hover:bg-red-50"
                onClick={() => {
                  if (window.confirm("Delete this submission?")) {
                    deleteMutation.mutate(row.id);
                  }
                }}
              >
                Delete
              </button>
            </div>
          );
        },
      },
    ],
    [schema, deleteMutation, onEdit]
  );

  const table = useReactTable({
    data: submissions,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const handleExportCsv = () => {
    if (!apiData || !schema) return;

    const rows = apiData.data;
    const fieldNames = schema.fields.map((f) => f.name);

    const header = ["id", "createdAt", ...fieldNames];
    const lines: string[] = [];
    lines.push(header.join(","));

    rows.forEach((row) => {
      const values = fieldNames.map((name) => {
        const raw = row.data[name];
        if (Array.isArray(raw)) {
          return `"${raw.join(" | ")}"`;
        }
        if (typeof raw === "object" && raw !== null) {
          return `"${JSON.stringify(raw)}"`;
        }
        return `"${raw ?? ""}"`;
      });

      lines.push([`"${row.id}"`, `"${row.createdAt}"`, ...values].join(","));
    });

    const blob = new Blob([lines.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "submissions.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="rounded-md border border-slate-200 bg-white p-4 text-sm text-slate-600">
        Loading submissions…
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        Failed to load submissions: {String(error)}
      </div>
    );
  }

  if (!submissions.length) {
    return (
      <div className="rounded-md border border-slate-200 bg-white p-4 text-sm text-slate-600">
        No submissions yet. Fill the form and submit to see entries here.
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-md border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <div className="text-xs text-slate-600">
          {pagination && (
            <span>
              Page {pagination.page} of {pagination.totalPages} •{" "}
              {pagination.totalItems} total
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded border border-slate-300 px-2 py-1 text-xs text-slate-700 hover:bg-slate-50"
            onClick={handleExportCsv}
          >
            Export CSV
          </button>
          <button
            type="button"
            className="rounded border border-slate-300 px-2 py-1 text-xs text-slate-700 hover:bg-slate-50"
            onClick={() =>
              onSortOrderChange(sortOrder === "asc" ? "desc" : "asc")
            }
          >
            Sort: {sortOrder === "asc" ? "Oldest first" : "Newest first"}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-left text-xs">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="border-b border-slate-200">
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-3 py-2 font-medium text-slate-700"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-3 py-2 align-top text-slate-700"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between pt-2 text-xs text-slate-600">
        <button
          type="button"
          className="rounded border border-slate-300 px-2 py-1 font-medium hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page <= 1}
        >
          Previous
        </button>
        <span>
          Page {pagination?.page} of {pagination?.totalPages}
        </span>
        <button
          type="button"
          className="rounded border border-slate-300 px-2 py-1 font-medium hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={() =>
            pagination
              ? onPageChange(Math.min(pagination.totalPages, page + 1))
              : onPageChange(page + 1)
          }
          disabled={pagination ? page >= pagination.totalPages : false}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default SubmissionsTable;
