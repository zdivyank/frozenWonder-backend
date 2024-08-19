const inquiry = require('../models/inquiry_model');

const add_inquiry = async (req, res) => {
    const { name, company_name, user_number, region, message } = req.body;

    try {
        const response = await inquiry.create({ name, company_name, user_number, region, message })
        res.status(200).json({ "Message": response });
    } catch (error) {
        res.status(400).json({ "Message": error.message });
    }
};

const get_inquiry = async (req, res) => {
    try {
        const response = await inquiry.find();
        res.status(200).json({ "message": response });
    } catch (error) {
        res.status(400).json({ "message": error.message });
    }
};

const remove_inquiry = async (req, res) => {

    const { _id } = req.params;
    try {
        const response = await inquiry.findByIdAndDelete(_id);
        res.status(200).json({ "message": response });
    } catch (error) {
        res.status(400).json({ "message": error.message });
    }
};

const edit_inquiry = async (req, res) => {
    const { _id } = req.params;
    const { name, company_name, user_number, region, message } = req.body;
    try {
        const response = await inquiry.findByIdAndUpdate(_id, { name, company_name, user_number, region, message }, { new: true });
        console.log(response);

        res.status(200).json({ "message": response });
    } catch (error) {
        res.status(400).json({ "message": error.message });
    }
}

module.exports = { add_inquiry, get_inquiry, edit_inquiry, remove_inquiry };
