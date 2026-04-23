const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// ─── MongoDB Connection ───────────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// ─── Schemas ──────────────────────────────────────────────────────────────────
const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const grievanceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: {
    type: String,
    enum: ["Academic", "Hostel", "Transport", "Other"],
    required: true,
  },
  date: { type: Date, default: Date.now },
  status: { type: String, enum: ["Pending", "Resolved"], default: "Pending" },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
});

const Student = mongoose.model("Student", studentSchema);
const Grievance = mongoose.model("Grievance", grievanceSchema);

// ─── Auth Middleware ──────────────────────────────────────────────────────────
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized: No token" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.studentId = decoded.id;
    next();
  } catch {
    res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};

// ─── Auth Routes ──────────────────────────────────────────────────────────────
// POST /api/register
app.post("/api/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields are required" });

    const existing = await Student.findOne({ email });
    if (existing)
      return res.status(409).json({ message: "Email already registered" });

    const hashed = await bcrypt.hash(password, 10);
    const student = await Student.create({ name, email, password: hashed });
    res.status(201).json({ message: "Registered successfully", studentId: student._id });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// POST /api/login
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const student = await Student.findOne({ email });
    if (!student)
      return res.status(401).json({ message: "Invalid email or password" });

    const match = await bcrypt.compare(password, student.password);
    if (!match)
      return res.status(401).json({ message: "Invalid email or password" });

    const token = jwt.sign({ id: student._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.json({ token, name: student.name, email: student.email });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ─── Grievance Routes (Protected) ────────────────────────────────────────────
// POST /api/grievances
app.post("/api/grievances", authMiddleware, async (req, res) => {
  try {
    const { title, description, category } = req.body;
    if (!title || !description || !category)
      return res.status(400).json({ message: "All fields are required" });

    const grievance = await Grievance.create({
      title,
      description,
      category,
      studentId: req.studentId,
    });
    res.status(201).json(grievance);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET /api/grievances
app.get("/api/grievances", authMiddleware, async (req, res) => {
  try {
    const grievances = await Grievance.find({ studentId: req.studentId }).sort({
      date: -1,
    });
    res.json(grievances);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET /api/grievances/search?title=xyz
app.get("/api/grievances/search", authMiddleware, async (req, res) => {
  try {
    const { title } = req.query;
    const grievances = await Grievance.find({
      studentId: req.studentId,
      title: { $regex: title, $options: "i" },
    });
    res.json(grievances);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET /api/grievances/:id
app.get("/api/grievances/:id", authMiddleware, async (req, res) => {
  try {
    const grievance = await Grievance.findOne({
      _id: req.params.id,
      studentId: req.studentId,
    });
    if (!grievance) return res.status(404).json({ message: "Grievance not found" });
    res.json(grievance);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// PUT /api/grievances/:id
app.put("/api/grievances/:id", authMiddleware, async (req, res) => {
  try {
    const grievance = await Grievance.findOneAndUpdate(
      { _id: req.params.id, studentId: req.studentId },
      req.body,
      { new: true }
    );
    if (!grievance) return res.status(404).json({ message: "Grievance not found" });
    res.json(grievance);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// DELETE /api/grievances/:id
app.delete("/api/grievances/:id", authMiddleware, async (req, res) => {
  try {
    const grievance = await Grievance.findOneAndDelete({
      _id: req.params.id,
      studentId: req.studentId,
    });
    if (!grievance) return res.status(404).json({ message: "Grievance not found" });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
