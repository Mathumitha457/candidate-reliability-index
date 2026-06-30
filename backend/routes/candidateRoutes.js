const express = require("express");
const router = express.Router();
const multer = require("multer");
const csv = require("csv-parser");
const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");
const Candidate = require("../models/Candidate");
const { protect, authorize } = require("../middleware/authMiddleware");
const { sendLowScoreAlert } = require("../utils/emailService");

// Ensure upload directory exists
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({ dest: uploadDir });

// @desc    Get all candidates (with search, filter, sort)
// @route   GET /api/candidates
// @access  Private (Teacher sees own; Admin/HR see all)
router.get("/", protect, async (req, res) => {
  try {
    const { search, grade, department, sortBy, sortOrder } = req.query;

    const query = {};

    // Role restriction
    if (req.user.role === "teacher") {
      query.uploadedBy = req.user._id;
    }

    // Search filter (name, email, rollNumber)
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { rollNumber: { $regex: search, $options: "i" } },
      ];
    }

    // Grade filter
    if (grade) {
      query.grade = grade;
    }

    // Department filter
    if (department) {
      query.department = { $regex: `^${department}$`, $options: "i" };
    }

    // Sorting
    const sort = {};
    if (sortBy) {
      const order = sortOrder === "desc" ? -1 : 1;
      sort[sortBy] = order;
    } else {
      sort.createdAt = -1; // Default newest
    }

    const candidates = await Candidate.find(query)
      .populate("uploadedBy", "name email role")
      .sort(sort);

    res.json(candidates);
  } catch (error) {
    console.error("Get candidates error:", error);
    res.status(500).json({ error: error.message });
  }
});

// @desc    Get dashboard statistics
// @route   GET /api/candidates/stats
// @access  Private
router.get("/stats", protect, async (req, res) => {
  try {
    const query = {};
    if (req.user.role === "teacher") {
      query.uploadedBy = req.user._id;
    }

    const candidates = await Candidate.find(query);

    const totalCandidates = candidates.length;

    // Averages
    let avgAttendance = 0;
    let avgPerformance = 0;
    let avgInternship = 0;
    let avgBehavior = 0;
    let avgScore = 0;

    // Grade breakdown
    const grades = { Excellent: 0, Good: 0, Average: 0, Poor: 0 };
    // Department breakdown
    const depts = {};

    if (totalCandidates > 0) {
      let sumAttendance = 0, sumPerformance = 0, sumInternship = 0, sumBehavior = 0, sumScore = 0;

      candidates.forEach((c) => {
        sumAttendance += c.attendance;
        sumPerformance += c.performance;
        sumInternship += c.internship;
        sumBehavior += c.behavior;
        sumScore += c.reliabilityScore;

        if (grades[c.grade] !== undefined) {
          grades[c.grade] += 1;
        }

        if (!depts[c.department]) {
          depts[c.department] = { sum: 0, count: 0 };
        }
        depts[c.department].sum += c.reliabilityScore;
        depts[c.department].count += 1;
      });

      avgAttendance = Math.round(sumAttendance / totalCandidates);
      avgPerformance = Math.round(sumPerformance / totalCandidates);
      avgInternship = Math.round(sumInternship / totalCandidates);
      avgBehavior = Math.round(sumBehavior / totalCandidates);
      avgScore = Math.round(sumScore / totalCandidates);
    }

    const deptAverages = Object.keys(depts).map((name) => ({
      name,
      average: Math.round(depts[name].sum / depts[name].count),
      count: depts[name].count,
    }));

    // Top 5 candidates
    const topCandidates = [...candidates]
      .sort((a, b) => b.reliabilityScore - a.reliabilityScore)
      .slice(0, 5);

    res.json({
      totalCandidates,
      avgAttendance,
      avgPerformance,
      avgInternship,
      avgBehavior,
      avgScore,
      grades,
      deptAverages,
      topCandidates,
    });
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({ error: error.message });
  }
});

