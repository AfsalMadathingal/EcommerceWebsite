



const loadCustomerService = (req, res) => {
    
try {

    if (req.session.user_id) {
        res.render("user/customerSupport",{
            user:true,
            id:req.session.user_id
    
    
        })
    
    }
    else {
        res.redirect("/user_login_form");
    }
    
  
} catch (error) {
    
}
}








module.exports = {
    loadCustomerService
}