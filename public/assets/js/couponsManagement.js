// document.addEventListener('DOMContentLoaded', () => {
//   // Elements
//   const elements = {
//       couponId: document.getElementById("coupon-id"),
//       couponDescription: document.getElementById("couponDiscription"),
//       userLimit: document.getElementById("user-limit"),
//       expireDate: document.getElementById("expire-date"),
//       discountValue: document.getElementById("discount-value"),
//       discountValueError: document.querySelector("#discount-value").closest(".mb-3").querySelector(".alert-for-error"),
//       userLimitError: document.querySelector("#user-limit").closest(".mb-3").querySelector(".alert-for-error"),
//       alertForError: document.querySelectorAll(".alert-for-error"),
//       submitButton: document.getElementById("submitCoupon"),
//       alert: document.getElementById('alert-for-distype'),
//       deleteButtons: document.querySelectorAll(".delete-button"),
//       editModal: document.getElementById("EditModal")
//   };

//   const regex = {
//       nullWhiteSpace: /^(?!\s*$).+/,
//       number: /^\d+$/,
//       numberNoWhitespace: /^\S*\d\S*$/,
//       date: /^\d{4}-\d{2}-\d{2}$/
//   };

//   let discountType;

//   // Discount Type Selection
//   document.querySelectorAll('.form-check-input').forEach((radioButton) => {
//       radioButton.addEventListener('change', (e) => {
//           discountType = e.target.value;
//       });
//   });

//   // Clear Alert Messages
//   const clearAlerts = () => {
//       elements.alertForError.forEach((el) => {
//           el.style.color = "red";
//           el.innerHTML = "";
//       });
//   };

//   // Submit Button Click Event
//   elements.submitButton.addEventListener("click", (e) => {
//       e.preventDefault();
//       clearAlerts();

//       const { couponId, couponDescription, userLimit, expireDate, discountValue, discountValueError, userLimitError, alert } = elements;

//       if (!regex.nullWhiteSpace.test(couponId.value)) {
//           couponId.nextElementSibling.innerHTML = "Coupon ID field cannot contain only white spaces.";
//       } else if (!regex.nullWhiteSpace.test(couponDescription.value)) {
//           couponDescription.nextElementSibling.innerHTML = "Coupon Description field cannot contain only white spaces.";
//       } else if (!regex.number.test(userLimit.value)) {
//           userLimitError.innerHTML = "Should be a Number";
//       } else if (!regex.date.test(expireDate.value)) {
//           expireDate.nextElementSibling.innerHTML = "Invalid Date.";
//       } else if (!discountType) {
//           alert.innerHTML = "Please select discount type";
//       } else if (!regex.numberNoWhitespace.test(discountValue.value)) {
//           discountValueError.innerHTML = "Should be a Number";
//       } else {
//           fetch("/admin/createCoupon", {
//               method: "POST",
//               headers: { "Content-Type": "application/json" },
//               body: JSON.stringify({
//                   Couponid: couponId.value,
//                   description: couponDescription.value,
//                   userlimit: userLimit.value,
//                   expireDate: expireDate.value,
//                   Discount: discountValue.value,
//                   discountType
//               })
//           })
//               .then((response) => response.json())
//               .then((data) => {
//                   if (data.success) {
//                       window.location.reload();
//                   } else {
//                       swal("Error!", "Coupon already exists. Please try again.", "error");
//                   }
//               });
//       }
//   });

//   // Delete Button Event
//   elements.deleteButtons.forEach((button) => {
//       button.addEventListener("click", (e) => {
//           const id = e.target.getAttribute("data-id");

//           swal({
//               title: "Are you sure?",
//               text: "Once deleted, you will not be able to recover this coupon!",
//               icon: "warning",
//               buttons: true,
//               dangerMode: true
//           }).then((willDelete) => {
//               if (willDelete) {
//                   fetch("/admin/deletecoupon", {
//                       method: "POST",
//                       headers: { "Content-Type": "application/json" },
//                       body: JSON.stringify({ id })
//                   })
//                       .then((response) => response.json())
//                       .then((data) => {
//                           if (data) {
//                               swal("Success!", "The coupon has been successfully deleted.", "success").then(() => location.reload());
//                           }
//                       })
//                       .catch((error) => console.error("Error:", error));
//               }
//           });
//       });
//   });

//   // Edit Modal Event
//   if (elements.editModal) {
//       elements.editModal.addEventListener("show.bs.modal", (event) => {
//           const button = event.relatedTarget;
//           const modalData = {
//               category: button.getAttribute("data-coupon"),
//               nameId: button.getAttribute("data-nameId"),
//               description: button.getAttribute("data-description"),
//               expire: button.getAttribute("data-expire"),
//               value: button.getAttribute("data-discountValue"),
//               limit: button.getAttribute("data-userlimit"),
//               id: button.getAttribute("data-id")
//           };

//           document.getElementById("editModalLabel").textContent = `Edit Coupon : ${modalData.category}`;
//           document.getElementById("editcategory-name").value = modalData.category;
//           document.getElementById("editcoupon-id").value = modalData.nameId;
//           document.getElementById("editcouponDiscription").value = modalData.description;
//           document.getElementById("editexpire-date").value = modalData.expire;
//           document.getElementById("editdiscount-value").value = modalData.value;
//           document.getElementById("edituser-limit").value = modalData.limit;
//           document.getElementById("editcategory-id").value = modalData.id;
//       });
//   }
// });



function updateCoupon(data) {


}
  
