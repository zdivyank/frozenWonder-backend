const multer = require('multer');
const fs = require('fs');
const path = require('path');
const product = require('../models/product_model');
let streamifier = require('streamifier');
const cloudinary = require('cloudinary');
const { default: mongoose } = require('mongoose');



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


const addproducts = async (req, res) => {
  try {
    const { name, desc,packs} = req.body;

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
    const { _id } = req.params;  
    const { name, desc, packs} = req.body;

    // Parse packs if it is a string
    let parsedPacks;
    if (typeof packs === 'string') {
      parsedPacks = JSON.parse(packs);
    } else {
      parsedPacks = packs;
    }

    let updateData = { name, desc,packs: parsedPacks, };

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


const updatestock = async(req,res)=>{
  const { productId, packIndex, quantity } = req.body;

  if (!productId || packIndex === undefined || !quantity) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Start a session for the transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Find the product and select for update (locks the document)
    const selectedProduct = await product.findOne({ _id: productId }).session(session);

    if (!selectedProduct) {
      await session.abortTransaction();
      return res.status(404).json({ error: 'Product not found' });
    }

    if (!selectedProduct.packs[packIndex]) {
      await session.abortTransaction();
      return res.status(400).json({ error: 'Invalid pack index' });
    }

    // Check if there's enough stock
    if (selectedProduct.packs[packIndex].inventory < quantity) {
      await session.abortTransaction();
      return res.status(400).json({ error: 'Not enough stock' });
    }

    // Update the stock
    selectedProduct.packs[packIndex].inventory -= quantity;

    // Save the updated product
    await selectedProduct.save({ session });

    // Commit the transaction
    await session.commitTransaction();

    res.json({ 
      message: 'Stock updated successfully', 
      updatedStock: selectedProduct.packs[packIndex].inventory,
      productName: selectedProduct.name,
      packDetails: {
        ml: selectedProduct.packs[packIndex].ml,
        unit: selectedProduct.packs[packIndex].unit,
        price: selectedProduct.packs[packIndex].price,
        discount: selectedProduct.packs[packIndex].discount
      }
    });
  } catch (error) {
    // If an error occurred, abort the transaction
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    console.error('Error updating stock:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    // End the session
    session.endSession();
  }
};


module.exports = { addproducts, viewproducts, updateProduct, deleteproduct, singleproduct,updatestock,upload };
