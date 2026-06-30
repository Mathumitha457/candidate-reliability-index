import React from "react";

export default function ScoreBar({ score }) {
  const getScoreColor = (val) => {
    if (val >= 85) return "var(--success)";
    if (val >= 70) return "var(--secondary)";
    if (val >= 50) return "var(--warning)";
    return "var(--danger)";
  };

  return (
    <div className="score-bar-wrapper">
      <div className="score-bar-outer">
        <div
          className="score-bar-inner"
          style={{
            width: `${score}%`,
            backgroundColor: getScoreColor(score),
          }}
        />
      </div>
      <span className="score-text">{score}</span>
    </div>
  );
}
