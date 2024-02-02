const razorpay = require('./razorpayModule');

function createOrder(callback) {
  const orderOptions = {
    amount: 50000,
    currency: 'INR',
    receipt: 'order_receipt',
    payment_capture: 1,
  };

  razorpay.orders.create(orderOptions, callback);
}

module.exports = {
  createOrder,
};