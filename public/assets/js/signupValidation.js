function  Validation()
{

  let password=document.getElementsByName("password").value
  let confirmpassword=document.getElementById('comfirm_password').value
  let email=document.getElementById('email').value
  let name=document.getElementById('fullName').value
  let mobile=document.getElementsByName('mobile').value
  let emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  let nameRegex=/^[a-zA-Z]+(?: [a-zA-Z]+)?$/;
  let mobileRegex= /^\d{10}$/


  let alert=document.getElementById('validation-alert')
  let emailalert=document.getElementById('validation-alert')
  let nameAlert=document.getElementById('validation-alert')

  if(password!=confirmpassword)
  {
    alert.innerHTML="Password Not Matching"
    return false
  }else if(!email.match(emailRegex))
  {
     emailalert.innerHTML="Email Not Valid"
    return false
  }else if(!name.match(nameRegex))
  {
    nameAlert.innerHTML="Name Not Allowed"
    return false
  }else if(!mobile.match(mobileRegex))
  {
	return false
  }else
  {
    return true
  }

}

