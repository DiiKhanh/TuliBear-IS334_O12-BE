let express = require('express')
let router = express.Router()
const { sendEmailController } = require('../controllers/sendEmail')

router.post('/', sendEmailController)

module.exports = router
