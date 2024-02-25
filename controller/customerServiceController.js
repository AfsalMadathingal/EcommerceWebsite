



const loadCustomerService = (req, res) => {
    
try {

    const adminId = '65a89a47ca2117119ee26625'

    if (req.session.user_id) {
        res.render("user/customerSupport",{
            user:true,
            id:req.session.user_id,
            receiverId:adminId
    
    
        })
    
    }
    else {
        res.redirect("/user_login_form");
    }
    
  
} catch (error) {
    
}
}








module.exports = {
    loadCustomerService,
   
}