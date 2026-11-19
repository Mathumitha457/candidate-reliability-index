import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import {
  FaChartBar,
  FaCheckCircle,
  FaChevronRight,
  FaPlus,
  FaFilePdf,
  FaExchangeAlt,
  FaTrash
} from "react-icons/fa";
import {
  FiUser,
  FiSearch,
  FiSliders,
  FiUsers,
  FiBookOpen,
  FiActivity,
  FiShield
} from "react-icons/fi";
import ScoreBar from "../components/ScoreBar";
import GradeBadge from "../components/GradeBadge";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function Dashboard() {
  const { role } = useAuth();
  const navigate = useNavigate();

  // Common stats & loading states
  const [stats, setStats] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Admin Dashboard Tabs
  const [activeAdminTab, setActiveAdminTab] = useState("analytics"); // "analytics" or "users"

  // HR Dashboard Filters
  const [hrSearch, setHrSearch] = useState("");
  const [hrDept, setHrDept] = useState("");
  const [hrGrade, setHrGrade] = useState("");
  const [hrMinScore, setHrMinScore] = useState(0);
  const [hrMaxScore, setHrMaxScore] = useState(100);

  // Comparison State
  const [compareIds, setCompareIds] = useState([]);

  // Load all statistics & candidates list
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        const [statsRes, candidatesRes] = await Promise.all([
          axios.get(
            "https://candidate-reliability-index.onrender.com/api/candidates/stats"
          ),
          axios.get(
            "https://candidate-reliability-index.onrender.com/api/candidates"
          )
        ]);

        setStats(statsRes.data);
        setCandidates(candidatesRes.data);
        setLoading(false);
      } catch (err) {
        console.error("Dashboard data load error:", err);
        setError(
          "Failed to fetch dashboard metrics. Verify database connection."
        );
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Load local compare list
  useEffect(() => {
    const stored = localStorage.getItem("reliabilix_compare");

    if (stored) {
      try {
        setCompareIds(JSON.parse(stored));
      } catch (e) {
        setCompareIds([]);
      }
    }
  }, []);

  const handleCompareCheckbox = (id) => {
    let updatedList;

    if (compareIds.includes(id)) {
      updatedList = compareIds.filter((item) => item !== id);
    } else {
      if (compareIds.length >= 4) {
        toast.error("Comparison is limited to a maximum of 4 candidates.");
        return;
      }

      updatedList = [...compareIds, id];
    }

    setCompareIds(updatedList);
    localStorage.setItem("reliabilix_compare", JSON.stringify(updatedList));
  };

  const triggerCompare = () => {
    if (compareIds.length < 2) {
      toast.error("Select at least 2 candidates to compare.");
      return;
    }

    navigate(`/compare?ids=${compareIds.join(",")}`);
  };

  const downloadPDF = (id, name) => {
    const toastId = toast.loading("Generating report PDF...");

    axios({
      url: `https://candidate-reliability-index.onrender.com/api/candidates/${id}/export-pdf`,
      method: "GET",
      responseType: "blob"
    })
      .then((response) => {
        toast.dismiss(toastId);

        const url = window.URL.createObjectURL(
          new Blob([response.data])
        );

        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
          "download",
          `${name.replace(/\s+/g, "_")}_reliability_report.pdf`
        );

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

  const handleDeleteCandidate = async (id, name) => {
    if (
      window.confirm(
        `Are you sure you want to delete candidate ${name}?`
      )
    ) {
      try {
        await axios.delete(
          `https://candidate-reliability-index.onrender.com/api/candidates/${id}`
        );

        toast.success("Candidate record deleted.");

        // Refresh list
        const statsRes = await axios.get(
          "https://candidate-reliability-index.onrender.com/api/candidates/stats"
        );

        const candidatesRes = await axios.get(
          "https://candidate-reliability-index.onrender.com/api/candidates"
        );

        setStats(statsRes.data);
        setCandidates(candidatesRes.data);
      } catch (err) {
        console.error("Delete candidate error:", err);
        toast.error(
          err.response?.data?.error ||
            "Failed to delete candidate."
        );
      }
    }
  };

  if (loading) {
    return (
      <div className="loading-spinner-container">
        <div className="spinner"></div>
        <p style={{ fontWeight: 600 }}>
          Loading Portal Workspace...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="empty-state"
        style={{ borderColor: "var(--danger)" }}
      >
        <FiActivity
          className="empty-state-icon"
          style={{ color: "var(--danger)" }}
        />

        <h3>Database Connection Failed</h3>
        <p>{error}</p>
      </div>
    );
  }

  if (!stats) return null;

  // Score color ring helper
  const getScoreColor = (score) => {
    if (score >= 85) return "#10b981";
    if (score >= 70) return "#0ea5e9";
    if (score >= 50) return "#f59e0b";
    return "#ef4444";
  };

  // Unique departments helper
  const uniqueDepts = [
    ...new Set(candidates.map((c) => c.department))
  ];

  // Helper to extract unique users for admin view
  const extractUsers = () => {
    const usersMap = new Map();

    // Default seed accounts
    usersMap.set("admin@reliabilix.com", {
      name: "System Admin",
      email: "admin@reliabilix.com",
      role: "admin",
      department: "Administration"
    });

    usersMap.set("teacher@reliabilix.com", {
      name: "CS Teacher",
      email: "teacher@reliabilix.com",
      role: "teacher",
      department: "Computer Science"
    });

    usersMap.set("hr@reliabilix.com", {
      name: "Talent Acquisition HR",
      email: "hr@reliabilix.com",
      role: "hr",
      department: "Human Resources"
    });

    // Populate from candidates' uploader reference
    candidates.forEach((c) => {
      if (c.uploadedBy && c.uploadedBy.email) {
        usersMap.set(c.uploadedBy.email, {
          name: c.uploadedBy.name,
          email: c.uploadedBy.email,
          role: c.uploadedBy.role || "teacher",
          department:
            c.uploadedBy.department || "Academic Department"
        });
      }
    });

    return Array.from(usersMap.values());
  };

  // -------------------------------------------------------------
  // TEACHER DASHBOARD (Mark Entry Portal)
  // -------------------------------------------------------------
  if (role === "teacher") {
    return (
      <div className="main-content">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "2rem",
            flexWrap: "wrap",
            gap: "1rem"
          }}
        >
          <div>
            <h2
              style={{
                fontSize: "1.75rem",
                fontWeight: "800",
                color: "var(--primary)"
              }}
            >
              Mark Entry Portal
            </h2>

            <p
              style={{
                color: "var(--text-muted)",
                fontSize: "0.95rem"
              }}
            >
              Enter reliability dimensions and manage evaluations
              for your students.
            </p>
          </div>

          <Link
            to="/candidates/add"
            className="btn-primary"
            style={{
              width: "auto",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.6rem 1.2rem",
              fontSize: "0.95rem"
            }}
          >
            <FaPlus /> Add Student Score
          </Link>
        </div>

        <div className="grid-stats">
          <div className="card-stat">
            <div className="stat-info">
              <h3>My Students</h3>
              <p>{stats.totalCandidates}</p>
            </div>

            <div className="stat-icon primary">
              <FiBookOpen />
            </div>
          </div>

          <div className="card-stat">
            <div className="stat-info">
              <h3>Average Reliability Index</h3>
              <p>{stats.avgScore}%</p>
            </div>

            <div className="stat-icon success">
              <FaChartBar />
            </div>
          </div>

          <div className="card-stat">
            <div className="stat-info">
              <h3>Average Class Attendance</h3>
              <p>{stats.avgAttendance}%</p>
            </div>

            <div
              className="stat-icon success"
              style={{
                background: "#ecfdf5",
                color: "var(--success)"
              }}
            >
              <FaCheckCircle />
            </div>
          </div>
        </div>

        <div style={{ marginTop: "2rem" }}>
          <h3
            style={{
              fontSize: "1.2rem",
              fontWeight: "700",
              marginBottom: "1rem",
              color: "var(--text-main)"
            }}
          >
            My Registered Students
          </h3>

          {candidates.length > 0 ? (
            <div className="table-container">
              <table className="table-candidate">
                <thead>
                  <tr>
                    <th>Roll No</th>
                    <th>Student Name</th>
                    <th>Department</th>
                    <th>Reliability Index</th>
                    <th>Grade</th>
                    <th>Verification</th>
                    <th style={{ textAlign: "center" }}>
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {candidates.map((cand) => (
                    <tr key={cand._id}>
                      <td style={{ fontWeight: 600 }}>
                        {cand.rollNumber}
                      </td>

                      <td style={{ fontWeight: 550 }}>
                        {cand.name}
                      </td>

                      <td>{cand.department}</td>

                      <td>
                        <ScoreBar
                          score={cand.reliabilityScore}
                        />
                      </td>

                      <td>
                        <GradeBadge grade={cand.grade} />
                      </td>

                      <td>
                        <span
                          style={{
                            color: cand.verified
                              ? "var(--success)"
                              : "var(--text-muted)",
                            fontWeight: cand.verified
                              ? 600
                              : 400
                          }}
                        >
                          {cand.verified
                            ? "Verified"
                            : "Pending"}
                        </span>
                      </td>

                      <td>
                        <div className="action-btn-group">
                          <Link
                            to={`/candidates/${cand._id}`}
                            className="btn-icon view"
                            title="View"
                          >
                            <FiUser />
                          </Link>

                          <Link
                            to={`/candidates/edit/${cand._id}`}
                            className="btn-icon edit"
                            title="Edit"
                          >
                            <FaPlus />
                          </Link>

                          <button
                            onClick={() =>
                              handleDeleteCandidate(
                                cand._id,
                                cand.name
                              )
                            }
                            className="btn-icon delete"
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <FiBookOpen className="empty-state-icon" />

              <h3>No Students Uploaded</h3>

              <p>
                Get started by adding your first student's marks
                using the registration form.
              </p>

              <Link
                to="/candidates/add"
                className="btn-primary"
                style={{
                  display: "inline-block",
                  marginTop: "1rem",
                  width: "auto"
                }}
              >
                Add Student Marks
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // HR DASHBOARD (Recruitment Portal)
  // -------------------------------------------------------------
  if (role === "hr") {
    // Filter logic on candidates
    const filteredCandidates = candidates.filter((c) => {
      const matchSearch =
        c.name
          .toLowerCase()
          .includes(hrSearch.toLowerCase()) ||
        c.rollNumber
          .toLowerCase()
          .includes(hrSearch.toLowerCase()) ||
        c.email
          .toLowerCase()
          .includes(hrSearch.toLowerCase());

      const matchDept =
        hrDept === "" || c.department === hrDept;

      const matchGrade =
        hrGrade === "" || c.grade === hrGrade;

      const matchScore =
        c.reliabilityScore >= hrMinScore &&
        c.reliabilityScore <= hrMaxScore;

      return (
        matchSearch &&
        matchDept &&
        matchGrade &&
        matchScore
      );
    });

    return (
      <div className="main-content">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "2rem",
            flexWrap: "wrap",
            gap: "1rem"
          }}
        >
          <div>
            <h2
              style={{
                fontSize: "1.75rem",
                fontWeight: "800",
                color: "var(--primary)"
              }}
            >
              Recruitment Portal
            </h2>

            <p
              style={{
                color: "var(--text-muted)",
                fontSize: "0.95rem"
              }}
            >
              Evaluate candidates, filter by skills performance,
              and build comparison lists.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              gap: "0.75rem"
            }}
          >
            {compareIds.length >= 2 && (
              <button
                onClick={triggerCompare}
                className="btn-primary"
                style={{
                  width: "auto",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem"
                }}
              >
                <FaExchangeAlt /> Compare Selected (
                {compareIds.length})
              </button>
            )}
          </div>
        </div>

        <div className="hr-portal-grid">
          {/* Sidebar Filter Panel */}
          <div className="sidebar-filters">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                marginBottom: "1.5rem"
              }}
            >
              <FiSliders
                style={{
                  fontSize: "1.1rem",
                  color: "var(--primary)"
                }}
              />

              <h3
                style={{
                  fontSize: "1rem",
                  fontWeight: "750",
                  margin: 0
                }}
              >
                Filter Criteria
              </h3>
            </div>

            <div className="sidebar-section">
              <h4 className="sidebar-title">Search</h4>

              <div style={{ position: "relative" }}>
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: "2.2rem" }}
                  placeholder="Name, email, roll no..."
                  value={hrSearch}
                  onChange={(e) =>
                    setHrSearch(e.target.value)
                  }
                />

                <FiSearch
                  style={{
                    position: "absolute",
                    left: "0.8rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--text-muted)"
                  }}
                />
              </div>
            </div>

            <div className="sidebar-section">
              <h4 className="sidebar-title">
                Department
              </h4>

              <select
                className="form-input"
                value={hrDept}
                onChange={(e) =>
                  setHrDept(e.target.value)
                }
              >
                <option value="">
                  All Departments
                </option>

                {uniqueDepts.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div className="sidebar-section">
              <h4 className="sidebar-title">Grade</h4>

              <select
                className="form-input"
                value={hrGrade}
                onChange={(e) =>
                  setHrGrade(e.target.value)
                }
              >
                <option value="">
                  All Grades
                </option>

                <option value="Excellent">
                  Excellent
                </option>

                <option value="Good">Good</option>

                <option value="Average">
                  Average
                </option>

                <option value="Poor">Poor</option>
              </select>
            </div>

            <div className="sidebar-section">
              <h4 className="sidebar-title">
                Score Threshold
              </h4>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "0.8rem",
                  color: "var(--text-muted)",
                  marginBottom: "0.5rem"
                }}
              >
                <span>Min: {hrMinScore}</span>
                <span>Max: {hrMaxScore}</span>
              </div>

              <input
                type="range"
                min="0"
                max="100"
                className="slider-input"
                value={hrMinScore}
                onChange={(e) =>
                  setHrMinScore(Number(e.target.value))
                }
                style={{ marginBottom: "1rem" }}
              />

              <input
                type="range"
                min="0"
                max="100"
                className="slider-input"
                value={hrMaxScore}
                onChange={(e) =>
                  setHrMaxScore(Number(e.target.value))
                }
              />
            </div>
          </div>

          {/* Candidate Grid */}
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1rem"
              }}
            >
              <h3
                style={{
                  fontSize: "1.1rem",
                  fontWeight: "700",
                  color: "var(--text-main)"
                }}
              >
                Active Candidates (
                {filteredCandidates.length})
              </h3>
            </div>

            {filteredCandidates.length > 0 ? (
              <div className="candidate-cards-grid">
                {filteredCandidates.map((cand) => (
                  <div
                    key={cand._id}
                    className="hr-candidate-card"
                  >
                    <input
                      type="checkbox"
                      className="hr-card-compare-checkbox"
                      title="Compare candidate"
                      checked={compareIds.includes(
                        cand._id
                      )}
                      onChange={() =>
                        handleCompareCheckbox(
                          cand._id
                        )
                      }
                    />

                    <div className="hr-card-header">
                      <div className="photo-placeholder">
                        <FiUser />
                      </div>

                      <h4 className="hr-candidate-name">
                        {cand.name}
                      </h4>

                      <span className="hr-candidate-dept">
                        {cand.department}
                      </span>
                    </div>

                    <div className="hr-card-stats">
                      <div style={{ textAlign: "center" }}>
                        <span
                          style={{
                            fontSize: "0.75rem",
                            color: "var(--text-muted)",
                            display: "block"
                          }}
                        >
                          Roll No
                        </span>

                        <strong
                          style={{ fontSize: "0.9rem" }}
                        >
                          {cand.rollNumber}
                        </strong>
                      </div>

                      {/* Score Ring */}
                      <div
                        className="score-ring"
                        style={{
                          background: `conic-gradient(${getScoreColor(
                            cand.reliabilityScore
                          )} ${
                            cand.reliabilityScore * 3.6
                          }deg, #e2e8f0 0deg)`
                        }}
                      >
                        <div className="score-ring-inner">
                          {cand.reliabilityScore}
                          <span>Index</span>
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        textAlign: "center",
                        marginBottom: "1rem"
                      }}
                    >
                      <GradeBadge
                        grade={cand.grade}
                      />
                    </div>

                    <div className="hr-card-actions">
                      <Link
                        to={`/candidates/${cand._id}`}
                        className="btn-small"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "0.3rem"
                        }}
                      >
                        View Profile
                      </Link>

                      <button
                        onClick={() =>
                          downloadPDF(
                            cand._id,
                            cand.name
                          )
                        }
                        className="btn-small"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "0.3rem"
                        }}
                        title="Download PDF report"
                      >
                        <FaFilePdf /> PDF
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <FiUsers className="empty-state-icon" />

                <h3>No Matches Found</h3>

                <p>
                  No candidates fit the currently selected
                  sidebar filters. Try resetting the
                  criteria.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // ADMIN DASHBOARD (System-wide Analytics & User Directory)
  // -------------------------------------------------------------
  const adminUsersList = extractUsers();

  const totalTeachers = adminUsersList.filter(
    (u) => u.role === "teacher"
  ).length;

  const totalHR = adminUsersList.filter(
    (u) => u.role === "hr"
  ).length;

  // Doughnut Grade Data
  const gradeData = {
    labels: [
      "Excellent (≥85)",
      "Good (≥70)",
      "Average (≥50)",
      "Poor (<50)"
    ],

    datasets: [
      {
        data: [
          stats.grades?.Excellent || 0,
          stats.grades?.Good || 0,
          stats.grades?.Average || 0,
          stats.grades?.Poor || 0
        ],

        backgroundColor: [
          "#10b981",
          "#0ea5e9",
          "#f59e0b",
          "#ef4444"
        ],

        borderColor: [
          "#ffffff",
          "#ffffff",
          "#ffffff",
          "#ffffff"
        ],

        borderWidth: 2
      }
    ]
  };

  // Bar Department Data
  const deptData = {
    labels:
      stats.deptAverages?.map((d) => d.name) || [],

    datasets: [
      {
        label: "Average Score",

        data:
          stats.deptAverages?.map(
            (d) => d.average
          ) || [],

        backgroundColor: "#7c3aed",
        borderRadius: 6
      }
    ]
  };

  const barOptions = {
    responsive: true,

    scales: {
      y: {
        min: 0,
        max: 100
      }
    }
  };

  return (
    <div className="main-content">
      <div style={{ marginBottom: "2rem" }}>
        <h2
          style={{
            fontSize: "1.75rem",
            fontWeight: "800",
            color: "var(--primary)"
          }}
        >
          System Administration Portal
        </h2>

        <p
          style={{
            color: "var(--text-muted)",
            fontSize: "0.95rem"
          }}
        >
          Monitor system metrics, review candidate trends,
          and check registered users.
        </p>
      </div>

      <div className="grid-stats">
        <div className="card-stat">
          <div className="stat-info">
            <h3>Total Candidates</h3>
            <p>{stats.totalCandidates}</p>
          </div>

          <div className="stat-icon primary">
            <FiUsers />
          </div>
        </div>

        <div className="card-stat">
          <div className="stat-info">
            <h3>Avg Reliability Index</h3>
            <p>{stats.avgScore}%</p>
          </div>

          <div className="stat-icon success">
            <FaChartBar />
          </div>
        </div>

        <div className="card-stat">
          <div className="stat-info">
            <h3>Active Teachers</h3>
            <p>{totalTeachers}</p>
          </div>

          <div
            className="stat-icon success"
            style={{
              background: "#ecfdf5",
              color: "var(--success)"
            }}
          >
            <FiBookOpen />
          </div>
        </div>

        <div className="card-stat">
          <div className="stat-info">
            <h3>HR Personnel</h3>
            <p>{totalHR}</p>
          </div>

          <div className="stat-icon warning">
            <FiShield />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        <button
          onClick={() =>
            setActiveAdminTab("analytics")
          }
          className={`admin-tab ${
            activeAdminTab === "analytics"
              ? "active"
              : ""
          }`}
        >
          Analytics Overview
        </button>

        <button
          onClick={() =>
            setActiveAdminTab("users")
          }
          className={`admin-tab ${
            activeAdminTab === "users"
              ? "active"
              : ""
          }`}
        >
          User Directory ({adminUsersList.length})
        </button>
      </div>

      {activeAdminTab === "analytics" ? (
        <div>
          {/* Charts Grid */}
          <div className="charts-grid">
            <div className="card-chart">
              <h3 className="chart-header">
                Grade Distribution
              </h3>

              <div
                style={{
                  maxWidth: "260px",
                  margin: "0 auto"
                }}
              >
                <Doughnut data={gradeData} />
              </div>
            </div>

            <div className="card-chart">
              <h3 className="chart-header">
                Department Performance Averages
              </h3>

              {stats.deptAverages &&
              stats.deptAverages.length > 0 ? (
                <Bar
                  data={deptData}
                  options={barOptions}
                />
              ) : (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "200px",
                    color: "var(--text-muted)"
                  }}
                >
                  No department data available
                </div>
              )}
            </div>
          </div>

          {/* Top 5 Table */}
          <div style={{ marginTop: "2.5rem" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1rem"
              }}
            >
              <h3
                style={{
                  fontSize: "1.2rem",
                  fontWeight: "700"
                }}
              >
                System Leaderboard (Top 5 Candidates)
              </h3>

              <Link
                to="/candidates"
                className="btn-small"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.25rem"
                }}
              >
                View All{" "}
                <FaChevronRight
                  style={{ fontSize: "0.75rem" }}
                />
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
                  {stats.topCandidates &&
                  stats.topCandidates.length > 0 ? (
                    stats.topCandidates.map(
                      (cand) => (
                        <tr key={cand._id}>
                          <td
                            style={{
                              fontWeight: 600
                            }}
                          >
                            {cand.rollNumber}
                          </td>

                          <td>{cand.name}</td>

                          <td>
                            {cand.department}
                          </td>

                          <td>
                            <ScoreBar
                              score={
                                cand.reliabilityScore
                              }
                            />
                          </td>

                          <td>
                            <GradeBadge
                              grade={cand.grade}
                            />
                          </td>

                          <td>
                            <Link
                              to={`/candidates/${cand._id}`}
                              className="btn-small"
                            >
                              View Profile
                            </Link>
                          </td>
                        </tr>
                      )
                    )
                  ) : (
                    <tr>
                      <td
                        colSpan="6"
                        style={{
                          textAlign: "center",
                          padding: "2rem",
                          color: "var(--text-muted)"
                        }}
                      >
                        No candidate records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ marginTop: "1rem" }}>
          <h3
            style={{
              fontSize: "1.2rem",
              fontWeight: "700",
              marginBottom: "1rem",
              color: "var(--text-main)"
            }}
          >
            System Users
          </h3>

          <div className="table-container">
            <table className="table-candidate">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Department</th>
                  <th>Account Status</th>
                </tr>
              </thead>

              <tbody>
                {adminUsersList.map((usr) => (
                  <tr key={usr.email}>
                    <td
                      style={{
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem"
                      }}
                    >
                      <div
                        className="role-icon-circle"
                        style={{
                          width: "30px",
                          height: "30px",
                          fontSize: "0.9rem"
                        }}
                      >
                        <FiUser />
                      </div>

                      {usr.name}
                    </td>

                    <td>{usr.email}</td>

                    <td>
                      <span
                        className={`role-badge ${usr.role}`}
                      >
                        {usr.role}
                      </span>
                    </td>

                    <td>{usr.department}</td>

                    <td>
                      <span
                        style={{
                          color: "var(--success)",
                          fontWeight: 600
                        }}
                      >
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
