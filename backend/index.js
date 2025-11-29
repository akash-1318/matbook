import express from "express";
import cors from "cors";
import { v4 as uuid } from "uuid";
import { formSchema, validateSubmission } from "./utils.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(express.json());

const submissions = [];

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/form-schema", (req, res) => {
  res.json(formSchema);
});

app.post("/api/submissions", (req, res) => {
  try {
    const data = req.body && typeof req.body === "object" ? req.body : {};

    console.log("POST /api/submissions body:", JSON.stringify(data));

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

    return res.status(201).json({
      success: true,
      submission,
    });
  } catch (err) {
    console.error("Error in POST /api/submissions:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

app.get("/api/submissions", (req, res) => {
  try {
    const pageRaw = req.query.page ?? "1";
    const limitRaw = req.query.limit ?? "5";
    const sortOrderRaw = req.query.sortOrder;

    const page = parseInt(String(pageRaw), 10) || 1;
    const limit = parseInt(String(limitRaw), 10) || 5;
    const sortOrder = sortOrderRaw === "asc" ? "asc" : "desc";

    console.log("GET /api/submissions query:", { page, limit, sortOrder });

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

    return res.json({
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
  } catch (err) {
    console.error("Error in GET /api/submissions:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

app.put("/api/submissions/:id", (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body && typeof req.body === "object" ? req.body : {};

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

    return res.json({
      success: true,
      submission: submissions[index],
    });
  } catch (err) {
    console.error("Error in PUT /api/submissions/:id:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// DELETE submission
app.delete("/api/submissions/:id", (req, res) => {
  try {
    const { id } = req.params;

    const index = submissions.findIndex((s) => s.id === id);
    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: "Submission not found",
      });
    }

    const [removed] = submissions.splice(index, 1);

    return res.json({
      success: true,
      submission: removed,
    });
  } catch (err) {
    console.error("Error in DELETE /api/submissions/:id:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
