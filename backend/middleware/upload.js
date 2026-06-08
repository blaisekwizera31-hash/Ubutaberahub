import fs from "node:fs";
import path from "node:path";
import multer from "multer";

const evidenceDir = path.resolve("uploads", "case-evidence");

fs.mkdirSync(evidenceDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, evidenceDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path
      .basename(file.originalname, ext)
      .replace(/[^a-z0-9_-]+/gi, "-")
      .slice(0, 60);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}-${base}${ext}`);
  },
});

const allowedTypes = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export const uploadCaseEvidence = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 10,
  },
  fileFilter: (_req, file, cb) => {
    if (allowedTypes.has(file.mimetype)) {
      cb(null, true);
      return;
    }

    cb(new Error("Unsupported file type. Use PDF, DOC, DOCX, JPG, PNG, or WEBP."));
  },
});
