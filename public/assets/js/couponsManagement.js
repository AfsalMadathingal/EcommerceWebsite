
    document.addEventListener('DOMContentLoaded', function () {

      const couponId = document.getElementById("coupon-id");
      const couponDiscription = document.getElementById("couponDiscription");
      const userlimit = document.getElementById("user-limit");
      const date = document.getElementById("expire-date");
      const discountValue = document.getElementById("discount-value");
      const discountValueInput = document.getElementById("discount-value");
      const discountValueError = discountValueInput.closest(".mb-3").querySelector(".alert-for-error");
      const alterForError = document.querySelectorAll(".alert-for-error");
      const userLimitInput = document.getElementById("user-limit");
      const userLimitError = userLimitInput.closest(".mb-3").querySelector(".alert-for-error");
      const nullWhiteSpace = /^(?!\s*$).+/;
      const numberRegex = /^\d+$/;
      const numberNoWhitespaceRegex = /^\S*\d\S*$/;
      const submit=document.getElementById("submitCoupon");
      const dateRegx = /^\d{4}-\d{2}-\d{2}$/;
      const alert = document.getElementById('alert-for-distype')
      let  selectedRadioButton = document.querySelectorAll('.form-check-input')
      let discountType;

      selectedRadioButton.forEach((el) => {
        el.addEventListener('change', function () {
          selectedRadioButton = this;
            discountType = selectedRadioButton.value
        })
       
  
      })
  
      
      submit.addEventListener("click", function (e) {
          e.preventDefault();
    

      function alertClear(){

        alterForError.forEach((el) => {
          el.style.color = "red";
          el.innerHTML = "";
        });

      }

      alertClear();
         
          
          if (!nullWhiteSpace.test(couponId.value)) {

            const couponIdError = couponId.nextElementSibling;
            couponIdError.innerHTML = "Coupon ID field cannot contain only white spaces.";
             
              
            }else if(!nullWhiteSpace.test(couponDiscription.value)){

              couponDiscription.nextElementSibling.innerHTML = "Coupon Discription field cannot contain only white spaces.";
              
              
            }
            
            else if (!numberRegex.test(userlimit.value)) {

              
              userLimitError.style.color = "red";
              userLimitError.innerHTML = "Should be a Number";
             
            } else if(!dateRegx.test(date.value)){
              
              date.nextElementSibling.innerHTML = "Invalid Date.";

      
             
            }else if(discountType==null){
              
              alert.style.color = "red";
              alert.innerHTML = "Pleace select discount type";
            
              

            } else if (!numberNoWhitespaceRegex.test(discountValue.value)) {
              
              discountValueError.style.color = "red";
              discountValueError.innerHTML = "Should be a Number";
              
            }
            else {
              
              fetch("/admin/createCoupon", {
                method: "POST",
                headers: {
                    
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  
                  Couponid: couponId.value,
                  discription: couponDiscription.value,
                  userlimit: userlimit.value,
                  expireDate: date.value,
                  Discount: discountValue.value,
                  discountType: discountType.value,
                  
                })
                
              }).then((response) => response.json())
              .then((data) => {
                
                console.log("Success:", data);
  
                if (data.success) {
  
                  window.location.reload();
                  
                }else
                {
                  swal("Error!", "Coupon already exists. Please try again.", "error");
                }
  
  
  
              })
            }
  
            
  
      })
  
   
  


    })
    

   
  
  
const deletebutton = document.querySelectorAll(".delete-button");

