let express = require('express')
let router = express.Router()

const { checkOutVNPay, vnpay_return } = require('../controllers/payment')

router.get('/vnpay', function (req, res, next) {
  res.render('order', { title: 'Tạo mới đơn hàng', amount: 10000 })
})

router.post('/vnpay', checkOutVNPay)

// router.get('/vnpay_return', vnpay_return)

module.exports = router