// @desc    Compare multiple candidates side-by-side
// @route   GET /api/candidates/compare
// @access  Private
router.get("/compare", protect, async (req, res) => {
  try {
    const { ids } = req.query;
    if (!ids) {
      return res.status(400).json({ error: "Candidate IDs required for comparison" });
    }

    const idList = ids.split(",").map((id) => id.trim());
    const candidates = await Candidate.find({ _id: { $in: idList } }).populate("uploadedBy", "name email");

    res.json(candidates);
  } catch (error) {
    console.error("Comparison error:", error);
    res.status(500).json({ error: error.message });
  }
});

// @desc    Get candidate by ID
// @route   GET /api/candidates/:id
// @access  Private
router.get("/:id", protect, async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id).populate("uploadedBy", "name email");
    if (!candidate) {
      return res.status(404).json({ error: "Candidate not found" });
    }

    // Role-aware security: Teachers can only view their own uploaded candidates
    if (req.user.role === "teacher" && candidate.uploadedBy._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Unauthorized access to this candidate record" });
    }

    res.json(candidate);
  } catch (error) {
    console.error("Get candidate error:", error);
    res.status(500).json({ error: error.message });
  }
});

// @desc    Add a candidate manually
// @route   POST /api/candidates
// @access  Private (Teacher/Admin only)
router.post("/", protect, authorize("teacher", "admin"), async (req, res) => {
  try {
    const { name, email, rollNumber, department, attendance, performance, internship, behavior } = req.body;

    // Check unique email/rollNumber
    const existingEmail = await Candidate.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ error: "Email is already registered to a candidate" });
    }

    const existingRoll = await Candidate.findOne({ rollNumber });
    if (existingRoll) {
      return res.status(400).json({ error: "Roll Number is already registered to a candidate" });
    }

    const candidate = new Candidate({
      name,
      email,
      rollNumber,
      department,
      attendance,
      performance,
      internship,
      behavior,
      uploadedBy: req.user._id,
      verified: req.body.verified || false,
    });

    await candidate.save();

    // Trigger low score alert if needed
    if (candidate.reliabilityScore < 50) {
      await sendLowScoreAlert(candidate);
    }

    res.status(201).json(candidate);
  } catch (error) {
    console.error("Create candidate error:", error);
    res.status(400).json({ error: error.message });
  }
});

// @desc    Update a candidate
// @route   PUT /api/candidates/:id
// @access  Private (Teacher/Admin only)
router.put("/:id", protect, authorize("teacher", "admin"), async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) {
      return res.status(404).json({ error: "Candidate not found" });
    }

    // Security check: Teacher can only update their own candidates
    if (req.user.role === "teacher" && candidate.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Not authorized to update this candidate record" });
    }

    const updates = req.body;
    const fieldsToUpdate = ["name", "email", "rollNumber", "department", "attendance", "performance", "internship", "behavior", "verified"];

    fieldsToUpdate.forEach((field) => {
      if (updates[field] !== undefined) {
        candidate[field] = updates[field];
      }
    });

    await candidate.save();

    // Trigger email notification if score falls below 50
    if (candidate.reliabilityScore < 50) {
      await sendLowScoreAlert(candidate);
    }

    res.json(candidate);
  } catch (error) {
    console.error("Update candidate error:", error);
    res.status(400).json({ error: error.message });
  }
});

// @desc    Delete a candidate
// @route   DELETE /api/candidates/:id
// @access  Private (Teacher/Admin only)
router.delete("/:id", protect, authorize("teacher", "admin"), async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) {
      return res.status(404).json({ error: "Candidate not found" });
    }

    // Security check: Teacher can only delete their own candidates
    if (req.user.role === "teacher" && candidate.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Not authorized to delete this candidate record" });
    }

    await candidate.deleteOne();
    res.json({ message: "Candidate deleted successfully" });
  } catch (error) {
    console.error("Delete candidate error:", error);
    res.status(500).json({ error: error.message });
  }
});

