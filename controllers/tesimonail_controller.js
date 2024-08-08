const Testimonails = require('../models/testmonails_model');
const multer = require('multer');
const streamifier = require('streamifier');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const addTestimonails = async (req, res) => {
  const { cust_name, message } = req.body;

  try {
    if (!req.file) {
      return res.status(400).json({ "Message": "File is required" });
    }

    const uploadPromise = new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'uploads', resource_type: 'auto' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
    });

    const uploadResult = await uploadPromise;

    const newTestimonails = await Testimonails.create({
      cust_name,
      image: uploadResult.secure_url,
      message,
    });

    res.status(200).json({ "Message": newTestimonails });
  } catch (error) {
    res.status(400).json({ "Message": error.message });
  }
};

const getTestimonails = async (req, res) => {
  try {
    const response = await Testimonails.find();
    res.status(200).json({ "message": response });
  } catch (error) {
    res.status(400).json({ "message": error.message });
  }
};

const updateTestimonails = async (req, res) => {
  try {
    const { _id } = req.params;
    const { cust_name, message } = req.body;

    let updateData = {};

    if (cust_name) updateData.cust_name = cust_name;
    if (message) updateData.message = message;

    // If a new image file is uploaded
    if (req.file) {
      // Upload new image to Cloudinary
      const uploadPromise = new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'uploads', resource_type: 'auto' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
      });

      const uploadResult = await uploadPromise;
      updateData.image = uploadResult.secure_url; // Update image URL
    }

    // Update testimonial in the database
    const updatedTest = await Testimonails.findByIdAndUpdate(
      _id,
      { $set: updateData },
      { new: true }
    );

    if (!updatedTest) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }

    return res.status(200).json({ message: 'Testimonial updated successfully', testimonial: updatedTest });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Error updating Testimonial' });
  }
};

const deleteTestimonails = async (req, res) => {
  const { _id } = req.params;

  try {
    const response = await Testimonails.findByIdAndDelete(_id);
    res.status(200).json({ message: "Successfully Deleted", response });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error deleting Testimonial" });
  }
};

module.exports = { upload, addTestimonails, getTestimonails, updateTestimonails, deleteTestimonails };
