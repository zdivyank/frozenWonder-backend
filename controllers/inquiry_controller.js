const inquiry = require('../models/inquiry_model');
const ExcelJS= require('exceljs')

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



const downloadInquiries = async (req, res) => {
    try {
        const inquiries = await inquiry.find();
      
        // Create Excel workbook and worksheet
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Inquiries');
      
        // Define columns for the worksheet, including Serial Number
        worksheet.columns = [
          { header: 'Serial No.', key: 'serial_no', width: 10 },
          { header: 'Name', key: 'name', width: 20 },
          { header: 'Company Name', key: 'company_name', width: 30 },
          { header: 'User Number', key: 'user_number', width: 20 },
          { header: 'Region', key: 'region', width: 20 },
          { header: 'Message', key: 'message', width: 50 }
        ];
      
        // Populate the worksheet with data and add serial number
        inquiries.forEach((inquiry, index) => {
          worksheet.addRow({
            serial_no: index + 1, // Increment the serial number starting from 1
            name: inquiry.name,
            company_name: inquiry.company_name,
            user_number: inquiry.user_number,
            region: inquiry.region,
            message: inquiry.message
          });
        });
      
        // Save the workbook to a buffer and send as a download
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=inquiries.xlsx');
      
        await workbook.xlsx.write(res);
        res.end();
      
      } catch (error) {
        console.error('Error creating Excel file:', error);
        res.status(500).json({ message: "Inquiries data not found" });
      }
      
  };

module.exports = { add_inquiry, get_inquiry, edit_inquiry, remove_inquiry,downloadInquiries };
