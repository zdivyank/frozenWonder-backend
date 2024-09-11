const Testimonails = require('../models/testmonails_model');
const multer = require('multer');
const streamifier = require('streamifier');
const cloudinary = require('cloudinary').v2;
const sharp = require('sharp');

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage, limits: { fileSize: 50 * 1024 * 1024 }});

const addTestimonails = async (req, res) => {
  const { cust_name, message, verify, contact_number } = req.body;

  try {
    if (!cust_name || !message) {
      return res.status(400).json({ "Message": "Customer name and message are required" });
    }

    let imageUrl = '';

    if (req.file) {
      console.log('Original file size:', req.file.buffer.length);

      // Aggressively compress image using Sharp
      let compressedImageBuffer = await sharp(req.file.buffer)
        .resize({ width: 500, height: 500, fit: 'inside' }) // Reduce dimensions
        .jpeg({ quality: 30, progressive: true }) // Start with very low quality
        .toBuffer();

      // Further compress if still too large
      let attempts = 0;
      while (compressedImageBuffer.length > 15 * 1024 && attempts < 3) { // Aim for 15KB
        compressedImageBuffer = await sharp(compressedImageBuffer)
          .jpeg({ quality: 20 - attempts * 5 }) // Reduce quality further
          .toBuffer();
        attempts++;
      }

      console.log('Compressed image size:', compressedImageBuffer.length);

      const uploadPromise = new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'uploads',
            resource_type: 'auto',
            transformation: [
              { quality: 'auto:low', fetch_format: 'auto' }
            ]
          },
          (error, result) => {
            if (error) {
              console.error('Error during Cloudinary upload:', error);
              reject(error);
            } else {
              console.log('Cloudinary upload result:', result);
              resolve(result);
            }
          }
        );
        streamifier.createReadStream(compressedImageBuffer).pipe(uploadStream);
      });

      const uploadResult = await uploadPromise;
      imageUrl = uploadResult.secure_url;
    }

    const newTestimonial = await Testimonails.create({
      cust_name,
      image: imageUrl,
      message,
      contact_number,
      verify: verify === 'true'
    });

    res.status(201).json({ "Message": "Testimonial created successfully", "Data": newTestimonial });
  } catch (error) {
    console.error('Error in addTestimonials:', error);
    res.status(400).json({ "Message": "Failed to add testimonial", "Error": error.message });
  }
};



const getTestimonails = async (req, res) => {
  try {
    const response = await Testimonails.find();
    // const response = await Testimonails.find({verify:true});
    res.status(200).json({ "message": response });
  } catch (error) {
    res.status(400).json({ "message": error.message });
  }
};

const getVerifiedtestimonail = async (req, res) => {
  try {
    // const response = await Testimonails.find({});
    const response = await Testimonails.find({verify:"true"});
    res.status(200).json({ "message": response });
  } catch (error) {
    res.status(400).json({ "message": error.message });
  }
};

// const updateTestimonails = async (req, res) => {
//   try {
//     const { _id } = req.params;
//     const { cust_name, message,verify } = req.body;

//     let updateData = {};

//     if (cust_name) updateData.cust_name = cust_name;
//     if (message) updateData.message = message;
//     if (verify) updateData.verify = verify;

//     // If a new image file is uploaded
//     if (req.file) {
//       // Upload new image to Cloudinary
//       const uploadPromise = new Promise((resolve, reject) => {
//         const uploadStream = cloudinary.uploader.upload_stream(
//           { folder: 'uploads', resource_type: 'auto' },
//           (error, result) => {
//             if (error) reject(error);
//             else resolve(result);
//           }
//         );
//         streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
//       });

//       const uploadResult = await uploadPromise;
//       updateData.image = uploadResult.secure_url; // Update image URL
//     }

//     // Update testimonial in the database
//     const updatedTest = await Testimonails.findByIdAndUpdate(
//       _id,
//       { $set: updateData },
//       { new: true }
//     );

//     if (!updatedTest) {
//       return res.status(404).json({ message: 'Testimonial not found' });
//     }

//     return res.status(200).json({ message: 'Testimonial updated successfully', testimonial: updatedTest });
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({ message: 'Error updating Testimonial' });
//   }
// };


const updateTestimonails = async (req, res) => {
  try {
    const { _id } = req.params;
    const { cust_name, message, verify } = req.body;

    let updateData = {};

    if (cust_name) updateData.cust_name = cust_name;
    if (message) updateData.message = message;
    // Properly check if verify is not undefined (to handle false values correctly)
    if (verify !== undefined) updateData.verify = verify;

    // If a new image file is uploaded
    if (req.file) {
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

module.exports = { upload, addTestimonails,getVerifiedtestimonail, getTestimonails, updateTestimonails, deleteTestimonails };
