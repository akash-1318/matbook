import React from "react";
import "./App.css";
import FormPage from "./FormPage";

type Tab = "form" | "submissions";

function App() {
  const [tab, setTab] = React.useState<Tab>("form");
  return (
    <div className="min-h-screen bg-slate-100">
      <main className="mx-auto max-w-5xl p-4">
        <header className="mb-4 border-b border-slate-200 pb-3">
          <h1 className="text-xl font-semibold text-slate-900">
            MatBook – Employee Onboarding Form
          </h1>
        </header>
        <div className="mb-4 flex gap-2 border-b border-slate-200">
          <button
            type="button"
            onClick={() => setTab("form")}
            className={`border-b-2 px-3 py-2 text-sm ${
              tab === "form"
                ? "border-sky-500 text-sky-600"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            Form
          </button>
          <button
            type="button"
            onClick={() => setTab("submissions")}
            className={`border-b-2 px-3 py-2 text-sm ${
              tab === "submissions"
                ? "border-sky-500 text-sky-600"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            Submissions
          </button>
        </div>
        {tab === "form" ? <FormPage /> : ""}
      </main>
    </div>
  );
}

export default App;
