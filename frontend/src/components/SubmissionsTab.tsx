import React from "react";
import type { Submission } from "../types";
import SubmissionsTable from "./SubmissionsTable";
import EditSubmissionModal from "./EditSubmissionModal";

const SubmissionsPage: React.FC = () => {
  const [page, setPage] = React.useState(1);
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("desc");
  const [editing, setEditing] = React.useState<Submission | null>(null);

  return (
    <div className="space-y-3">
      <SubmissionsTable
        page={page}
        sortOrder={sortOrder}
        onPageChange={setPage}
        onSortOrderChange={setSortOrder}
        onEdit={setEditing}
      />
      <EditSubmissionModal
        open={!!editing}
        submission={editing}
        onClose={() => setEditing(null)}
      />
    </div>
  );
};

export default SubmissionsPage;
