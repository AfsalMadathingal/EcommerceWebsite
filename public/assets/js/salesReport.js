
document.addEventListener("DOMContentLoaded", () => {
  const totalAmount = document.querySelectorAll(".total-amount");
  const grand = document.getElementById("grand-total");
  var toatalValue = 0;
  totalAmount.forEach((e) => {
    const amount = Number(e.getAttribute("data-value"));

    toatalValue += amount;
  });

  grand.innerText = `₹ ${toatalValue}`;

  // Filter report by date range
  document
    .querySelector("button.btn.btn-primary")
    .addEventListener("click", function () {
      console.log("clicked");
      const table = document.getElementById("initial");

      // Check if the table element exists
      if (table) {
        // If the table element exists, remove it from the DOM
        table.remove();
      }
      var fromDate = document.getElementById("fromDate").value;
      var toDate = document.getElementById("toDate").value;

   
      const [year, month, day] = fromDate.split("-");

      let [year2, month2, day2] = toDate.split("-");
      day2++;

     
      const convertedFromDateString = `${month}/${day}/${year}`;
      const convertedToDateString = `${month2}/${day2}/${year2}`;

  
      fetch("/admin/salesReport/filterReport/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fromDate: convertedFromDateString,
          toDate: convertedToDateString,
        }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          console.log(response);
          return response.json();
        })
        .then((data) => {
          // Refactored code to fix rendering issues
          console.log(data);

          // Check if data is an array and has elements
          if (Array.isArray(data) && data.length > 0) {
            const source = `
        <table class="table table-invoice" id="filtered">
            <thead>
                <tr>
                    <th>Date Range</th>
                    <th class="text-center" width="20%">Total Orders</th>
                    <th class="text-right" width="20%">Total Revenue</th>
                </tr>
            </thead>
            <tbody>
                {{#each this}}
                <tr>
                    <td>
                        <span class="text-inverse">{{orderDate}}</span><br>
                    </td>
                    <td class="text-center">1</td>
                    <td class="text-center total-amount" data-value="{{orderAmount}}">₹ {{orderAmount}}</td>
                </tr>
                {{/each}}
            </tbody>
        </table>`;
            const template = Handlebars.compile(source);

            // Render the template with the fetched data
            const renderedHTML = template(data);
            document.getElementById("salesReport").innerHTML = renderedHTML;
          } else {
            console.error("No data to render");
            document.getElementById("table-container").innerHTML =
              "<p>No data available.</p>";
          }
        })
        .catch((error) => {
          // Handle any error
          console.error("Error fetching data:", error);
        });
    });
});

$(document).ready(function () {
  $("#exportPdf").on("click", function () {
    // Options for the PDF export
    var options = {
      margin: 10,
      filename: "invoice.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };

    // Target the container containing your invoice content
    var element = document.querySelector(".invoice");

    // Call html2pdf function
    html2pdf(element, options);
  });
});
