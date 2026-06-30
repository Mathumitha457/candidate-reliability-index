import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from "chart.js";
import { Radar } from "react-chartjs-2";
import { FaChevronLeft, FaTrash } from "react-icons/fa";
import CompareCard from "../components/CompareCard";

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

export default function ComparePage() {
  const [searchParams] = useSearchParams();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const idsParam = searchParams.get("ids");

  useEffect(() => {
    if (!idsParam) {
      setLoading(false);
      return;
    }

    axios
      .get(`http://localhost:5000/api/candidates/compare?ids=${idsParam}`)
      .then((res) => {
        setCandidates(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Comparison load error:", err);
        toast.error("Failed to load candidates comparison.");
        setLoading(false);
      });
  }, [idsParam]);

  const handleRemove = (idToRemove) => {
    const updatedCandidates = candidates.filter((c) => c._id !== idToRemove);
    setCandidates(updatedCandidates);

    const stored = localStorage.getItem("reliabilix_compare");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        localStorage.setItem("reliabilix_compare", JSON.stringify(parsed.filter((id) => id !== idToRemove)));
      } catch (e) {}
    }

    if (updatedCandidates.length === 0) {
      navigate("/candidates");
    } else {
      const remainingIds = updatedCandidates.map((c) => c._id).join(",");
      navigate(`/compare?ids=${remainingIds}`);
    }
  };

  const handleClearAll = () => {
    localStorage.removeItem("reliabilix_compare");
    navigate("/candidates");
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
        <p>Loading comparison metrics...</p>
      </div>
    );
  }

  if (!idsParam || candidates.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "4rem" }}>
        <h3>No candidates selected for comparison</h3>
        <p>Please select candidates from the directory checklist first.</p>
        <Link to="/candidates" className="btn-primary" style={{ display: "inline-block", marginTop: "1rem" }}>
          Go to Directory
        </Link>
      </div>
    );
  }

  // Colors Palette
  const colors = [
    { border: "rgba(79, 70, 229, 1)", bg: "rgba(79, 70, 229, 0.2)" }, // Indigo
    { border: "rgba(14, 165, 233, 1)", bg: "rgba(14, 165, 233, 0.2)" }, // Sky Blue
    { border: "rgba(16, 185, 129, 1)", bg: "rgba(16, 185, 129, 0.2)" }, // Emerald Green
    { border: "rgba(245, 158, 11, 1)", bg: "rgba(245, 158, 11, 0.2)" }, // Amber Orange
  ];

  const radarData = {
    labels: ["Attendance", "Performance", "Internship", "Behavior"],
    datasets: candidates.map((cand, idx) => {
      const color = colors[idx % colors.length];
      return {
        label: cand.name,
        data: [cand.attendance, cand.performance, cand.internship, cand.behavior],
        backgroundColor: color.bg,
        borderColor: color.border,
        borderWidth: 2,
        pointBackgroundColor: color.border,
        pointBorderColor: "#fff",
      };
    }),
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <Link to="/candidates" className="btn-small" style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", marginBottom: "1rem" }}>
            <FaChevronLeft style={{ fontSize: "0.8rem" }} /> Back to Directory
          </Link>
          <h2 style={{ fontSize: "1.75rem", fontWeight: "700", color: "var(--text-main)" }}>Candidate Comparison Analysis</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
            Side-by-side reliability benchmarking with metrics overlay.
          </p>
        </div>

        <button onClick={handleClearAll} className="btn-small btn-danger" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <FaTrash /> Clear Comparison
        </button>
      </div>

      {/* Radar Overlay */}
      <div className="card-chart" style={{ maxWidth: "440px", margin: "0 auto 2.5rem auto", padding: "2rem" }}>
        <h3 className="chart-header" style={{ textAlign: "center", marginBottom: "1.5rem", color: "var(--text-main)", fontWeight: "700" }}>Metrics Overlay</h3>
        <Radar data={radarData} options={radarOptions} />
      </div>

      {/* Side-by-Side Cards */}
      <div className="compare-container">
        {candidates.map((cand) => (
          <CompareCard key={cand._id} candidate={cand} onRemove={handleRemove} />
        ))}
      </div>
    </div>
  );
}
