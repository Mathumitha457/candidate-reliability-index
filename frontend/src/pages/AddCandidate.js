import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { FaChevronLeft, FaUserPlus, FaFileCsv } from "react-icons/fa";
import CandidateForm from "../components/CandidateForm";
import BulkUploadDropzone from "../components/BulkUploadDropzone";

export default function AddCandidate() {
  const [activeTab, setActiveTab] = useState("manual");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const navigate = useNavigate();

  const handleManualSubmit = (values) => {
    setIsSubmitting(true);
    axios
      .post("http://localhost:5000/api/candidates", values)
      .then((res) => {
        toast.success(`Candidate ${res.data.name} created successfully.`);
        navigate("/candidates");
      })
      .catch((err) => {
        console.error("Create candidate error:", err);
        toast.error(err.response?.data?.error || "Failed to create candidate.");
        setIsSubmitting(false);
      });
  };

  const handleBulkUpload = (file) => {
    setIsSubmitting(true);
    setUploadResult(null);
    const formData = new FormData();
    formData.append("file", file);

    axios
      .post("http://localhost:5000/api/candidates/bulk-upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => {
        setIsSubmitting(false);
        const data = res.data;
        setUploadResult(data);
        if (data.failCount === 0) {
          toast.success(`Successfully uploaded all ${data.successCount} candidates!`);
        } else if (data.successCount > 0) {
          toast.success(`Imported ${data.successCount} candidates. ${data.failCount} rows failed.`);
        } else {
          toast.error("Bulk upload completed with errors.");
        }
      })
      .catch((err) => {
        console.error("Bulk upload error:", err);
        toast.error(err.response?.data?.error || "Bulk upload failed.");
        setIsSubmitting(false);
      });
  };

  return (
    <div className="main-content">
      <div style={{ marginBottom: "2rem" }}>
        <Link to="/candidates" className="btn-small" style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", marginBottom: "1rem" }}>
          <FaChevronLeft style={{ fontSize: "0.8rem" }} /> Back to Directory
        </Link>
        <h2 style={{ fontSize: "1.75rem", fontWeight: "700", color: "var(--text-main)" }}>Add New Candidate(s)</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
          Register candidates manually or upload a CSV file for batch importing.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid var(--border)", marginBottom: "2rem" }}>
        <button
          onClick={() => setActiveTab("manual")}
          style={{
            padding: "0.75rem 1.5rem",
            background: "none",
            border: "none",
            borderBottom: activeTab === "manual" ? "2px solid var(--primary)" : "none",
            color: activeTab === "manual" ? "var(--primary)" : "var(--text-muted)",
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontSize: "0.95rem",
            outline: "none"
          }}
        >
          <FaUserPlus /> Manual Entry
        </button>
        <button
          onClick={() => setActiveTab("bulk")}
          style={{
            padding: "0.75rem 1.5rem",
            background: "none",
            border: "none",
            borderBottom: activeTab === "bulk" ? "2px solid var(--primary)" : "none",
            color: activeTab === "bulk" ? "var(--primary)" : "var(--text-muted)",
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontSize: "0.95rem",
            outline: "none"
          }}
        >
          <FaFileCsv /> Bulk CSV Upload
        </button>
      </div>

      {activeTab === "manual" ? (
        <CandidateForm onSubmit={handleManualSubmit} isSubmitting={isSubmitting} submitButtonText="Create Candidate" />
      ) : (
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          <BulkUploadDropzone onUpload={handleBulkUpload} isUploading={isSubmitting} />

          {uploadResult && (
            <div style={{ marginTop: "2rem", background: "white", padding: "1.5rem", borderRadius: "var(--radius)", border: "1px solid var(--border)", boxShadow: "var(--shadow)" }}>
              <h4 style={{ marginBottom: "1rem", color: "var(--text-main)", fontWeight: "700" }}>Upload Summary</h4>
              <p style={{ margin: "0.35rem 0", color: "var(--text-muted)" }}>
                Successful imports: <strong style={{ color: "var(--success)" }}>{uploadResult.successCount}</strong>
              </p>
              <p style={{ margin: "0.35rem 0", color: "var(--text-muted)" }}>
                Failed imports: <strong style={{ color: uploadResult.failCount > 0 ? "var(--danger)" : "var(--text-muted)" }}>{uploadResult.failCount}</strong>
              </p>

              {uploadResult.errors && uploadResult.errors.length > 0 && (
                <div style={{ marginTop: "1.25rem" }}>
                  <h5 style={{ color: "var(--danger)", marginBottom: "0.5rem", fontWeight: "600" }}>Failures Detail:</h5>
                  <div style={{ maxHeight: "200px", overflowY: "auto", background: "#f8fafc", padding: "0.75rem", borderRadius: "6px", fontSize: "0.85rem", border: "1px solid var(--border)" }}>
                    {uploadResult.errors.map((err, idx) => (
                      <div key={idx} style={{ color: "var(--danger)", marginBottom: "0.35rem" }}>
                        • {err}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
