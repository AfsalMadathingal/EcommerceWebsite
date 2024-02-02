// razorpay.js

const options = {
    key: 'rzp_test_JujF1Sy8nVFpl6',
    amount: 50000, // Example amount in paise (e.g., 50000 paise = INR 500)
    currency: 'INR',
    name: 'Your Company Name',
    description: 'Purchase Description',
    image: '/path/to/your/logo.png',
    handler: function (response) {
        
      // Handle successful payment, e.g., update order status, show success message
      console.log(response);
    },
    prefill: {
      name: 'John Doe',
      email: 'john.doe@example.com',
      contact: '+919876543210',
    },
    notes: {
      address: 'Razorpay Corporate Office',
    },
    theme: {
      color: '#528FF0',
    },
  };
  


  const rzpButton = document.getElementById('rzp-button1');
  
  rzpButton.addEventListener('click', function () {
    const razorpay = new Razorpay(options);
    razorpay.open();
  });
  

  document.addEventListener('DOMContentLoaded', function () {
    let selectedAddressId;

    const addressLabels = document.querySelectorAll('.card-radio-label');
    const userId = document.getElementById('place-order-btn').getAttribute('data-id');
    const placeOrderButton = document.getElementById('place-order-link');
    addressLabels.forEach(label => {
        label.addEventListener('change', (event) => {
            console.log("changed");
            selectedAddressId = event.target.getAttribute('data-id');

            const newHTMLContent = `<a href="/profile/mycart/checkout/placeOrder?userId=${userId}&addressId=${selectedAddressId}" id="place-order-link">
                                    <button id="place-order-btn" data-id="{{userId}}" class="btn btn-success" type="button"><i
                                            class="mdi mdi-cart-outline me-1"></i>Place Your Order and Pay</button>
                                </a>`;

            placeOrderButton.outerHTML = newHTMLContent;


            console.log(selectedAddressId);
            // Do something with the selectedAddressId
        });
    });

    document.getElementById('place-order-btn').addEventListener('click', function (e) {
        e.preventDefault();


        const radioButtons = document.getElementsByName('flexRadioDefault');
        const selectedAddress = Array.from(radioButtons).find(radio => radio.checked);


        if (!selectedAddress) {
            // Display an error message or take other actions
            swal({
                icon: 'warning',
                title: 'Check Address',
                text: 'Please choose an address before proceeding to checkout.',
                Button: 'OK'
            });
        }
    });
});
