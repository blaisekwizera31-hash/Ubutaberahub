/**
 * controllers/lawyerController.js
 */

import { fetchLawyersFromDb } from "../config/dbStore.js";
import { uploadProfilePhoto } from "../config/cloudinary.js";
import * as UserModel from "../models/userModel.js";

export async function getLawyers(req, res) {
  const lawyers = await fetchLawyersFromDb();
  return res.json({ lawyers: lawyers || [] });
}

export async function updateMyLawyerProfile(req, res) {
  try {
    if (req.user?.role !== "lawyer") {
      return res.status(403).json({ error: "Only lawyers can update lawyer profile settings" });
    }

    const profilePhoto = await uploadProfilePhoto(req.body.profile_photo || req.body.profilePhoto);

    const updates = {
      phone: req.body.phone,
      profile_photo: profilePhoto,
      law_firm: req.body.law_firm || req.body.lawFirm,
      specialization: req.body.specialization,
      years_experience: req.body.years_experience ?? req.body.yearsExperience,
      hourly_rate: req.body.hourly_rate ?? req.body.hourlyRate,
      is_available: req.body.is_available ?? req.body.isAvailable,
      available_time: req.body.available_time ?? req.body.availableTime,
    };

    const user = await UserModel.updateProfile(req.user.id, updates);
    return res.json({ user });
  } catch (err) {
    return res.status(500).json({ error: "Failed to update lawyer profile", message: err.message });
  }
}
