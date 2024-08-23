const video = require('../models/video_model');
const multer = require('multer');
const streamifier = require('streamifier');
const cloudinary = require('cloudinary').v2;

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
});

// Multer configuration for in-memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Add video controller
const addvideo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "File is required" });
    }

    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'uploads', resource_type: 'auto' },
          (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
        );
        streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
        // console.log(uploadStream);
    });
    // console.log(uploadResult.secure_url);
    

    const newVideo = await video.create({
        video: uploadResult.secure_url,
    });


    res.status(200).json({ message: "Video uploaded successfully", newVideo });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get videos controller
const getvideo = async (req, res) => {
  try {
    const response = await video.find();
    res.status(200).json({ message: response });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update video controller
const updatevideo = async (req, res) => {
  const { _id } = req.params;
  try {
    let updateData = {};

    if (req.file) {
      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'uploads', resource_type: 'auto' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
      });

      updateData.video = uploadResult.secure_url;
    }

    const updatedVideo = await video.findByIdAndUpdate(_id, updateData, { new: true });

    if (!updatedVideo) {
      return res.status(404).json({ message: 'Video not found' });
    }

    res.status(200).json({ message: 'Video updated successfully', updatedVideo });
  } catch (error) {
    res.status(500).json({ message: 'Error updating video', error: error.message });
  }
};

// Delete video controller
const deletevideo = async (req, res) => {
  const { _id } = req.params;

  try {
    const response = await video.findByIdAndDelete(_id);
    if (!response) {
      return res.status(404).json({ message: 'Video not found' });
    }
    res.status(200).json({ message: "Successfully deleted", response });
  } catch (error) {
    res.status(500).json({ message: "Error deleting video", error: error.message });
  }
};

module.exports = { upload, addvideo, getvideo, updatevideo, deletevideo };
