import React, { useState, useRef } from "react";
import { FaCloudUploadAlt, FaFileCsv } from "react-icons/fa";

export default function BulkUploadDropzone({ onUpload, isUploading }) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith(".csv")) {
        setSelectedFile(file);
      } else {
        alert("Please upload a CSV file only.");
      }
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.name.endsWith(".csv")) {
        setSelectedFile(file);
      } else {
        alert("Please upload a CSV file only.");
      }
    }
  };

  const onButtonClick = (e) => {
    e.preventDefault();
    fileInputRef.current.click();
  };

  const handleUploadClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (selectedFile) {
      onUpload(selectedFile);
    }
  };

  const clearFile = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div
      className={`dropzone-container ${dragActive ? "active" : ""}`}
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      onClick={selectedFile ? undefined : onButtonClick}
      style={{ padding: "2.5rem 1.5rem" }}
    >
      <input
        ref={fileInputRef}
        type="file"
        style={{ display: "none" }}
        accept=".csv"
        onChange={handleChange}
        disabled={isUploading}
      />

      {selectedFile ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <FaFileCsv style={{ fontSize: "3.5rem", color: "var(--success)", marginBottom: "0.75rem" }} />
          <p style={{ fontWeight: 700, marginBottom: "0.25rem", color: "var(--text-main)" }}>{selectedFile.name}</p>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "1.25rem" }}>
            {(selectedFile.size / 1024).toFixed(2)} KB
          </p>

          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button
              onClick={handleUploadClick}
              disabled={isUploading}
              className="btn-small btn-primary"
              style={{ padding: "0.5rem 1.25rem", display: "flex", alignItems: "center", gap: "0.5rem", width: "auto" }}
            >
              {isUploading ? "Uploading..." : "Process Bulk Upload"}
            </button>
            <button
              onClick={clearFile}
              disabled={isUploading}
              className="btn-small"
              style={{ backgroundColor: "white", color: "var(--text-muted)", padding: "0.5rem 1.25rem" }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <FaCloudUploadAlt className="dropzone-icon" style={{ fontSize: "3.5rem", color: "var(--primary)", opacity: 0.8, marginBottom: "0.75rem" }} />
          <p style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: "0.25rem", color: "var(--text-main)" }}>
            Drag & drop your candidate CSV file here
          </p>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1.25rem" }}>
            or click to browse your files
          </p>
          <button className="btn-small" disabled={isUploading} style={{ padding: "0.5rem 1.25rem" }}>
            Choose File
          </button>
        </div>
      )}
    </div>
  );
}
