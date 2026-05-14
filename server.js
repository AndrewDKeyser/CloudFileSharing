require("dotenv").config(); // Ability to read .env files

const express = require("express");
const multer = require("multer");
const { Storage } = require("@google-cloud/storage");
const cors = require("cors");
const path = require("path");
 
const app = express();
const upload = multer({ storage: multer.memoryStorage() });
 
// Config
const PORT = process.env.PORT || 3000;
const BUCKET_NAME = process.env.GCS_BUCKET_NAME;
 
// Authenticate via GOOGLE_APPLICATION_CREDENTIALS env var (path to service account JSON)
const storage = new Storage();
const bucket = storage.bucket(BUCKET_NAME);
 
// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname))); // serves index.html, styles.css, app.js
 
// Upload endpoint
app.post("/upload", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file provided." });
  }
 
  const { originalname, buffer, mimetype } = req.file;
  const destination = `uploads/${Date.now()}-${originalname}`;
  const blob = bucket.file(destination);
 
  try {
    await blob.save(buffer, { contentType: mimetype, resumable: false });
 
    res.json({
      message: "File uploaded successfully.",
      fileName: originalname,
      path: destination,
    });
  } catch (err) {
    console.error("GCS upload error:", err);
    res.status(500).json({ error: "Upload to Google Cloud Storage failed.", detail: err.message });
  }
});
 
// List files endpoint
app.get("/files", async (req, res) => {
  try {
    const [files] = await bucket.getFiles({ prefix: "uploads/" });
 
    const fileList = files.map((file) => ({
      // Strip the "uploads/<timestamp>-" prefix for a clean display name
      name: file.name.replace(/^uploads\/\d+-/, ""),
      path: file.name,
      updated: file.metadata.updated,
      size: Number(file.metadata.size),
    }));
 
    res.json(fileList);
  } catch (err) {
    console.error("GCS list error:", err);
    res.status(500).json({ error: "Failed to list files.", detail: err.message });
  }
});
 
// Generate signed URL endpoint 
// Returns a time-limited shareable link, no login required to use it
app.post("/share", async (req, res) => {
  const { path: filePath } = req.body;
 
  if (!filePath) {
    return res.status(400).json({ error: "No file path provided." });
  }
 
  try {
    const file = bucket.file(filePath);
    const fileName = filePath.replace(/^uploads\/\d+-/, "");
    const [url] = await file.getSignedUrl({
      action: "read",
      expires: Date.now() + 60 * 60 * 1000, // valid for 1 hour
      responseDisposition: `attachment; filename="${fileName}"`,  // Enables browser to view link as a download instead of a webpage
    });
 
    res.json({ url });
  } catch (err) {
    console.error("Signed URL error:", err);
    res.status(500).json({ error: "Failed to generate shareable link.", detail: err.message });
  }
});

 
// Start
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

