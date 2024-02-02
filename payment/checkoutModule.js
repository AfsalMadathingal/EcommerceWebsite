const Razorpay = require('razorpay');
const razorpay = require('./razorpayModule');

function createCheckout(order, successCallback, errorCallback) {
  const checkoutOptions = {
    key: process.env.RAZORPAY_API_KEY,
    amount: order.amount,
    currency: order.currency,
    name: 'Your Company Name',
    description: 'Purchase Description',
    order_id: order.id,
    callback_url: 'https://your-callback-url.com',
    redirect: true,
    prefill: {
      name: 'John Doe',
      email: 'john.doe@example.com',
      contact: '+919876543210',
    },
    notes: {
      address: 'Razorpay Corporate Office',
    },
  };

  const checkout = new Razorpay.Checkout();

  checkout.on('payment.success', successCallback);
  checkout.on('payment.error', errorCallback);

  checkout.open(checkoutOptions);
}

module.exports = {
  createCheckout,
};