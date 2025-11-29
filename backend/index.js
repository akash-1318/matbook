import express from "express";
import cors from "cors";
import { v4 as uuid } from "uuid";
import { formSchema, validateSubmission } from "./utils.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/api/form-schema", (req, res) => {
  res.json(formSchema);
});

app.post("/api/submissions", (req, res) => {
  const data = req.body || {};
  const { isValid, errors } = validateSubmission(data);

  if (!isValid) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  const submission = {
    id: uuid(),
    data,
    createdAt: new Date().toISOString(),
  };

  submissions.push(submission);

  res.status(201).json({
    success: true,
    submission,
  });
});

app.get("/api/submissions", (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 5;
  const sortOrder = req.query.sortOrder === "asc" ? "asc" : "desc";

  const sorted = [...submissions].sort((a, b) => {
    const aTime = new Date(a.createdAt).getTime();
    const bTime = new Date(b.createdAt).getTime();
    return sortOrder === "asc" ? aTime - bTime : bTime - aTime;
  });

  const totalItems = sorted.length;
  const totalPages = totalItems === 0 ? 1 : Math.ceil(totalItems / limit);
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const start = (safePage - 1) * limit;
  const pageItems = sorted.slice(start, start + limit);

  res.json({
    success: true,
    data: pageItems,
    pagination: {
      page: safePage,
      limit,
      totalItems,
      totalPages,
    },
    sort: {
      sortBy: "createdAt",
      sortOrder,
    },
  });
});

app.put("/api/submissions/:id", (req, res) => {
  const { id } = req.params;
  const data = req.body || {};
  const { isValid, errors } = validateSubmission(data);

  if (!isValid) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  const index = submissions.findIndex((s) => s.id === id);
  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: "Submission not found",
    });
  }

  submissions[index] = {
    ...submissions[index],
    data,
  };

  res.json({
    success: true,
    submission: submissions[index],
  });
});

app.delete("/api/submissions/:id", (req, res) => {
  const { id } = req.params;
  const index = submissions.findIndex((s) => s.id === id);

  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: "Submission not found",
    });
  }

  const [removed] = submissions.splice(index, 1);

  res.json({
    success: true,
    submission: removed,
  });
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
