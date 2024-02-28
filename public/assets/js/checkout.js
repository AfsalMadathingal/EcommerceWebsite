const rzpKey = 'rzp_test_hZPyhffeqYGexk';
let selectedAddress;
document.getElementById('rzp-button').onclick = function (e) {

    e.preventDefault();
    var radioButtons = document.getElementsByName('flexRadioDefault');
    var paymentButton = document.getElementsByName('pay-method')
    var addressDiv = document.getElementsByClassName('address-label');
    const userId = document.getElementById('rzp-button').getAttribute('data-id')
    const placeOrderButton = document.getElementById('place-order-link')
    const addressLabels = document.querySelectorAll('.address-label');
    const paymentMethod = document.querySelectorAll('payment-method');



    selectedAddress = Array.from(radioButtons).find(radio => radio.checked).value
    var selectedPayment = Array.from(paymentButton).find(radio => radio.checked).value

    console.log("selecte", selectedAddress)
    console.log("selected patmetn", selectedPayment)


    if (selectedPayment == "online") {

        handlePayment(selectedAddress, userId)

    } else if (selectedPayment == "cash") {


        handleCod(selectedAddress, userId)

    } else if (selectedPayment == "paypal") 
    {

        handleWallet(selectedAddress, userId);
        
    }

}


function handleWallet (selectedAddress, userId) {

    fetch('/profile/payment/walletPayment', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
        , body: JSON.stringify({ userId: userId, selectedAddress: selectedAddress })
    }).then(response => response.json()).then(data => {
        
        
        if (data.success) {

            swal("Success", "Payment Successful!", "success")

            fetch('/profile/mycart/createorder', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId: userId, selectedAddress: selectedAddress , walletPayment: true}),
            })
                .then(response => response.json())
                .then(data => {
                    if (data) {
                        window.location.href = ('/profile/myorders/success')
                    }
                });
            
        }else
        {
            swal("Failed", "Payment Failed!", "error");
        }
    })
}


async function handleCod(selectedAddress, userId) {

    const orderurl = '/profile/mycart/createorder';

    const response =  fetch(orderurl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId: userId, selectedAddress: selectedAddress }),
    });

    response.then(async response => {

        const data = await response.json();

        if (data) {
            window.location.href = ('/profile/myorders/success')
        }
    }).catch(err => {

    });

}

async function handlePayment(selectedAddress) {
const userId = document.getElementById('rzp-button').getAttribute('data-id');

const orderurl = '/profile/payment/orders';
try {
    const response = await fetch(orderurl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId: userId, selectedAddress: selectedAddress }),
    });

    if (!response.ok) {
        throw new Error('Network response was not ok');
    }

    
    const data = await response.json();
    const { order } = data;
    initializePayment(order,data);
} catch (err) {

    console.error('Error:', err);
    
}
}

const initializePayment = (paymentData ,response) => {

    const userId = document.getElementById('rzp-button').getAttribute('data-id');
    const paymentOptions = {
        key: rzpKey,
        currency: paymentData.currency,
        amount: paymentData.amount,
        name: "OurShop",
        description: "Test Transaction",
        image: "https://i.ibb.co/VM5qVp7/164822577-us-initial-logo-company-name-colored-blue-and-magenta-swoosh-design-isolated-on-white-back.jpg",
        order_id: paymentData.id,

        handler: async (response) => {

            console.log("response",response)

            try {
                

                const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = response;
              
                const verifyResponse = await fetch('/profile/payment/verify', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ razorpay_order_id, razorpay_payment_id, razorpay_signature })

                })

                const verifyData = await verifyResponse.json();
                

                if (verifyData.success) {



                    fetch('/profile/mycart/createorder', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ userId: userId, selectedAddress: selectedAddress }),
                    })
                        .then(response => response.json())
                        .then(data => {
                            if (data) {
                                console.log("verify data", verifyData);
                                if (true) {
                                    swal({
                                        icon: 'success',
                                        title: 'Payment Successful!',
                                        text: 'Your order has been placed successfully',
                                        buttons: false,
                                        timer: 6000
                                    }).then(() => {

                                        window.location.href = ('/profile/myorders/success')
                                    })
                                }
                            }
                        });
                }

            } catch (error) {

                console.log(error);
            }
        },
        theme: {
            color: "green"
        }
    };
    
   const paymentObject = new window.Razorpay(paymentOptions);
   paymentObject.open();
} 