// @desc    Bulk upload candidates via CSV
// @route   POST /api/candidates/bulk-upload
// @access  Private (Teacher/Admin only)
router.post("/bulk-upload", protect, authorize("teacher", "admin"), upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Please upload a CSV file" });
  }

  const tempFilePath = req.file.path;
  const candidatesToAdd = [];
  const errors = [];
  let rowCount = 0;

  fs.createReadStream(tempFilePath)
    .pipe(csv())
    .on("data", (row) => {
      rowCount++;
      // Clean headers and values
      const cleaned = {};
      for (let key in row) {
        cleaned[key.trim().toLowerCase().replace(/\s+/g, "")] = row[key].trim();
      }

      const name = cleaned.name;
      const email = cleaned.email;
      const rollNumber = cleaned.rollnumber || cleaned.roll_number || cleaned.rollNo || cleaned.rollno;
      const department = cleaned.department || cleaned.dept;
      const attendance = parseInt(cleaned.attendance) || 0;
      const performance = parseInt(cleaned.performance) || 0;
      const internship = parseInt(cleaned.internship) || 0;
      const behavior = parseInt(cleaned.behavior) || parseInt(cleaned.behaviour) || 0;

      if (!name || !email || !rollNumber || !department) {
        errors.push(`Row ${rowCount}: Missing required field (name, email, rollNumber, department)`);
        return;
      }

      candidatesToAdd.push({
        name,
        email,
        rollNumber,
        department,
        attendance,
        performance,
        internship,
        behavior,
        uploadedBy: req.user._id,
        verified: false,
      });
    })
    .on("end", async () => {
      // Clean up temp file
      try {
        fs.unlinkSync(tempFilePath);
      } catch (err) {
        console.error("Failed to delete temp file:", err);
      }

      const savedCandidates = [];
      const duplicateErrors = [];

      for (let i = 0; i < candidatesToAdd.length; i++) {
        const item = candidatesToAdd[i];
        try {
          // Double check database unique constraints
          const dupEmail = await Candidate.findOne({ email: item.email });
          if (dupEmail) {
            duplicateErrors.push(`Row ${i + 1} (${item.name}): Email ${item.email} already exists`);
            continue;
          }
          const dupRoll = await Candidate.findOne({ rollNumber: item.rollNumber });
          if (dupRoll) {
            duplicateErrors.push(`Row ${i + 1} (${item.name}): Roll number ${item.rollNumber} already exists`);
            continue;
          }

          const candidate = new Candidate(item);
          await candidate.save();
          savedCandidates.push(candidate);

          // If low score, alert admins
          if (candidate.reliabilityScore < 50) {
            await sendLowScoreAlert(candidate);
          }
        } catch (err) {
          duplicateErrors.push(`Row ${i + 1} (${item.name}): ${err.message}`);
        }
      }

      const totalErrors = [...errors, ...duplicateErrors];
      res.json({
        message: `Successfully processed ${savedCandidates.length} out of ${candidatesToAdd.length} candidates.`,
        successCount: savedCandidates.length,
        failCount: totalErrors.length,
        errors: totalErrors,
      });
    })
    .on("error", (error) => {
      console.error("CSV parse error:", error);
      res.status(500).json({ error: "Failed to parse CSV file: " + error.message });
    });
});

