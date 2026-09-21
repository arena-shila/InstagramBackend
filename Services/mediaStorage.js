const fs = require("fs");
const cloudinary = require("cloudinary").v2;

const cloudReady = () =>
  Boolean(process.env.CLOUD_NAME && process.env.CLOUD_APIKEY && process.env.CLOUD_SECRET);

const saveUpload = async (req) => {
  const file = req.file;

  if (!cloudReady()) {
    const baseUrl = process.env.PUBLIC_URL || `${req.protocol}://${req.get("host")}`;
    return `${baseUrl}/uploads/${file.filename}`;
  }

  cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_APIKEY,
    api_secret: process.env.CLOUD_SECRET,
  });

  try {
    const result = await cloudinary.uploader.upload(file.path, {
      resource_type: "auto", // images and videos
      folder: "social-app",
    });
    return result.secure_url;
  } finally {
    fs.unlink(file.path, () => {}); // temp file no longer needed (also when the upload fails)
  }
};

module.exports = { saveUpload };