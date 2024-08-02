// const mongoose = require('mongoose');

// const product_schema = new mongoose.Schema({
//     name: {
//         type: String,
//         required: true
//     },    
//    desc: {
//         type: String,
//         required: true
//     }, 
//     price: {
//         type: String,
//         required: true
//     },   
//     image: {
//         type: String,
//         required: true
//     },   
//     size: {
//         type: String,
//         required: true
//     },   
// })

// const Products = mongoose.model('products',product_schema);

// module.exports = Products;

const mongoose = require('mongoose');

const packSchema = new mongoose.Schema({
  ml: { type: Number, required: true },
  unit: { type: Number, required: true },
  price: { type: Number, required: true }
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  desc: { type: String, required: true },
  packs: [packSchema],
  image: { type: String, required: true },
  discount: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('products', productSchema);