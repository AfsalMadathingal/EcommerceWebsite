
const loadCustomerService = async (req, res) => {
    
try {



    const adminId = '65a89a47ca2117119ee26625'
    res.render("user/customerSupport",{
            user:true,
            id:req.session.user_id,
            receiverId:adminId,
            userId:req.session.user_id,
            title:"Customer Support"
    })
  
    
    
  
} catch (error) {

    res.status(500).send("error")
    console.log(error);
}
}








module.exports = {
    loadCustomerService,
}