const agency = require('../models/agency_model');

const multer = require('multer');
const fs = require('fs');
const path = require('path');
let streamifier = require('streamifier');
const cloudinary = require('cloudinary');



cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
  });
  
  // Ensure uploads directory exists
  const uploadDir = path.join(__dirname, '..', 'uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
  }
  
  
  const storage = multer.memoryStorage({
    destination: function (req, file, callback) {
      callback(null, "");
    },
  })
  
  const upload = multer({ storage: storage })
  

const add_agency = async (req, res) => {
    
    const { agency_name,owner,mobile_number,email,gstno,address,admin_id } = req.body;
  try {

    const uploadPromise = new Promise((resolve, reject) => {
        const uploadStream = cloudinary.v2.uploader.upload_stream(
          { folder: 'uploads' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
      });
  
      const uploadResult = await uploadPromise;

   const response = await agency.create({ agency_name,owner,mobile_number,email,gstno,logo:uploadResult.secure_url,address,admin_id})

    res.status(200).json({ "Message": response });
  } catch (error) {
    res.status(400).json({ "Message": error.message });
  }
};

const get_agency = async (req, res) => {
  try {
    const response = await agency.find();
    res.status(200).json({ "message": response });
  } catch (error) {
    res.status(400).json({ "message": error.message });
  }
};
const get_Eachagency = async (req, res) => {
  const {_id} = req.params;
  try {
    const response = await agency.find({_id});
    res.status(200).json({ "message": response });
  } catch (error) {
    res.status(400).json({ "message": error.message });
  }
};

const edit_agency = async (req, res) => {
  const {_id} = req.params;
  const { agency_name,owner,mobile_number,email,gstno,address} = req.body;

  let updateData = { agency_name,owner,mobile_number,email,gstno,address };

  try {
    const response = await agency.findByIdAndUpdate(_id, updateData,{ new: true } );
    res.status(200).json({ "message": response });
  } catch (error) {
    res.status(400).json({ "message": error.message });
  }
};



const remove_agency = async (req, res) => {

    const {_id} = req.params;
  try {
    const response = await agency.findByIdAndDelete(_id);
    res.status(200).json({ "message": response });
  } catch (error) {
    res.status(400).json({ "message": error.message });
  }
};


module.exports = {add_agency, get_agency,remove_agency, get_Eachagency,edit_agency,upload};
