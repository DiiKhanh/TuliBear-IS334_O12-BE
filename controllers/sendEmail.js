const service = require('../services/email')

const sendEmailController = async (req, res, next) => {
  const emailDetails = {
    name: req.body.name,
    products: req.body.products,
    gmail: req.body.gmail,
    address: req.body.address,
    amount: req.body.amount,
  }
  try {
    const email = await service.sendEmail(emailDetails)
    return res.status(200).json('Thanh cong vai')
  } catch (err) {
    console.log(err)
  }
}

module.exports = { sendEmailController }
