import express from "express";
import cors from "cors";
import { formSchema } from "./utils.js";

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

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
