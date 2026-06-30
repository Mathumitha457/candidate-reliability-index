import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { FaChevronLeft } from "react-icons/fa";
import CandidateForm from "../components/CandidateForm";

export default function EditCandidate() {
  const { id } = useParams();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/candidates/${id}`)
      .then((res) => {
        setCandidate(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Load candidate error:", err);
        toast.error("Failed to load candidate details for editing.");
        setLoading(false);
      });
  }, [id]);

  const handleSubmit = (values) => {
    setIsSubmitting(true);
    axios
      .put(`http://localhost:5000/api/candidates/${id}`, values)
      .then((res) => {
        toast.success(`Candidate ${res.data.name} updated successfully.`);
        navigate("/candidates");
      })
      .catch((err) => {
        console.error("Update candidate error:", err);
        toast.error(err.response?.data?.error || "Failed to update candidate.");
        setIsSubmitting(false);
      });
  };

  return (
    <div className="main-content">
      <div style={{ marginBottom: "2rem" }}>
        <Link to="/candidates" className="btn-small" style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", marginBottom: "1rem" }}>
          <FaChevronLeft style={{ fontSize: "0.8rem" }} /> Back to Directory
        </Link>
        <h2 style={{ fontSize: "1.75rem", fontWeight: "700", color: "var(--text-main)" }}>Edit Candidate Record</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
          Update the profile information and reliability metrics for the candidate.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem" }}>Loading candidate details...</div>
      ) : candidate ? (
        <CandidateForm initialValues={candidate} onSubmit={handleSubmit} isSubmitting={isSubmitting} submitButtonText="Update Candidate" />
      ) : (
        <div style={{ textAlign: "center", padding: "3rem", color: "var(--danger)" }}>Candidate record not found.</div>
      )}
    </div>
  );
}
