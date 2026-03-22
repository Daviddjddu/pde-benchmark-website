import React, { useMemo, useState } from "react";
import benchmarks from "./benchmarks_first50.json";

function BenchmarkCard({ item, visibleFields, compact }) {
  return (
    <div
      style={{
        border: "1px solid #d9d9d9",
        borderRadius: 16,
        padding: 20,
        background: "white",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      }}
    >
      <div style={{ marginBottom: 12 }}>
        <h2 style={{ margin: 0, fontSize: 22 }}>
          {item.id}. {item.title}
        </h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
          <span style={badgeStyle("#eef2ff", "#3730a3")}>{item.family}</span>
          <span style={badgeStyle("#f8fafc", "#334155")}>{item.dimensions}</span>
          <span style={badgeStyle("#f8fafc", "#334155")}>
            {item.steady ? "steady" : "time-dependent"}
          </span>
          <span style={badgeStyle(item.hasAnalytic ? "#ecfdf5" : "#fff7ed", item.hasAnalytic ? "#166534" : "#9a3412")}>
            {item.hasAnalytic ? "analytic / exact rep." : "numerical only"}
          </span>
        </div>
      </div>

      {visibleFields.description && section("Description", item.description)}
      {visibleFields.applicationField && item.applicationField && section("Used in", item.applicationField)}
      {visibleFields.domain && section("Domain", item.benchmarkInfo?.domain || "")}
      {visibleFields.bc && section("Boundary conditions", item.benchmarkInfo?.boundary_conditions || "")}
      {visibleFields.ic && !compact && section("Initial conditions", item.benchmarkInfo?.initial_conditions || "")}
      {visibleFields.parameters && !compact && section("Parameters", item.benchmarkInfo?.parameters || "")}
      {visibleFields.analytic && section("Analytic solution / note", item.benchmarkInfo?.analytic_solution || "")}

      {visibleFields.tags && item.tags?.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
          {item.tags.map((tag) => (
            <span key={tag} style={badgeStyle("#f8fafc", "#334155")}>
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function section(title, text) {
  if (!text) return null;
  return (
    <div style={{ marginTop: 14 }}>
      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 14, lineHeight: 1.6, color: "#334155" }}>{text}</div>
    </div>
  );
}

function badgeStyle(background, color) {
  return {
    display: "inline-block",
    padding: "4px 10px",
    borderRadius: 999,
    background,
    color,
    fontSize: 12,
    fontWeight: 600,
  };
}

export default function App() {
  const [query, setQuery] = useState("");
  const [family, setFamily] = useState("all");
  const [analyticFilter, setAnalyticFilter] = useState("all");
  const [applicationFilter, setApplicationFilter] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [visibleFields, setVisibleFields] = useState({
    description: true,
    applicationField: true,
    domain: true,
    bc: true,
    ic: true,
    parameters: true,
    analytic: true,
    tags: true,
  });

  const families = useMemo(() => ["all", ...new Set(benchmarks.map((b) => b.family).filter(Boolean))], []);
  const applicationFields = useMemo(
    () => ["all", ...new Set(benchmarks.map((b) => b.applicationField).filter(Boolean))],
    []
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return benchmarks.filter((item) => {
      const text = [
        item.id,
        item.title,
        item.family,
        item.applicationField,
        item.description,
        item.benchmarkInfo?.domain,
        item.benchmarkInfo?.boundary_conditions,
        item.benchmarkInfo?.initial_conditions,
        item.benchmarkInfo?.parameters,
        item.benchmarkInfo?.analytic_solution,
        ...(item.tags || []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesQuery = q === "" || text.includes(q);
      const matchesFamily = family === "all" || item.family === family;
      const matchesAnalytic =
        analyticFilter === "all" ||
        (analyticFilter === "yes" && item.hasAnalytic) ||
        (analyticFilter === "no" && !item.hasAnalytic);
      const matchesApplication = applicationFilter === "all" || item.applicationField === applicationFilter;

      return matchesQuery && matchesFamily && matchesAnalytic && matchesApplication;
    });
  }, [query, family, analyticFilter, applicationFilter]);

  const setField = (key, value) => {
    setVisibleFields((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", padding: 24, fontFamily: "Arial, sans-serif" }}>
      <div
        style={{
          maxWidth: 1400,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "280px 1fr",
          gap: 24,
        }}
      >
        <aside
          style={{
            background: "white",
            border: "1px solid #d9d9d9",
            borderRadius: 16,
            padding: 20,
            height: "fit-content",
            position: "sticky",
            top: 24,
          }}
        >
          <h1 style={{ marginTop: 0, fontSize: 24 }}>PDE Benchmark Browser</h1>

          <div style={{ marginBottom: 16 }}>
            <div style={labelStyle}>Search</div>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search PDE, BC, domain..."
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={labelStyle}>Family</div>
            <select value={family} onChange={(e) => setFamily(e.target.value)} style={inputStyle}>
              {families.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={labelStyle}>Exact solution</div>
            <select value={analyticFilter} onChange={(e) => setAnalyticFilter(e.target.value)} style={inputStyle}>
              <option value="all">All</option>
              <option value="yes">Has analytic / exact representation</option>
              <option value="no">Numerical only</option>
            </select>
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={labelStyle}>Used in</div>
            <select value={applicationFilter} onChange={(e) => setApplicationFilter(e.target.value)} style={inputStyle}>
              {applicationFields.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>

          <hr style={{ margin: "20px 0" }} />

          <div style={{ marginBottom: 12, fontWeight: 700, fontSize: 14 }}>Visible sections</div>
          <div style={{ display: "grid", gap: 8 }}>
            {[
              ["description", "Description"],
              ["applicationField", "Used in / field"],
              ["domain", "Domain"],
              ["bc", "Boundary conditions"],
              ["ic", "Initial conditions"],
              ["parameters", "Parameters"],
              ["analytic", "Analytic note"],
              ["tags", "Tags"],
            ].map(([key, label]) => (
              <label key={key} style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 14 }}>
                <input
                  type="checkbox"
                  checked={visibleFields[key]}
                  onChange={(e) => setField(key, e.target.checked)}
                />
                {label}
              </label>
            ))}
          </div>

          <hr style={{ margin: "20px 0" }} />

          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <button onClick={() => setViewMode("grid")} style={buttonStyle(viewMode === "grid")}>
              Grid
            </button>
            <button onClick={() => setViewMode("list")} style={buttonStyle(viewMode === "list")}>
              List
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <button
              onClick={() =>
                setVisibleFields({
                  description: true,
                  applicationField: true,
                  domain: true,
                  bc: true,
                  ic: true,
                  parameters: true,
                  analytic: true,
                  tags: true,
                })
              }
              style={plainButtonStyle}
            >
              Show all
            </button>
            <button
              onClick={() =>
                setVisibleFields({
                  description: true,
                  applicationField: true,
                  domain: false,
                  bc: false,
                  ic: false,
                  parameters: false,
                  analytic: false,
                  tags: false,
                })
              }
              style={plainButtonStyle}
            >
              Minimal
            </button>
          </div>
        </aside>

        <main>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 30 }}>Browse PDE Benchmarks</h2>
              <p style={{ margin: "6px 0 0 0", color: "#475569" }}>
                Filter what users see: description, benchmark details, application field, analytic notes, and more.
              </p>
            </div>
            <div style={badgeStyle("#eef2ff", "#3730a3")}>{filtered.length} results</div>
          </div>

          <div
            style={{
              display: "grid",
              gap: 16,
              gridTemplateColumns: viewMode === "grid" ? "repeat(auto-fit, minmax(420px, 1fr))" : "1fr",
            }}
          >
            {filtered.map((item) => (
              <BenchmarkCard key={item.id} item={item} visibleFields={visibleFields} compact={viewMode === "grid"} />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

const labelStyle = {
  fontWeight: 700,
  fontSize: 14,
  marginBottom: 6,
};

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #cbd5e1",
  fontSize: 14,
  boxSizing: "border-box",
};

function buttonStyle(active) {
  return {
    flex: 1,
    padding: "10px 12px",
    borderRadius: 10,
    border: active ? "1px solid #1d4ed8" : "1px solid #cbd5e1",
    background: active ? "#dbeafe" : "white",
    cursor: "pointer",
    fontWeight: 600,
  };
}

const plainButtonStyle = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #cbd5e1",
  background: "white",
  cursor: "pointer",
  fontWeight: 600,
};
