import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { FaPlus, FaSearch, FaFilePdf, FaEdit, FaTrash, FaEye, FaExchangeAlt } from "react-icons/fa";
import ScoreBar from "../components/ScoreBar";
import GradeBadge from "../components/GradeBadge";

export default function Candidates() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const { role } = useAuth();
  
  // Filters state
  const [search, setSearch] = useState("");
  const [grade, setGrade] = useState("");
  const [department, setDepartment] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  
  // Departments list for filter
  const [departments, setDepartments] = useState([]);

  // Comparison state
  const [compareIds, setCompareIds] = useState([]);
  const navigate = useNavigate();

  const isWriteAllowed = role === "admin" || role === "teacher";

  const fetchCandidates = () => {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    if (grade) params.grade = grade;
    if (department) params.department = department;
    if (sortBy) params.sortBy = sortBy;
    if (sortOrder) params.sortOrder = sortOrder;

    axios
      .get("http://localhost:5000/api/candidates", { params })
      .then((res) => {
        setCandidates(res.data);
        // Extract unique departments for dropdown
        if (res.data) {
          const uniqueDepts = [...new Set(res.data.map((c) => c.department))];
          setDepartments(uniqueDepts);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch candidates error:", err);
        toast.error("Failed to load candidate list.");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCandidates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grade, department, sortBy, sortOrder]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCandidates();
  };

  const handleCompareCheckbox = (id) => {
    if (compareIds.includes(id)) {
      setCompareIds(compareIds.filter((item) => item !== id));
    } else {
      if (compareIds.length >= 4) {
        toast.error("You can compare up to 4 candidates at once.");
        return;
      }
      setCompareIds([...compareIds, id]);
    }
  };

  const triggerCompare = () => {
    if (compareIds.length < 2) {
      toast.error("Please select at least 2 candidates to compare.");
      return;
    }
    navigate(`/compare?ids=${compareIds.join(",")}`);
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete candidate ${name}?`)) {
      try {
        await axios.delete(`http://localhost:5000/api/candidates/${id}`);
        toast.success("Candidate record deleted successfully.");
        setCompareIds(compareIds.filter((item) => item !== id));
        fetchCandidates();
      } catch (err) {
        console.error("Delete candidate error:", err);
        toast.error(err.response?.data?.error || "Failed to delete candidate.");
      }
    }
  };

  const downloadPDF = (id, name) => {
    const toastId = toast.loading("Generating PDF...");
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
        link.setAttribute("download", `${name.replace(/\s+/g, "_")}_reliability_report.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        toast.success("PDF report downloaded successfully!");
      })
      .catch((error) => {
        toast.dismiss(toastId);
        console.error("PDF download error:", error);
        toast.error("Failed to download PDF report.");
      });
  };

  return (
    <div className="main-content">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h2 style={{ fontSize: "1.75rem", fontWeight: "700" }}>Candidates Directory</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
            Search, filter, compare, and manage candidate reliability records.
          </p>
        </div>

        <div style={{ display: "flex", gap: "1rem" }}>
          {compareIds.length >= 2 && (
            <button onClick={triggerCompare} className="btn-small" style={{ backgroundColor: "var(--secondary)", color: "white", borderColor: "var(--secondary)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <FaExchangeAlt /> Compare Selected ({compareIds.length})
            </button>
          )}

          {isWriteAllowed && (
            <Link to="/candidates/add" className="btn-primary" style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.6rem 1.2rem", fontSize: "0.95rem" }}>
              <FaPlus /> Add Candidate
            </Link>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <form onSubmit={handleSearchSubmit} className="filter-bar">
        <div style={{ display: "flex", flex: 1, gap: "0.5rem" }}>
          <input
            type="text"
            placeholder="Search by name, email, roll no..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="btn-small" style={{ display: "flex", alignItems: "center", padding: "0.6rem", border: "1px solid var(--border)", background: "white", cursor: "pointer" }}>
            <FaSearch />
          </button>
        </div>

        <select value={grade} onChange={(e) => setGrade(e.target.value)}>
          <option value="">All Grades</option>
          <option value="Excellent">Excellent</option>
          <option value="Good">Good</option>
          <option value="Average">Average</option>
          <option value="Poor">Poor</option>
        </select>

        <select value={department} onChange={(e) => setDepartment(e.target.value)}>
          <option value="">All Departments</option>
          {departments.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>

        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="createdAt">Date Created</option>
          <option value="name">Name</option>
          <option value="reliabilityScore">Reliability Score</option>
        </select>

        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="desc">Descending</option>
          <option value="asc">Ascending</option>
        </select>
      </form>

      {/* Table List */}
      <div className="table-container">
        {loading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>Loading records...</div>
        ) : candidates.length > 0 ? (
          <table className="table-candidate">
            <thead>
              <tr>
                <th style={{ width: "40px" }}>Comp</th>
                <th>Roll No</th>
                <th>Name</th>
                <th>Department</th>
                <th>Reliability Score</th>
                <th>Grade</th>
                <th>Status</th>
                <th style={{ textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {candidates.map((cand) => (
                <tr key={cand._id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={compareIds.includes(cand._id)}
                      onChange={() => handleCompareCheckbox(cand._id)}
                      style={{ cursor: "pointer", width: "16px", height: "16px" }}
                    />
                  </td>
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
                    <span style={{ color: cand.verified ? "var(--success)" : "var(--text-muted)", fontWeight: cand.verified ? 600 : 500 }}>
                      {cand.verified ? "Verified" : "Pending"}
                    </span>
                  </td>
                  <td>
                    <div className="action-btn-group">
                      <Link to={`/candidates/${cand._id}`} className="btn-icon view" title="View Profile">
                        <FaEye />
                      </Link>

                      <button onClick={() => downloadPDF(cand._id, cand.name)} className="btn-icon download" title="Download Report PDF">
                        <FaFilePdf />
                      </button>

                      {isWriteAllowed && (
                        <>
                          <Link to={`/candidates/edit/${cand._id}`} className="btn-icon edit" title="Edit Record">
                            <FaEdit />
                          </Link>
                          <button onClick={() => handleDelete(cand._id, cand.name)} className="btn-icon delete" title="Delete Record">
                            <FaTrash />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: "4rem", textAlign: "center", color: "var(--text-muted)" }}>
            <h3>No candidates found</h3>
            <p>Try modifying your search query or filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
