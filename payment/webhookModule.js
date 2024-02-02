const razorpay = require('./razorpayModule');

function handleWebhook(req, res) {
  const { body, headers } = req;
  const signature = headers['x-razorpay-signature'];

  try {
    const isValidSignature = razorpay.webhooks.verifySignature(
      body,
      signature,
      'YOUR_WEBHOOK_SECRET'
    );

    if (isValidSignature) {
      const payment = body.payload;
      console.log(payment);
      res.send('Webhook received');
      // Handle payment success
    } else {
      res.status(403).send('Invalid signature');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Error processing webhook');
  }
}

module.exports = {
  handleWebhook,
};