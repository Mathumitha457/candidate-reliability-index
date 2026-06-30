import React from "react";

export default function GradeBadge({ grade }) {
  if (!grade) return null;
  const normalizedGrade = grade.toLowerCase();
  return (
    <span className={`badge-grade ${normalizedGrade}`}>
      {grade}
    </span>
  );
}
