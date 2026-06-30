import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import { FaUsers, FaChartBar, FaGraduationCap, FaCheckCircle, FaChevronRight } from "react-icons/fa";
import ScoreBar from "../components/ScoreBar";
import GradeBadge from "../components/GradeBadge";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/candidates/stats")
      .then((res) => {
        setStats(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Dashboard stats error:", err);
        setError("Failed to load dashboard metrics.");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
        <p>Loading dashboard statistics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "3rem", textAlign: "center", color: "var(--danger)" }}>
        <h3>Error</h3>
        <p>{error}</p>
      </div>
    );
  }

  if (!stats) return null;

  // Doughnut Grade Data
  const gradeData = {
    labels: ["Excellent (≥85)", "Good (≥70)", "Average (≥50)", "Poor (<50)"],
    datasets: [
      {
        data: [
          stats.grades?.Excellent || 0,
          stats.grades?.Good || 0,
          stats.grades?.Average || 0,
          stats.grades?.Poor || 0,
        ],
        backgroundColor: ["#10b981", "#0ea5e9", "#f59e0b", "#ef4444"],
        borderColor: ["#ffffff", "#ffffff", "#ffffff", "#ffffff"],
        borderWidth: 2,
      },
    ],
  };

  // Bar Department Data
  const deptData = {
    labels: stats.deptAverages?.map((d) => d.name) || [],
    datasets: [
      {
        label: "Average Score",
        data: stats.deptAverages?.map((d) => d.average) || [],
        backgroundColor: "#4f46e5",
        borderRadius: 6,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    scales: {
      y: {
        min: 0,
        max: 100,
      },
    },
  };

  return (
    <div className="main-content">
      <div style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.75rem", fontWeight: "700" }}>Dashboard Overview</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>Reliability performance metrics and analytics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid-stats">
        <div className="card-stat">
          <div className="stat-info">
            <h3>Total Candidates</h3>
            <p>{stats.totalCandidates}</p>
          </div>
          <div className="stat-icon primary">
            <FaUsers />
          </div>
        </div>

        <div className="card-stat">
          <div className="stat-info">
            <h3>Avg Reliability Index</h3>
            <p>{stats.avgScore}%</p>
          </div>
          <div className="stat-icon secondary">
            <FaChartBar />
          </div>
        </div>

        <div className="card-stat">
          <div className="stat-info">
            <h3>Avg Performance</h3>
            <p>{stats.avgPerformance}%</p>
          </div>
          <div className="stat-icon success">
            <FaGraduationCap />
          </div>
        </div>

        <div className="card-stat">
          <div className="stat-info">
            <h3>Avg Attendance</h3>
            <p>{stats.avgAttendance}%</p>
          </div>
          <div className="stat-icon success" style={{ backgroundColor: "#e0f2fe", color: "var(--secondary)" }}>
            <FaCheckCircle />
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        <div className="card-chart">
          <h3 className="chart-header">Grade Distribution</h3>
          <div style={{ maxWidth: "280px", margin: "0 auto" }}>
            <Doughnut data={gradeData} />
          </div>
        </div>

        <div className="card-chart">
          <h3 className="chart-header">Department Performance Averages</h3>
          {stats.deptAverages && stats.deptAverages.length > 0 ? (
            <Bar data={deptData} options={barOptions} />
          ) : (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "200px", color: "var(--text-muted)" }}>
              No department data available
            </div>
          )}
        </div>
      </div>

      {/* Top 5 Table */}
      <div style={{ marginTop: "2.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h3 style={{ fontSize: "1.2rem", fontWeight: "700" }}>Top Performing Candidates</h3>
          <Link to="/candidates" className="btn-small" style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
            View All <FaChevronRight style={{ fontSize: "0.75rem" }} />
          </Link>
        </div>

        <div className="table-container">
          <table className="table-candidate">
            <thead>
              <tr>
                <th>Roll No</th>
                <th>Candidate Name</th>
                <th>Department</th>
                <th>Reliability Index</th>
                <th>Grade</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {stats.topCandidates && stats.topCandidates.length > 0 ? (
                stats.topCandidates.map((cand) => (
                  <tr key={cand._id}>
                    <td style={{ fontWeight: 600 }}>{cand.rollNumber}</td>
                    <td>{cand.name}</td>
                    <td>{cand.department}</td>
                    <td>
                      <ScoreBar score={cand.reliabilityScore} />
                    </td>
                    <td>
                      <GradeBadge grade={cand.grade} />
                    </td>
                    <td>
                      <Link to={`/candidates/${cand._id}`} className="btn-small">
                        View Profile
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
                    No candidate records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