function openModal(modalId , initialData =null) {
  document.getElementById(modalId).classList.remove('hidden');

  if (initialData) {

    console.log(initialData);

        document.getElementById('objectId').value = initialData._id;
     document.getElementById('editCouponId').innerHTML = initialData.code;
     // Set the value of Coupon ID
    document.getElementById('edit-coupon-id').value = initialData.code;

    // Set the value of User Limit
    document.getElementById('edit-user-limit').value = Number( initialData.userLimit);

    // Set the checked radio button for Discount Type
    // if (initialData.discountType === 'amount') {
    //     document.querySelector('input[name="discountType"][value="amount"]').checked = true;
    // }
    // Set the value of Coupon Description
    document.getElementById('edit-coupon-description').value = initialData.discription;
    // Set the value of Expire Date
    document.getElementById('edit-expire-date').value = initialData.expireDate;
    // Set the value of Discount Value
    document.getElementById('edit-discount-value').value = initialData.discount;
  
  }
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.add('hidden');
}


function createCoupon(e) {
  e.preventDefault(); // Prevent form submission

  // Get form element
  const form = document.getElementById('couponForm');
  
  // Collect data from the form
  const formData = new FormData(form);
  const data = Object.fromEntries(formData);

  console.log('Form data:', data);

  // Destructure data for validation
  const { 
    Couponid, 
    discription, 
      userlimit, 
      expireDate, 
      discountType, 
      Discount 
  } = data;

  // Regex for validation
  const regex = {
      nullWhiteSpace: /^(?!\s*$).+/, // Matches non-whitespace characters
      number: /^\d+$/,      // Matches numbers
      date: /^\d{4}-\d{2}-\d{2}$/, // Matches date format YYYY-MM-DD
      numberNoWhitespace: /^\d+$/  // Matches numbers with no whitespace
  };



  // Reset error messages
  document.querySelectorAll('.error').forEach(el => (el.innerHTML = ""));

 

// Initialize validation state
let isValid = true;

// Validate coupon ID
if (!regex.nullWhiteSpace.test(Couponid) || !Couponid) {
    document.getElementById('couponIdError').innerHTML = "Coupon ID cannot contain only white spaces.";
    isValid = false;
} else {
    document.getElementById('couponIdError').innerHTML = ""; // Clear error message
}

// Validate coupon description
if (!regex.nullWhiteSpace.test(discription) || !discription) {
    document.getElementById('couponDescriptionError').innerHTML = "Coupon Description cannot contain only white spaces.";
    isValid = false;

} else {
    document.getElementById('couponDescriptionError').innerHTML = ""; // Clear error message
}

// Validate user limit
if (!regex.number.test(userlimit) || !userlimit) {
    document.getElementById('userLimitError').innerHTML = "User Limit should be a number.";
    isValid = false;
} else {
    document.getElementById('userLimitError').innerHTML = ""; // Clear error message
}

// Validate expire date
if (!regex.date.test(expireDate) || !expireDate) {
    document.getElementById('expireDateError').innerHTML = "Invalid date format. Use YYYY-MM-DD.";
    isValid = false;
} else {
    document.getElementById('expireDateError').innerHTML = ""; // Clear error message
}

// Validate discount type
if (!discountType) {
    document.getElementById('discountTypeError').innerHTML = "Please select a discount type.";
    isValid = false;
} else {
    document.getElementById('discountTypeError').innerHTML = ""; // Clear error message
}

// Validate discount value
if (!regex.numberNoWhitespace.test(Discount) || !Discount) {
    document.getElementById('discountValueError').innerHTML = "Discount value should be a number.";
    isValid = false;
} else {
    document.getElementById('discountValueError').innerHTML = ""; // Clear error message
}

  if (!isValid) {
      return; // Stop execution if validation fails
  }
  document.querySelectorAll('.text-red-500').forEach(el => (el.innerHTML = ""));
  // Make API call if validation passes
  fetch("/admin/createCoupon", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
  })
      .then(response => response.json())
      .then(data => {
          if (data.success) {
              window.location.reload();
          } else {
              swal("Error!", "Coupon already exists. Please try again.", "error");
          }
      })
      .catch(error => {
          console.error("Error creating coupon:", error);
          swal("Error!", "Something went wrong. Please try again.", "error");
      });
}


function editCoupon(e) {
    e.preventDefault();
    
    const form = document.getElementById('editCouponForm');
    const formData = new FormData(form);
    const coupon = Object.fromEntries(formData);
    
    console.log('Form data:', coupon);

    const {Couponid, discription, userlimit, expireDate, discountType, Discount, objectId} = coupon;

    if (!Couponid || !discription || !userlimit || !expireDate || !discountType || !Discount) {
        swal("Error!", "Please fill in all fields.", "error");
        return;
    }

    fetch("/admin/editCoupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({Couponid, discription, userlimit, expireDate, discountType, Discount, objectId})
    })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            
            if (data.success) {
                window.location.reload();
            } else {
                swal("Error!", `${data.message}`, "error");
            }
        })
        .catch(error => {
            console.error("Error creating coupon:", error);
            swal("Error!", "Something went wrong. Please try again.", "error");
        });
    
    
  }



function deleteCoupon(id) {

    swal({
        title: "Are you sure?",
        text: "Once deleted, you will not be able to recover this coupon!",
        icon: "warning",
        buttons: true,
        dangerMode: true
    }).then((willDelete) => {
        if (willDelete) {

            fetch("/admin/deletecoupon", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id })
            })
                .then((response) => response.json())
                .then((data) => {
                    if (data) {
                        swal("Success!", "The coupon has been successfully deleted.", "success").then(() => location.reload());
                    }
                })
                .catch((error) => console.error("Error:", error));
        }
    });


}