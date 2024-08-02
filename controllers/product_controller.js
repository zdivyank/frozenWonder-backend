const multer = require('multer');
const fs = require('fs');
const path = require('path');
const product = require('../models/product_model');
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

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, 'uploads/'); // Ensure this directory exists
//     },
//     filename: (req, file, cb) => {
//         cb(null, Date.now() + '-' + file.originalname); // Set the filename
//       }
// });


// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//       cb(null, 'uploads/'); // Set the destination for storing images
//     },
//     filename: (req, file, cb) => {
//       cb(null, Date.now() + '-' + file.originalname); // Set the filename
//     }
//   });

const storage = multer.memoryStorage({
  destination: function (req, file, callback) {
    callback(null, "");
  },
})

const upload = multer({ storage: storage })


const addproducts = async (req, res) => {
  try {
    const { name, desc,discount,packs} = req.body;

    // Upload image to Cloudinary
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
    const parsedPacks = JSON.parse(packs);


    // Create new product with Cloudinary URL
    const newproduct = await product.create({
      name,
      desc,
      packs:parsedPacks,
      image: uploadResult.secure_url,
      discount
    });

    return res.status(200).json({ message: newproduct });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Error adding product' });
  }
};


// const addproducts = async (req, res) => {
//   try {
//     const { name, desc, price, size } = req.body;

//     // Upload image to Cloudinary
//     const uploadPromise = new Promise((resolve, reject) => {
//       const uploadStream = cloudinary.v2.uploader.upload_stream(
//         { folder: 'uploads' },
//         (error, result) => {
//           if (error) reject(error);
//           else resolve(result);
//         }
//       );
//       streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
//     });

//     const uploadResult = await uploadPromise;

//     // Create new product with Cloudinary URL
//     const newproduct = await product.create({
//       name,
//       desc,
//       price,
//       image: uploadResult.secure_url, // Store Cloudinary URL
//       size
//     });

//     return res.status(200).json({ message: newproduct });
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({ message: 'Error adding product' });
//   }
// };

const viewproducts = async (req, res) => {
  try {
    const response = await product.find();
    if (!response) {
      return res.status(404).json({ message: 'No Product Found' });
    }
    return res.status(200).json({ message: response });
  } catch (error) {
    return res.status(500).json({ message: 'Message Not Displaying Successfully ' });
  }
};

const singleproduct = async (req, res)=>
{
  const {_id} = req.params; 
  try {
      const response = await product.findById(_id);
      if (!response) {
        return res.status(404).json({ message: 'No Product Found' });
      }
      return res.status(200).json({ message: response });

  } catch (error) {
    return res.status(500).json({ message: 'Product Not Displaying Successfully ' });

  }
}

const updateProduct = async (req, res) => {
  try {
    const { _id } = req.params;  // Extract the id from the params
    const { name, desc, discount, packs } = req.body;

    // Parse packs if it is a string
    let parsedPacks;
    if (typeof packs === 'string') {
      parsedPacks = JSON.parse(packs);
    } else {
      parsedPacks = packs;
    }

    let updateData = { name, desc, discount, packs: parsedPacks };

    // If a new image file is uploaded
    if (req.file) {
      // Upload new image to Cloudinary
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
      updateData.image = uploadResult.secure_url; // Update image URL
    }

    // Update product in database
    const updatedProduct = await product.findByIdAndUpdate(
      _id,
      updateData,
      { new: true } 
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    return res.status(200).json({ message: 'Product updated successfully', product: updatedProduct });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Error updating product' });
  }
};


// const updateProduct = async (req, res) => {
//   try {
//     const _id = req.params;
//     const { name, desc, price, size } = req.body;

//     let updateData = { name, desc, price, size };

//     // If a new image file is uploaded
//     if (req.file) {
//       // Upload new image to Cloudinary
//       const uploadPromise = new Promise((resolve, reject) => {
//         const uploadStream = cloudinary.v2.uploader.upload_stream(
//           { folder: 'uploads' },
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

//     // Update product in database
//     const updatedProduct = await product.findByIdAndUpdate(
//       _id,
//       updateData,
//       { new: true } // This option returns the updated document
//     );

//     if (!updatedProduct) {
//       return res.status(404).json({ message: 'Product not found' });
//     }

//     return res.status(200).json({ message: 'Product updated successfully', product: updatedProduct });
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({ message: 'Error updating product' });
//   }
// };



const deleteproduct = async (req, res) => {
  try {
    const _id = req.params;
    const response = await product.findByIdAndDelete(_id);
    if (!response) {
      return res.status(404).json({ message: 'No Product Found' });
    }
    return res.status(200).json({ message: response });
  } catch (error) {
    return res.status(500).json({ message: 'Product Not Deleted Successfully ' });
  }
};


module.exports = { addproducts, viewproducts, updateProduct, deleteproduct, singleproduct,upload };
