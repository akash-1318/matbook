# MatBook Assignment – Fullstack Implementation

This repo contains my implementation of the MatBook take-home assignment.

It’s a small fullstack app where:

- The **backend** exposes a dynamic form schema and stores form submissions.
- The **frontend** renders the form from that schema and shows submissions with pagination, sorting, editing, and CSV export.

I tried to keep the code readable and “real world”, without over-engineering.

---

## Tech Stack

**Frontend**

- React 19.2.0 + TypeScript
- Vite
- Tailwind CSS
- @tanstack/react-query
- @tanstack/react-form
- @tanstack/react-table

**Backend**

- Node.js
- Express
- cors, uuid
- In-memory storage (simple array) – enough for this assignment
