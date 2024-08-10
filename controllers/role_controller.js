const role = require('../models/role_model');

const add_role = async (req, res) => {
  const { name } = req.body;

  try {
   const response = await role.create({name})

    res.status(200).json({ "Message": response });
  } catch (error) {
    res.status(400).json({ "Message": error.message });
  }
};

const get_role = async (req, res) => {
  try {
    const response = await role.find();
    res.status(200).json({ "message": response });
  } catch (error) {
    res.status(400).json({ "message": error.message });
  }
};

const remove_role = async (req, res) => {

    const {_id} = req.params;
  try {
    const response = await role.findByIdAndDelete(_id);
    res.status(200).json({ "message": response });
  } catch (error) {
    res.status(400).json({ "message": error.message });
  }
};

module.exports = {add_role, get_role, remove_role};
