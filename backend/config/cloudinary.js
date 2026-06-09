import { v2 as cloudinary } from "cloudinary";
import path from "node:path";
import { randomUUID } from "node:crypto";

const {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  CLOUDINARY_FOLDER = "ubutaberahub",
} = process.env;

const CASE_EVIDENCE_FOLDER = `${CLOUDINARY_FOLDER}/case-evidence`;
const PROFILE_PHOTOS_FOLDER = `${CLOUDINARY_FOLDER}/profile-photos`;

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
  secure: true,
});

export function isCloudinaryConfigured() {
  return Boolean(CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET);
}

export async function pingCloudinary() {
  assertCloudinaryConfigured();
  return cloudinary.api.ping();
}

function assertCloudinaryConfigured() {
  if (!isCloudinaryConfigured()) {
    const err = new Error("Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.");
    err.status = 500;
    throw err;
  }
}

function uploadStream(buffer, options) {
  assertCloudinaryConfigured();

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(result);
    });

    stream.end(buffer);
  });
}

function safePublicId(originalName) {
  const ext = path.extname(originalName || "").toLowerCase();
  const base = path
    .basename(originalName || "file", ext)
    .replace(/[^a-z0-9_-]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "file";

  return `${base}-${randomUUID()}${ext}`;
}

export async function uploadCaseEvidenceFile(file) {
  const isImage = file.mimetype?.startsWith("image/");
  const resourceType = isImage ? "image" : "raw";

  const result = await uploadStream(file.buffer, {
    asset_folder: CASE_EVIDENCE_FOLDER,
    public_id_prefix: CASE_EVIDENCE_FOLDER,
    resource_type: resourceType,
    public_id: resourceType === "raw" ? safePublicId(file.originalname) : undefined,
    use_filename: resourceType === "image",
    unique_filename: true,
    filename_override: file.originalname,
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
    resourceType: result.resource_type,
  };
}

export async function uploadProfilePhoto(photo) {
  if (!photo || typeof photo !== "string") return photo;
  if (!photo.startsWith("data:image/")) return photo;

  assertCloudinaryConfigured();

  const result = await cloudinary.uploader.upload(photo, {
    asset_folder: PROFILE_PHOTOS_FOLDER,
    public_id_prefix: PROFILE_PHOTOS_FOLDER,
    resource_type: "image",
  });

  return result.secure_url;
}
