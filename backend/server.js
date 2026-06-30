const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const authRoutes = require("./routes/authRoutes");
const candidateRoutes = require("./routes/candidateRoutes");
const User = require("./models/User");

// Load Environment Variables
dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/candidates", candidateRoutes);

// Health Check
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Reliabilix API is running" });
});

// Database Seed Helper
const seedUsers = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log("No users found in database. Seeding default roles...");

      const defaultUsers = [
        {
          name: "System Admin",
          email: "admin@reliabilix.com",
          password: "admin123",
          role: "admin",
          department: "Administration",
        },
        {
          name: "CS Teacher",
          email: "teacher@reliabilix.com",
          password: "teacher123",
          role: "teacher",
          department: "Computer Science",
        },
        {
          name: "Talent Acquisition HR",
          email: "hr@reliabilix.com",
          password: "hr123",
          role: "hr",
          department: "Human Resources",
        },
      ];

      for (const u of defaultUsers) {
        const newUser = new User(u);
        await newUser.save();
        console.log(`Seeded user: ${u.email} (${u.role})`);
      }
    }
  } catch (err) {
    console.error("Error seeding default users:", err);
  }
};

// Database Connection
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("FATAL ERROR: MONGO_URI is not defined in .env file.");
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log("Connected to MongoDB Atlas successfully.");
    await seedUsers();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err.message);
    process.exit(1);
  });
