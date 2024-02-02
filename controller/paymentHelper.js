const Razorpay = require('razorpay');
const orderModule = require('../payment/orderModule');
const checkoutModule = require('../payment/checkoutModule');
const webhookModule = require('../payment/webhookModule');


// app.post('/create-order', (req, res) => {
//     orderModule.createOrder((err, order) => {
//       if (err) {
//         console.error(err);
//         res.status(500).send('Error creating order');
//       } else {
//         console.log(order);
//         res.json(order);
//       }
//     });
//   });


  const createOrder = (req, res) => {
    orderModule.createOrder((err, order) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error creating order');
      } else {
        console.log(order);
        res.json(order);
      }
    });
  }
  
  app.post('/create-checkout', );



  const createCheckout = (req, res) => {
    const order = req.body;
    checkoutModule.createCheckout(
      order,
      (payment) => res.send('Payment successful'),
      (error) => res.status(500).send('Payment failed')
    );
  }
  





  app.post('/webhook', webhookModule.handleWebhook);


  module.export={
    createCheckout,
    createOrder,
  }