deletebutton.forEach((button) => {
  button.addEventListener("click", function (e) {
    const id = e.target.getAttribute("data-id");
    console.log(id);

    swal({
      title: "Are you sure?",
      text: "Once deleted, you will not be able to recover this coupon!",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then((willDelete) => {
      if (willDelete) {
        deletecoupon(id);
      }
    });
    function deletecoupon(id) {
      fetch("/admin/deletecoupon", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: id }),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Success:", data);

          if (data) {
            swal(
              "Success!",
              "The coupon has been successfully deleted.",
              "success"
            ).then(() => {
              location.reload();
            });
          }
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    }
  });
});

const editmodal = document.getElementById("EditModal");

if (editmodal) {
  editmodal.addEventListener("show.bs.modal", (event) => {
    // Button that triggered the modal
    const button = event.relatedTarget;

    // Extract info from data-bs-* attributes
    const category = button.getAttribute("data-coupon");
    const nameid = button.getAttribute("data-nameId");
    const discription = button.getAttribute("data-discription");
    const expire = button.getAttribute("data-expire");
    const value = button.getAttribute("data-discountValue");
    const limit = button.getAttribute("data-userlimit");
    const id = button.getAttribute("data-id");

    // Update the modal's content.
    const modalTitle = document.getElementById("editModalLabel");
    const categoryname = document.getElementById("editcategory-name");
    const expiredate = document.getElementById("editexpire-date");
    const discountvalue = document.getElementById("editdiscount-value");
    const discriptionText = document.getElementById("editcouponDiscription");
    const CouponName = document.getElementById("editcoupon-id");
    const userLimit = document.getElementById("edituser-limit");
    const couponId = document.getElementById("editcategory-id");

    nameid.value = CouponName;
    expiredate.value = expire;
    discountvalue.value = value;
    discriptionText.value = discription;
    CouponName.value = nameid;
    userLimit.value = limit;
    couponId.value = id;
    modalTitle.textContent = `Edit Coupon : ${category}`;
    categoryname.value = category;
  });
}

const search = document.querySelector(".input-group1 input"),
  table_rows = document.querySelectorAll("tbody tr"),
  table_headings = document.querySelectorAll("thead th");

// 1. Searching for specific data of HTML table
search.addEventListener("input", searchTable);

function searchTable() {
  table_rows.forEach((row, i) => {
    let table_data = row.textContent.toLowerCase(),
      search_data = search.value.toLowerCase();

    row.classList.toggle("hide", table_data.indexOf(search_data) < 0);
    row.style.setProperty("--delay", i / 25 + "s");
  });

  document.querySelectorAll("tbody tr:not(.hide)").forEach((visible_row, i) => {
    visible_row.style.backgroundColor =
      i % 2 == 0 ? "transparent" : "#0000000b";
  });
}

// 2. Sorting | Ordering data of HTML table

table_headings.forEach((head, i) => {
  let sort_asc = true;
  head.onclick = () => {
    table_headings.forEach((head) => head.classList.remove("active"));
    head.classList.add("active");

    document
      .querySelectorAll("td")
      .forEach((td) => td.classList.remove("active"));
    table_rows.forEach((row) => {
      row.querySelectorAll("td")[i].classList.add("active");
    });

    head.classList.toggle("asc", sort_asc);
    sort_asc = head.classList.contains("asc") ? false : true;

    sortTable(i, sort_asc);
  };
});

function sortTable(column, sort_asc) {
  [...table_rows]
    .sort((a, b) => {
      let first_row = a
          .querySelectorAll("td")
          [column].textContent.toLowerCase(),
        second_row = b.querySelectorAll("td")[column].textContent.toLowerCase();

      return sort_asc
        ? first_row < second_row
          ? 1
          : -1
        : first_row < second_row
        ? -1
        : 1;
    })
    .map((sorted_row) =>
      document.querySelector("tbody").appendChild(sorted_row)
    );
}

// 3. Converting HTML table to PDF

const pdf_btn = document.querySelector("#toPDF");
const customers_table = document.querySelector("#customers_table");

const toPDF = function (customers_table) {
  const html_code = `
    <!DOCTYPE html>
    <link rel="stylesheet" type="text/css" href="style.css">
    <main class="table" id="customers_table">${customers_table.innerHTML}</main>`;

  const new_window = window.open();
  new_window.document.write(html_code);

  setTimeout(() => {
    new_window.print();
    new_window.close();
  }, 400);
};

pdf_btn.onclick = () => {
  toPDF(customers_table);
};

// 4. Converting HTML table to JSON

const json_btn = document.querySelector("#toJSON");

const toJSON = function (table) {
  let table_data = [],
    t_head = [],
    t_headings = table.querySelectorAll("th"),
    t_rows = table.querySelectorAll("tbody tr");

  for (let t_heading of t_headings) {
    let actual_head = t_heading.textContent.trim().split(" ");

    t_head.push(
      actual_head
        .splice(0, actual_head.length - 1)
        .join(" ")
        .toLowerCase()
    );
  }

  t_rows.forEach((row) => {
    const row_object = {},
      t_cells = row.querySelectorAll("td");

    t_cells.forEach((t_cell, cell_index) => {
      const img = t_cell.querySelector("img");
      if (img) {
        row_object["customer image"] = decodeURIComponent(img.src);
      }
      row_object[t_head[cell_index]] = t_cell.textContent.trim();
    });
    table_data.push(row_object);
  });

  return JSON.stringify(table_data, null, 4);
};

json_btn.onclick = () => {
  const json = toJSON(customers_table);
  downloadFile(json, "json");
};

// 5. Converting HTML table to CSV File

const csv_btn = document.querySelector("#toCSV");

const toCSV = function (table) {
  // Code For SIMPLE TABLE
  // const t_rows = table.querySelectorAll('tr');
  // return [...t_rows].map(row => {
  //     const cells = row.querySelectorAll('th, td');
  //     return [...cells].map(cell => cell.textContent.trim()).join(',');
  // }).join('\n');

  const t_heads = table.querySelectorAll("th"),
    tbody_rows = table.querySelectorAll("tbody tr");

  const headings =
    [...t_heads]
      .map((head) => {
        let actual_head = head.textContent.trim().split(" ");
        return actual_head
          .splice(0, actual_head.length - 1)
          .join(" ")
          .toLowerCase();
      })
      .join(",") +
    "," +
    "image name";

  const table_data = [...tbody_rows]
    .map((row) => {
      const cells = row.querySelectorAll("td"),
        img = decodeURIComponent(row.querySelector("img").src),
        data_without_img = [...cells]
          .map((cell) => cell.textContent.replace(/,/g, ".").trim())
          .join(",");

      return data_without_img + "," + img;
    })
    .join("\n");

  return headings + "\n" + table_data;
};

csv_btn.onclick = () => {
  const csv = toCSV(customers_table);
  downloadFile(csv, "csv", "customer orders");
};

// 6. Converting HTML table to EXCEL File

const excel_btn = document.querySelector("#toEXCEL");

const toExcel = function (table) {
  // Code For SIMPLE TABLE
  // const t_rows = table.querySelectorAll('tr');
  // return [...t_rows].map(row => {
  //     const cells = row.querySelectorAll('th, td');
  //     return [...cells].map(cell => cell.textContent.trim()).join('\t');
  // }).join('\n');

  const t_heads = table.querySelectorAll("th"),
    tbody_rows = table.querySelectorAll("tbody tr");

  const headings =
    [...t_heads]
      .map((head) => {
        let actual_head = head.textContent.trim().split(" ");
        return actual_head
          .splice(0, actual_head.length - 1)
          .join(" ")
          .toLowerCase();
      })
      .join("\t") +
    "\t" +
    "image name";

  const table_data = [...tbody_rows]
    .map((row) => {
      const cells = row.querySelectorAll("td"),
        img = decodeURIComponent(row.querySelector("img").src),
        data_without_img = [...cells]
          .map((cell) => cell.textContent.trim())
          .join("\t");

      return data_without_img + "\t" + img;
    })
    .join("\n");

  return headings + "\n" + table_data;
};

excel_btn.onclick = () => {
  const excel = toExcel(customers_table);
  downloadFile(excel, "excel");
};

const downloadFile = function (data, fileType, fileName = "") {
  const a = document.createElement("a");
  a.download = fileName;
  const mime_types = {
    json: "application/json",
    csv: "text/csv",
    excel: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  };
  a.href = `
        data:${mime_types[fileType]};charset=utf-8,${encodeURIComponent(data)}
    `;
  document.body.appendChild(a);
  a.click();
  a.remove();
};
