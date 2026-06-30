import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from "chart.js";
import { Radar } from "react-chartjs-2";
import { FaChevronLeft, FaFilePdf, FaExchangeAlt, FaUser, FaEnvelope, FaIdCard, FaBuilding } from "react-icons/fa";
import ScoreBar from "../components/ScoreBar";
import GradeBadge from "../components/GradeBadge";

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

export default function CandidateDetail() {
  const { id } = useParams();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
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
        toast.error("Failed to load candidate details.");
        setLoading(false);
      });
  }, [id]);

  const downloadPDF = () => {
    if (!candidate) return;
    const toastId = toast.loading("Generating PDF report...");
    axios({
      url: `http://localhost:5000/api/candidates/${id}/export-pdf`,
      method: "GET",
      responseType: "blob",
    })
      .then((response) => {
        toast.dismiss(toastId);
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `${candidate.name.replace(/\s+/g, "_")}_reliability_report.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        toast.success("PDF report downloaded.");
      })
      .catch((error) => {
        toast.dismiss(toastId);
        console.error("PDF download error:", error);
        toast.error("Failed to download PDF report.");
      });
  };

  const addToCompare = () => {
    if (!candidate) return;
    const stored = localStorage.getItem("reliabilix_compare");
    let compareList = [];
    if (stored) {
      try {
        compareList = JSON.parse(stored);
      } catch (e) {
        compareList = [];
      }
    }

    if (compareList.includes(candidate._id)) {
      toast.success("Candidate is already in the comparison list.");
      navigate(`/compare?ids=${compareList.join(",")}`);
      return;
    }

    if (compareList.length >= 4) {
      toast.error("Comparison is limited to 4 candidates. Please clear some first.");
      return;
    }

    const newList = [...compareList, candidate._id];
    localStorage.setItem("reliabilix_compare", JSON.stringify(newList));
    toast.success("Added to comparison list.");
    navigate(`/compare?ids=${newList.join(",")}`);
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
        <p>Loading candidate details...</p>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div style={{ padding: "3rem", textAlign: "center", color: "var(--danger)" }}>
        <h3>Error</h3>
        <p>Candidate not found.</p>
      </div>
    );
  }

  const radarData = {
    labels: ["Attendance", "Performance", "Internship", "Behavior"],
    datasets: [
      {
        label: candidate.name,
        data: [candidate.attendance, candidate.performance, candidate.internship, candidate.behavior],
        backgroundColor: "rgba(79, 70, 229, 0.2)",
        borderColor: "rgba(79, 70, 229, 1)",
        borderWidth: 2,
        pointBackgroundColor: "rgba(79, 70, 229, 1)",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "rgba(79, 70, 229, 1)",
      },
    ],
  };

  const radarOptions = {
    scales: {
      r: {
        angleLines: { display: true },
        suggestedMin: 0,
        suggestedMax: 100,
      },
    },
  };

  return (
    <div className="main-content">
      <div style={{ marginBottom: "2rem" }}>
        <Link to="/candidates" className="btn-small" style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", marginBottom: "1rem" }}>
          <FaChevronLeft style={{ fontSize: "0.8rem" }} /> Back to Directory
        </Link>
        <h2 style={{ fontSize: "1.75rem", fontWeight: "700", color: "var(--text-main)" }}>Candidate Profile</h2>
      </div>

      <div className="detail-layout">
        {/* Sidebar */}
        <div className="detail-sidebar">
          <div className="score-gradient-card">
            <span style={{ fontSize: "0.8rem", opacity: 0.9, textTransform: "uppercase", fontWeight: "700", letterSpacing: "0.05em" }}>Reliability Score</span>
            <div className="score-gradient-value">{candidate.reliabilityScore}</div>
            <span style={{ fontSize: "0.85rem", opacity: 0.85, marginBottom: "1.5rem" }}>Out of 100</span>
            <GradeBadge grade={candidate.grade} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <button onClick={downloadPDF} className="btn-primary" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
              <FaFilePdf /> Download PDF Report
            </button>
            <button onClick={addToCompare} className="btn-small" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", padding: "0.75rem", background: "white", color: "var(--text-main)", fontWeight: "600" }}>
              <FaExchangeAlt /> Add to Compare
            </button>
          </div>
        </div>

        {/* Main Info */}
        <div className="detail-main">
          <h3 style={{ marginBottom: "1.5rem", fontWeight: 700, color: "var(--text-main)" }}>Personal & Academic Details</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <FaUser style={{ color: "var(--primary)", fontSize: "1.25rem" }} />
              <div>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>Name</span>
                <strong style={{ color: "var(--text-main)" }}>{candidate.name}</strong>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <FaEnvelope style={{ color: "var(--primary)", fontSize: "1.25rem" }} />
              <div>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>Email</span>
                <strong style={{ color: "var(--text-main)" }}>{candidate.email}</strong>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <FaIdCard style={{ color: "var(--primary)", fontSize: "1.25rem" }} />
              <div>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>Roll Number</span>
                <strong style={{ color: "var(--text-main)" }}>{candidate.rollNumber}</strong>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <FaBuilding style={{ color: "var(--primary)", fontSize: "1.25rem" }} />
              <div>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>Department</span>
                <strong style={{ color: "var(--text-main)" }}>{candidate.department}</strong>
              </div>
            </div>
          </div>

          <hr style={{ border: 0, borderTop: "1px solid var(--border)", margin: "2rem 0" }} />

          <h3 style={{ marginBottom: "1.5rem", fontWeight: 700, color: "var(--text-main)" }}>Performance Assessment</h3>
          <div className="charts-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "2.5rem", alignItems: "center", marginTop: "0" }}>
            {/* Metric Bars */}
            <div>
              <div style={{ marginBottom: "1.25rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem", fontSize: "0.85rem", fontWeight: 600, color: "var(--text-main)" }}>
                  <span>Attendance (25% Weight)</span>
                  <span>{candidate.attendance}%</span>
                </div>
                <ScoreBar score={candidate.attendance} />
              </div>

              <div style={{ marginBottom: "1.25rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem", fontSize: "0.85rem", fontWeight: 600, color: "var(--text-main)" }}>
                  <span>Performance (35% Weight)</span>
                  <span>{candidate.performance}%</span>
                </div>
                <ScoreBar score={candidate.performance} />
              </div>

              <div style={{ marginBottom: "1.25rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem", fontSize: "0.85rem", fontWeight: 600, color: "var(--text-main)" }}>
                  <span>Internship (20% Weight)</span>
                  <span>{candidate.internship}%</span>
                </div>
                <ScoreBar score={candidate.internship} />
              </div>

              <div style={{ marginBottom: "1.25rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem", fontSize: "0.85rem", fontWeight: 600, color: "var(--text-main)" }}>
                  <span>Behavior (20% Weight)</span>
                  <span>{candidate.behavior}%</span>
                </div>
                <ScoreBar score={candidate.behavior} />
              </div>
            </div>

            {/* Radar Chart */}
            <div style={{ maxWidth: "300px", margin: "0 auto", width: "100%" }}>
              <Radar data={radarData} options={radarOptions} />
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "2.5rem", borderTop: "1px solid var(--border)", paddingTop: "1rem", flexWrap: "wrap", gap: "0.5rem" }}>
            <span>Evaluator: {candidate.uploadedBy?.name || "System"} ({candidate.uploadedBy?.role})</span>
            <span>Status: {candidate.verified ? "Verified ✅" : "Pending Verification ⏳"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
