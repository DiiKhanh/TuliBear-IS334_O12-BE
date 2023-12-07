let express = require('express')
let router = express.Router()
const request = require('request')
const moment = require('moment')
const Order = require('../model/Order')
const { await } = require('await')
let orderID

const checkOutVNPay = async (req, res, next) => {
  console.log(req.body)
  process.env.TZ = 'Asia/Ho_Chi_Minh'

  //Order
  const { uid, productId, name_product, image_url, quantity, amount } = req.body
  console.log(amount)

  //Checkout

  let date = new Date()
  let createDate = moment(date).format('YYYYMMDDHHmmss')

  let ipAddr =
    req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress

  let config = require('../config/vnpay-config.json')

  let tmnCode = config.vnp_TmnCode
  let secretKey = config.vnp_HashSecret
  let vnpUrl = config.vnp_Url
  let returnUrl = config.vnp_ReturnUrl
  let orderId = moment(date).format('DDHHmmss')
  orderID = orderId
  let bankCode = req.body.bankCode

  let locale = req.body.language
  if (locale === null || locale === '') {
    locale = 'vn'
  }
  let currCode = 'VND'
  let vnp_Params = {}
  vnp_Params['vnp_Version'] = '2.1.0'
  vnp_Params['vnp_Command'] = 'pay'
  vnp_Params['vnp_TmnCode'] = tmnCode
  vnp_Params['vnp_Locale'] = locale
  vnp_Params['vnp_CurrCode'] = currCode
  vnp_Params['vnp_TxnRef'] = orderId
  vnp_Params['vnp_OrderInfo'] = 'Thanh toan cho ma GD:' + orderId
  vnp_Params['vnp_OrderType'] = 'other'
  vnp_Params['vnp_Amount'] = amount * 100
  vnp_Params['vnp_ReturnUrl'] = returnUrl
  vnp_Params['vnp_IpAddr'] = ipAddr
  vnp_Params['vnp_CreateDate'] = createDate
  if (bankCode !== null && bankCode !== '') {
    vnp_Params['vnp_BankCode'] = bankCode
  }

  vnp_Params = sortObject(vnp_Params)

  let querystring = require('qs')
  let signData = querystring.stringify(vnp_Params, { encode: false })
  let crypto = require('crypto')
  let hmac = crypto.createHmac('sha512', secretKey)
  let signed = hmac.update(new Buffer(signData, 'utf-8')).digest('hex')
  vnp_Params['vnp_SecureHash'] = signed
  vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false })

  console.log(vnp_Params)
  res.redirect(vnpUrl)
  const order = await Order.create({
    orderId,
    uid,
    productId,
    name_product,
    image_url,
    quantity,
    amount,
  })
}

function sortObject(obj) {
  let sorted = {}
  let str = []
  let key
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key))
    }
  }
  str.sort()
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, '+')
  }
  return sorted
}

const vnpay_return = async (req, res, next) => {
  let vnp_Params = req.query
  console.log(vnp_Params)
  const order = await Order.findOne({ orderId: orderID })
  order.status = 'paid'
  await order.save()
  // console.log(this.name)
  // // console.log(vnp_Params)
  // // console.log(vnp_Params['vnp_Bill_FirstName'])
  // let secureHash = vnp_Params['vnp_SecureHash']

  // delete vnp_Params['vnp_SecureHash']
  // delete vnp_Params['vnp_SecureHashType']

  // vnp_Params = sortObject(vnp_Params)

  // let config = require('../config/vnpay-config.json')

  // let tmnCode = config.vnp_TmnCode
  // let secretKey = config.vnp_HashSecret

  // let querystring = require('qs')
  // let signData = querystring.stringify(vnp_Params, { encode: false })
  // let crypto = require('crypto')
  // let hmac = crypto.createHmac('sha512', secretKey)
  // let signed = hmac.update(new Buffer(signData, 'utf-8')).digest('hex')

  // if (secureHash === signed) {
  //   //Kiem tra xem du lieu trong db co hop le hay khong va thong bao ket qua
  //   // console.log(vnp_Params)

  //   res.render('success', {
  //     code: vnp_Params['vnp_ResponseCode'],
  //     arr: {
  //       amount: vnp_Params['vnp_Amount'],
  //     },
  //   })
  // } else {
  //   res.render('success', { code: '97' })
  // }

  res.render('success', { code: vnp_Params['vnp_ResponseCode'] })
}

module.exports = {
  checkOutVNPay,
  vnpay_return,
}
