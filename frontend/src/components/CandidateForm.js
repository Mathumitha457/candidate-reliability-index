import React, { useState, useEffect } from "react";
import GradeBadge from "./GradeBadge";

export default function CandidateForm({ initialValues, onSubmit, isSubmitting, submitButtonText = "Save Candidate" }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [department, setDepartment] = useState("");
  const [verified, setVerified] = useState(false);

  const [attendance, setAttendance] = useState(75);
  const [performance, setPerformance] = useState(75);
  const [internship, setInternship] = useState(75);
  const [behavior, setBehavior] = useState(75);

  const [liveScore, setLiveScore] = useState(75);
  const [liveGrade, setLiveGrade] = useState("Good");

  // Load initial values if editing
  useEffect(() => {
    if (initialValues) {
      setName(initialValues.name || "");
      setEmail(initialValues.email || "");
      setRollNumber(initialValues.rollNumber || "");
      setDepartment(initialValues.department || "");
      setVerified(initialValues.verified || false);
      setAttendance(initialValues.attendance ?? 75);
      setPerformance(initialValues.performance ?? 75);
      setInternship(initialValues.internship ?? 75);
      setBehavior(initialValues.behavior ?? 75);
    }
  }, [initialValues]);

  // Calculate live score and grade
  useEffect(() => {
    const score = Math.round(
      attendance * 0.25 +
      performance * 0.35 +
      internship * 0.20 +
      behavior * 0.20
    );
    setLiveScore(score);

    if (score >= 85) setLiveGrade("Excellent");
    else if (score >= 70) setLiveGrade("Good");
    else if (score >= 50) setLiveGrade("Average");
    else setLiveGrade("Poor");
  }, [attendance, performance, internship, behavior]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !email || !rollNumber || !department) {
      alert("Please fill in all required fields.");
      return;
    }
    onSubmit({
      name,
      email,
      rollNumber,
      department,
      verified,
      attendance: Number(attendance),
      performance: Number(performance),
      internship: Number(internship),
      behavior: Number(behavior),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="form-layout-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "2rem" }}>
      <div style={{ background: "white", padding: "2rem", borderRadius: "var(--radius)", border: "1px solid var(--border)", boxShadow: "var(--shadow)" }}>
        <h3 style={{ marginBottom: "1.5rem", color: "var(--text-main)", fontWeight: "700" }}>Candidate Details</h3>
        
        <div className="form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
          <div className="form-group">
            <label style={{ fontWeight: "600", fontSize: "0.85rem" }}>Full Name *</label>
            <input
              type="text"
              required
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. John Doe"
            />
          </div>
          <div className="form-group">
            <label style={{ fontWeight: "600", fontSize: "0.85rem" }}>Email Address *</label>
            <input
              type="email"
              required
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. john@example.com"
            />
          </div>
        </div>

        <div className="form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginTop: "1rem" }}>
          <div className="form-group">
            <label style={{ fontWeight: "600", fontSize: "0.85rem" }}>Roll Number *</label>
            <input
              type="text"
              required
              className="form-input"
              value={rollNumber}
              onChange={(e) => setRollNumber(e.target.value)}
              placeholder="e.g. CS202601"
            />
          </div>
          <div className="form-group">
            <label style={{ fontWeight: "600", fontSize: "0.85rem" }}>Department *</label>
            <input
              type="text"
              required
              className="form-input"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="e.g. Computer Science"
            />
          </div>
        </div>

        <div className="form-group" style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "1.5rem" }}>
          <input
            type="checkbox"
            id="verified"
            checked={verified}
            onChange={(e) => setVerified(e.target.checked)}
            style={{ width: "16px", height: "16px", cursor: "pointer" }}
          />
          <label htmlFor="verified" style={{ margin: 0, cursor: "pointer", fontWeight: "600", fontSize: "0.85rem" }}>Mark Candidate as Verified</label>
        </div>

        <h3 style={{ margin: "2rem 0 1.25rem 0", color: "var(--text-main)", fontWeight: "700", borderTop: "1px solid var(--border)", paddingTop: "1.5rem" }}>Reliability Metrics</h3>

        <div className="slider-container" style={{ marginBottom: "1.25rem" }}>
          <div className="slider-header" style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" }}>
            <label style={{ margin: 0, fontWeight: "600", fontSize: "0.85rem" }}>Attendance (25% Weight)</label>
            <span className="slider-value" style={{ fontWeight: "700", color: "var(--primary)" }}>{attendance}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            className="slider-input"
            value={attendance}
            onChange={(e) => setAttendance(Number(e.target.value))}
          />
        </div>

        <div className="slider-container" style={{ marginBottom: "1.25rem" }}>
          <div className="slider-header" style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" }}>
            <label style={{ margin: 0, fontWeight: "600", fontSize: "0.85rem" }}>Performance (35% Weight)</label>
            <span className="slider-value" style={{ fontWeight: "700", color: "var(--primary)" }}>{performance}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            className="slider-input"
            value={performance}
            onChange={(e) => setPerformance(Number(e.target.value))}
          />
        </div>

        <div className="slider-container" style={{ marginBottom: "1.25rem" }}>
          <div className="slider-header" style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" }}>
            <label style={{ margin: 0, fontWeight: "600", fontSize: "0.85rem" }}>Internship (20% Weight)</label>
            <span className="slider-value" style={{ fontWeight: "700", color: "var(--primary)" }}>{internship}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            className="slider-input"
            value={internship}
            onChange={(e) => setInternship(Number(e.target.value))}
          />
        </div>

        <div className="slider-container" style={{ marginBottom: "1.25rem" }}>
          <div className="slider-header" style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" }}>
            <label style={{ margin: 0, fontWeight: "600", fontSize: "0.85rem" }}>Behavior (20% Weight)</label>
            <span className="slider-value" style={{ fontWeight: "700", color: "var(--primary)" }}>{behavior}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            className="slider-input"
            value={behavior}
            onChange={(e) => setBehavior(Number(e.target.value))}
          />
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        <div className="score-gradient-card">
          <span style={{ fontSize: "0.8rem", opacity: 0.9, textTransform: "uppercase", fontWeight: "700", letterSpacing: "0.05em" }}>Live Score Preview</span>
          <div className="score-gradient-value" style={{ fontSize: "4.5rem", fontWeight: "800", margin: "1rem 0" }}>{liveScore}</div>
          <span style={{ fontSize: "0.85rem", opacity: 0.85, marginBottom: "1.5rem" }}>Reliability Index (Out of 100)</span>
          <GradeBadge grade={liveGrade} />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary"
          style={{ padding: "1rem", height: "auto", display: "flex", justifyContent: "center", alignItems: "center", fontWeight: "700" }}
        >
          {isSubmitting ? "Processing..." : submitButtonText}
        </button>
      </div>
    </form>
  );
}
