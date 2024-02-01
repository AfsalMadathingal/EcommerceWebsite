function  Validation()
{

 
  let productName = document.getElementById("productName").value;

  let longdescription = document.getElementById("longdescription").value;
  let Qty = document.getElementById("Qty").value;
  let price = document.getElementById("price").value;
  let cost = document.getElementById("cost").value;
  let Barcode = document.getElementById("Barcode").value;
  let ProductId = document.getElementById("ProductId").value;

  let productNameRegex = /^\s*.*\S.*\s*$/
  let number = /^[1-9]\d*$/;
  let descriptionRegex=/^(?!\s*$)[\s\S]{1,}$/


  let productNameAlert = document.getElementById("productNameAlert");
  let qtyAlert = document.getElementById("qtyAlert");
  let priceAlert = document.getElementById("priceAlert");
  let costAlert = document.getElementById("costAlert");
  let BarcodeAlert = document.getElementById("BarcodeAlert");
  let ProductIdAlert = document.getElementById("ProductIdAlert");
  let longAlert = document.getElementById("longAlert");

  if (!productName.match(productNameRegex)) {
    productNameAlert.innerHTML = "Name Not Valid";
    return false;
  } else if (!Qty.match(number)) {
    qtyAlert.innerHTML = "Please Check Qty Again";
    return false;
  } else if (!price.match(number)) {
    priceAlert.innerHTML = "Please Check Price Again";
    return false;
  } else if (!cost.match(number)) {
    costAlert.innerHTML = "Please Check Cost Again";
    return false;
  } else if (!Barcode.match(number)) {
    BarcodeAlert.innerHTML = "Please Check Barcode Again";
    return false;
  } else if (!ProductId.match(number)) {
    ProductIdAlert.innerHTML = "Please Check Id Again";
    return false;
  } 
  else if (!longdescription.match(descriptionRegex)) {
    longAlert.innerHTML = "Please Check about Again";
    return false;
  } 
  
  else {
    return true;
  }

}

