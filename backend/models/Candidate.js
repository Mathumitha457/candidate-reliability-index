const mongoose = require("mongoose");

const CandidateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    rollNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    department: { type: String, required: true },
    attendance: { type: Number, required: true, min: 0, max: 100 },
    performance: { type: Number, required: true, min: 0, max: 100 },
    internship: { type: Number, required: true, min: 0, max: 100 },
    behavior: { type: Number, required: true, min: 0, max: 100 },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    verified: { type: Boolean, default: false },
    reliabilityScore: { type: Number },
    grade: { type: String },
  },
  { timestamps: true }
);

CandidateSchema.pre("save", function (next) {
  // Calculate reliability score
  const score = Math.round(
    this.attendance * 0.25 +
    this.performance * 0.35 +
    this.internship * 0.20 +
    this.behavior * 0.20
  );
  this.reliabilityScore = score;

  // Calculate grade
  if (score >= 85) {
    this.grade = "Excellent";
  } else if (score >= 70) {
    this.grade = "Good";
  } else if (score >= 50) {
    this.grade = "Average";
  } else {
    this.grade = "Poor";
  }

  next();
});

module.exports = mongoose.model("Candidate", CandidateSchema);
