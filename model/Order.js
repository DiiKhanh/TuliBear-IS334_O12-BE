const mongoose = require('mongoose')

const OrderSchema = mongoose.Schema({
  orderId: {
    type: String,
  },
  uid: {
    type: String,
    required: true,
  },
  productId: {
    type: String,
  },
  name_product: {
    type: String,
  },
  image_url: {
    type: String,
  },
  quantity: {
    type: Number,
  },
  amount: {
    type: Number,
  },
  status: {
    type: String,
    enum: ['pending', 'failed', 'paid', 'delivered', 'canceled'],
    default: 'pending',
  },
})

module.exports = mongoose.model('Order', OrderSchema)