// @desc    Export candidate PDF report
// @route   GET /api/candidates/:id/export-pdf
// @access  Private
router.get("/:id/export-pdf", protect, async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id).populate("uploadedBy", "name email");
    if (!candidate) {
      return res.status(404).json({ error: "Candidate not found" });
    }

    // Role restrictions: Teachers can only export their own candidate's PDF
    if (req.user.role === "teacher" && candidate.uploadedBy._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Not authorized to export this candidate's report" });
    }

    const doc = new PDFDocument({ size: "A4", margin: 50 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${candidate.name}_reliability_report.pdf"`);

    doc.pipe(res);

    // Styling Colors
    const primaryColor = "#4f46e5";
    const darkTextColor = "#1e293b";
    const lightGray = "#f8fafc";
    const borderColor = "#e2e8f0";

    // Grade colors
    let gradeColor = "#10b981"; // Success (Excellent)
    if (candidate.grade === "Good") gradeColor = "#0ea5e9";
    else if (candidate.grade === "Average") gradeColor = "#f59e0b";
    else if (candidate.grade === "Poor") gradeColor = "#ef4444";

    // Header Title
    doc.fillColor(primaryColor).fontSize(26).font("Helvetica-Bold").text("RELIABILIX", 50, 50);
    doc.fillColor(darkTextColor).fontSize(12).font("Helvetica").text("Candidate Reliability Index Report", 50, 80);
    doc.strokeColor(borderColor).lineWidth(1).moveTo(50, 95).lineTo(545, 95).stroke();

    // Date Info
    doc.fillColor("#64748b").fontSize(9).text(`Generated Date: ${new Date().toLocaleDateString()}`, 400, 50, { align: "right" });
    doc.text(`Candidate ID: ${candidate._id}`, 400, 65, { align: "right" });

    doc.moveDown(3);

    // Profile Details Card
    doc.fillColor(lightGray).rect(50, 110, 495, 110).fill();
    doc.strokeColor(borderColor).rect(50, 110, 495, 110).stroke();

    doc.fillColor(darkTextColor).fontSize(14).font("Helvetica-Bold").text("Candidate Profile", 70, 125);
    doc.fontSize(10).font("Helvetica").text(`Name: ${candidate.name}`, 70, 150);
    doc.text(`Email: ${candidate.email}`, 70, 168);
    doc.text(`Roll Number: ${candidate.rollNumber}`, 300, 150);
    doc.text(`Department: ${candidate.department}`, 300, 168);
    doc.text(`Verified: ${candidate.verified ? "Verified" : "Unverified"}`, 70, 190);
    doc.text(`Uploaded By: ${candidate.uploadedBy.name} (${candidate.uploadedBy.role})`, 300, 190);

    // Score Card
    doc.fillColor(lightGray).rect(50, 240, 495, 75).fill();
    doc.strokeColor(borderColor).rect(50, 240, 495, 75).stroke();

    doc.fillColor(darkTextColor).fontSize(14).font("Helvetica-Bold").text("Reliability Score & Grade", 70, 255);
    doc.fontSize(22).fillColor(primaryColor).font("Helvetica-Bold").text(`${candidate.reliabilityScore} / 100`, 70, 278);

    doc.fillColor(gradeColor).fontSize(16).text(candidate.grade, 350, 278, { width: 150, align: "right" });

    // Metric breakdown
    doc.moveDown(7);
    doc.fillColor(darkTextColor).fontSize(14).font("Helvetica-Bold").text("Performance Metric Breakdown", 50, 340);
    doc.strokeColor(borderColor).lineWidth(1).moveTo(50, 355).lineTo(545, 355).stroke();

    const metrics = [
      { name: "Attendance (25% weight)", score: candidate.attendance, value: Math.round(candidate.attendance * 0.25) },
      { name: "Performance (35% weight)", score: candidate.performance, value: Math.round(candidate.performance * 0.35) },
      { name: "Internship (20% weight)", score: candidate.internship, value: Math.round(candidate.internship * 0.20) },
      { name: "Behavior (20% weight)", score: candidate.behavior, value: Math.round(candidate.behavior * 0.20) },
    ];

    let startY = 375;
    metrics.forEach((metric) => {
      doc.fillColor(darkTextColor).fontSize(11).font("Helvetica-Bold").text(metric.name, 50, startY);
      doc.fillColor("#475569").fontSize(10).font("Helvetica").text(`Score: ${metric.score}%  (Weighted: ${metric.value} pts)`, 400, startY, { align: "right" });

      // Draw Progress Bar
      doc.fillColor("#e2e8f0").rect(50, startY + 15, 495, 10).fill();
      doc.fillColor(primaryColor).rect(50, startY + 15, Math.max(0, Math.min(495, (metric.score / 100) * 495)), 10).fill();

      startY += 45;
    });

    // Notes/Footer
    doc.strokeColor(borderColor).lineWidth(1).moveTo(50, 600).lineTo(545, 600).stroke();
    doc.fillColor("#64748b").fontSize(9).font("Helvetica-Oblique").text("This is an automatically generated reliability evaluation report by Reliabilix. Candidates are evaluated based on real-time observations, attendance records, technical internship performances, and professional behavior metrics.", 50, 615, { width: 495, align: "center" });

    doc.end();
  } catch (error) {
    console.error("PDF generation error:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message });
    }
  }
});

module.exports = router;
