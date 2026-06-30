import React from "react";
import ScoreBar from "./ScoreBar";
import GradeBadge from "./GradeBadge";

export default function CompareCard({ candidate, onRemove }) {
  if (!candidate) return null;

  return (
    <div className="compare-card">
      <div className="compare-card-header">
        <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: "700" }}>{candidate.name}</h3>
        <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
          Roll No: {candidate.rollNumber} | {candidate.department}
        </p>
        <button className="compare-remove-btn" onClick={() => onRemove(candidate._id)} title="Remove from comparison">
          &times;
        </button>
      </div>

      <div className="compare-card-body">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <div>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", textTransform: "uppercase", fontWeight: "600", letterSpacing: "0.02em" }}>Reliability Score</span>
            <strong style={{ fontSize: "1.5rem", color: "var(--primary)", fontWeight: "800" }}>{candidate.reliabilityScore} / 100</strong>
          </div>
          <GradeBadge grade={candidate.grade} />
        </div>

        <div className="compare-metric" style={{ marginBottom: "1.2rem" }}>
          <div className="compare-metric-name" style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.25rem", fontWeight: "500" }}>Attendance (25%)</div>
          <ScoreBar score={candidate.attendance} />
        </div>
        <div className="compare-metric" style={{ marginBottom: "1.2rem" }}>
          <div className="compare-metric-name" style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.25rem", fontWeight: "500" }}>Performance (35%)</div>
          <ScoreBar score={candidate.performance} />
        </div>
        <div className="compare-metric" style={{ marginBottom: "1.2rem" }}>
          <div className="compare-metric-name" style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.25rem", fontWeight: "500" }}>Internship (20%)</div>
          <ScoreBar score={candidate.internship} />
        </div>
        <div className="compare-metric" style={{ marginBottom: "1.2rem" }}>
          <div className="compare-metric-name" style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.25rem", fontWeight: "500" }}>Behavior (20%)</div>
          <ScoreBar score={candidate.behavior} />
        </div>

        <div style={{ borderTop: "1px solid var(--border)", paddingTop: "1rem", marginTop: "1rem", fontSize: "0.85rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)" }}>
            <span>Verified:</span>
            <span style={{ fontWeight: 600, color: candidate.verified ? "var(--success)" : "var(--danger)" }}>
              {candidate.verified ? "Verified" : "Unverified"}
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)", marginTop: "0.25rem" }}>
            <span>Evaluator:</span>
            <span>{candidate.uploadedBy?.name || "N/A"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
